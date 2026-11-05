"""Agentic workflow — orchestrates the 8-agent risk assessment pipeline.

Pipeline:
  START → intake → extraction → [CHECKPOINT: post_extraction]
       → reconciliation → [regulation + risk_process + esg in parallel]
       → [CHECKPOINT: post_regulation] → historical → decision
       → [CHECKPOINT: pre_decision] → END

Checkpoints pause the workflow and require human approval before continuing,
satisfying GDPR Art. 22 and AI Act requirements for meaningful human oversight.
"""

import asyncio
import hashlib
import logging
from datetime import UTC, datetime
from typing import TypedDict

from app.agents.decision_agent import run_decision_agent
from app.agents.esg_agent import run_esg_agent
from app.agents.extraction_agent import run_extraction_agent
from app.agents.historical_agent import run_historical_agent
from app.agents.intake_agent import run_intake_agent
from app.agents.reconciliation_agent import run_reconciliation_agent
from app.agents.regulation_agent import run_regulation_agent
from app.agents.risk_process_agent import run_risk_process_agent
from app.config import settings
from app.database import async_session
from app.models.agent_run import AgentRun
from app.models.case import Case
from app.models.case_finding import CaseFinding
from app.models.document import Document
from app.models.document_extraction import DocumentExtraction
from app.models.esg_assessment import EsgAssessment
from app.models.evidence_ref import EvidenceRef
from app.models.historical_case import HistoricalCase
from app.models.regulation_source import RegulationSource
from app.models.risk_assessment import RiskAssessment
from app.models.workflow_checkpoint import WorkflowCheckpoint

logger = logging.getLogger(__name__)

# All 8 agents in pipeline order
AGENT_NAMES = [
    "intake_agent",
    "extraction_agent",
    "reconciliation_agent",
    "regulation_agent",
    "risk_process_agent",
    "esg_agent",
    "historical_agent",
    "decision_agent",
]

# Checkpoints that pause the workflow for human review
CHECKPOINT_AFTER = {
    "extraction_agent": "post_extraction",
    "esg_agent": "post_regulation",  # fires after the parallel block
    "decision_agent": "pre_decision",
}


class CaseAnalysisState(TypedDict, total=False):
    """State passed through the workflow."""

    case_id: str
    case_data: dict
    documents: list[dict]
    extractions: list[dict]
    intake_output: dict
    extraction_output: dict
    reconciliation_output: dict
    regulation_output: dict
    process_output: dict
    esg_output: dict
    historical_output: dict
    decision_output: dict
    errors: list[str]


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------


async def _update_agent_run(
    case_id: str,
    agent_name: str,
    status: str,
    output: dict | None = None,
    error: str | None = None,
) -> None:
    """Update the agent_run record in the database."""
    async with async_session() as session:
        from sqlalchemy import and_, select

        result = await session.execute(
            select(AgentRun).where(
                and_(
                    AgentRun.case_id == case_id,
                    AgentRun.agent_name == agent_name,
                    AgentRun.status.in_(["pending", "running"]),
                )
            )
        )
        run = result.scalars().first()
        if run:
            now = datetime.now(UTC)
            if status == "running":
                run.started_at = now
            elif status in ("completed", "failed"):
                run.ended_at = now
            run.status = status
            if output:
                run.output_snapshot = output
            if error:
                run.error_message = error
            await session.commit()


async def _load_case_data(case_id: str) -> tuple[dict, list[dict], list[dict]]:
    """Load case, documents, and extractions from DB."""
    async with async_session() as session:
        from sqlalchemy import select

        # Load case
        result = await session.execute(select(Case).where(Case.id == case_id))
        case = result.scalar_one()
        case_data = {
            "id": str(case.id),
            "case_number": case.case_number,
            "company_name": case.company_name,
            "sector": case.sector,
            "country": case.country,
            "status": case.status,
            "esg_relevant": case.esg_relevant,
        }

        # Load documents
        result = await session.execute(
            select(Document).where(Document.case_id == case_id)
        )
        docs = result.scalars().all()
        documents = [
            {
                "id": str(d.id),
                "filename": d.filename,
                "file_type": d.file_type,
                "storage_path": d.storage_path,
                "file_size": d.file_size,
                "parsed_status": d.parsed_status,
            }
            for d in docs
        ]

        # Load extractions
        doc_ids = [d.id for d in docs]
        extractions = []
        if doc_ids:
            result = await session.execute(
                select(DocumentExtraction).where(
                    DocumentExtraction.document_id.in_(doc_ids)
                )
            )
            exts = result.scalars().all()
            extractions = [
                {
                    "document_id": str(e.document_id),
                    "extracted_text": e.extracted_text,
                    "extracted_json": e.extracted_json,
                    "confidence": e.confidence,
                }
                for e in exts
            ]

        return case_data, documents, extractions


async def _load_regulations() -> list[dict]:
    """Load active regulation sources."""
    async with async_session() as session:
        from sqlalchemy import select

        result = await session.execute(
            select(RegulationSource).where(RegulationSource.active.is_(True))
        )
        regs = result.scalars().all()
        return [
            {
                "id": str(r.id),
                "source_name": r.source_name,
                "source_type": r.source_type,
                "version": r.version,
                "content_text": r.content_text,
            }
            for r in regs
        ]


async def _load_historical_cases() -> list[dict]:
    """Load active historical cases for similarity search."""
    async with async_session() as session:
        from sqlalchemy import select

        result = await session.execute(
            select(HistoricalCase).where(HistoricalCase.active.is_(True))
        )
        cases = result.scalars().all()
        return [
            {
                "id": str(c.id),
                "company_name": c.company_name,
                "sector": c.sector,
                "country": c.country,
                "revenue_band": c.revenue_band,
                "debt_profile": c.debt_profile,
                "outcome": c.outcome,
                "final_risk_class": c.final_risk_class,
                "decision_notes": c.decision_notes,
                "closed_at": str(c.closed_at) if c.closed_at else None,
            }
            for c in cases
        ]


# ---------------------------------------------------------------------------
# Checkpoint management
# ---------------------------------------------------------------------------


async def _create_checkpoint(case_id: str, checkpoint_name: str) -> None:
    """Create a workflow checkpoint that pauses the pipeline for human review."""
    async with async_session() as session:
        from sqlalchemy import select

        session.add(
            WorkflowCheckpoint(
                case_id=case_id,
                checkpoint_name=checkpoint_name,
                status="pending",
            )
        )

        result = await session.execute(select(Case).where(Case.id == case_id))
        case = result.scalar_one_or_none()
        if case:
            case.workflow_paused_at_checkpoint = checkpoint_name
            case.status = "checkpoint_pending"

        await session.commit()

    logger.info(f"Workflow paused at checkpoint '{checkpoint_name}' for case {case_id}")


async def _get_pending_checkpoint(case_id: str, checkpoint_name: str) -> dict | None:
    """Check if a checkpoint is pending."""
    async with async_session() as session:
        from sqlalchemy import and_, select

        result = await session.execute(
            select(WorkflowCheckpoint).where(
                and_(
                    WorkflowCheckpoint.case_id == case_id,
                    WorkflowCheckpoint.checkpoint_name == checkpoint_name,
                    WorkflowCheckpoint.status == "pending",
                )
            )
        )
        cp = result.scalars().first()
        if cp:
            return {
                "id": str(cp.id),
                "checkpoint_name": cp.checkpoint_name,
                "status": cp.status,
            }
        return None


async def _load_agent_outputs(case_id: str) -> dict:
    """Load completed agent outputs from DB to resume a paused workflow."""
    async with async_session() as session:
        from sqlalchemy import select

        result = await session.execute(
            select(AgentRun).where(
                AgentRun.case_id == case_id,
                AgentRun.status == "completed",
            )
        )
        runs = result.scalars().all()
        return {run.agent_name: run.output_snapshot or {} for run in runs}


# ---------------------------------------------------------------------------
# Evidence provenance helpers
# ---------------------------------------------------------------------------


def _compute_artifact_id(text: str, file_type: str) -> str:
    """Compute a deterministic artifact ID from document content."""
    sha = hashlib.sha256(text.encode("utf-8", errors="replace")).hexdigest()[:16]
    date_str = datetime.now(UTC).strftime("%Y-%m-%d")
    return f"doc:{date_str}:{file_type}:{sha}"


def _get_generated_by() -> str:
    """Build the generated_by provenance string."""
    llm_backend = getattr(settings, "llm_backend", "mock")
    return f"{llm_backend}:v1:policy_bundle_v4.2"


# ---------------------------------------------------------------------------
# Persistence
# ---------------------------------------------------------------------------


async def _save_findings(
    case_id: str,
    decision_output: dict,
    esg_output: dict | None = None,
    reconciliation_output: dict | None = None,
    extraction_output: dict | None = None,
) -> None:
    """Save findings, ESG assessment, and risk assessment to the database."""
    from sqlalchemy import delete, select

    async with async_session() as session:
        cid = case_id

        # ── Deduplication: remove previous findings for this case ──
        old_findings = await session.execute(
            select(CaseFinding.id).where(CaseFinding.case_id == cid)
        )
        old_ids = [row[0] for row in old_findings.all()]
        if old_ids:
            await session.execute(
                delete(EvidenceRef).where(EvidenceRef.finding_id.in_(old_ids))
            )
            await session.execute(delete(CaseFinding).where(CaseFinding.case_id == cid))
        # Also remove old risk assessments & ESG assessments so they refresh
        await session.execute(
            delete(RiskAssessment).where(RiskAssessment.case_id == cid)
        )
        await session.execute(delete(EsgAssessment).where(EsgAssessment.case_id == cid))
        await session.flush()

        # Build artifact ID map from extractions
        artifact_map: dict[str, str] = {}
        if extraction_output:
            for ext in extraction_output.get("enhanced_extractions", []):
                doc_id = ext.get("document_id", "")
                sections = ext.get("parser_sections", [])
                text_sample = ""
                for s in sections[:2]:
                    if isinstance(s, dict):
                        text_sample += s.get("content", "")
                if text_sample:
                    artifact_map[doc_id] = _compute_artifact_id(text_sample, "extract")

        artifact_ids_list = list(artifact_map.values())

        # Save risk factors as findings
        for rf in decision_output.get("risk_factors", []):
            finding = CaseFinding(
                case_id=cid,
                finding_type="risk_factor",
                severity=_map_severity(rf.get("level", "info")),
                title=rf.get("factor", "Unknown"),
                description=rf.get("detail", ""),
                source_refs={"source": "decision_agent"},
                evidence_artifact_ids=artifact_ids_list,
                created_by_agent="decision_agent",
            )
            session.add(finding)
            await session.flush()

            # Create evidence refs
            for doc_id, art_id in artifact_map.items():
                session.add(
                    EvidenceRef(
                        finding_id=finding.id,
                        artifact_id=art_id,
                        source_type="borrower",
                        description=f"Extracted from document {doc_id}",
                    )
                )

        # Save missing items as findings
        for item in decision_output.get("missing_items", []):
            session.add(
                CaseFinding(
                    case_id=cid,
                    finding_type="missing_information",
                    severity="warning",
                    title="Missing: " + item[:200],
                    description=item,
                    source_refs={"source": "decision_agent"},
                    evidence_artifact_ids=[],
                    created_by_agent="decision_agent",
                )
            )

        # Save deterministic check issues
        det_checks = decision_output.get("deterministic_checks", {})
        for issue in det_checks.get("critical_issues", []):
            session.add(
                CaseFinding(
                    case_id=cid,
                    finding_type="critical_issue",
                    severity="critical",
                    title=issue[:200],
                    description=issue,
                    source_refs={"source": "deterministic_checks"},
                    evidence_artifact_ids=artifact_ids_list,
                    created_by_agent="decision_agent",
                )
            )

        # Save reconciliation anomalies as findings
        if reconciliation_output:
            for anomaly in reconciliation_output.get("anomalies", []):
                finding = CaseFinding(
                    case_id=cid,
                    finding_type="reconciliation",
                    severity=anomaly.get("severity", "warning"),
                    title=anomaly.get("type", "anomaly")[:200],
                    description=anomaly.get("description", ""),
                    source_refs={
                        "source": "reconciliation_agent",
                        "affected_fields": anomaly.get("affected_fields", []),
                    },
                    evidence_artifact_ids=artifact_ids_list,
                    created_by_agent="reconciliation_agent",
                )
                session.add(finding)
                await session.flush()

                for doc_id, art_id in artifact_map.items():
                    session.add(
                        EvidenceRef(
                            finding_id=finding.id,
                            artifact_id=art_id,
                            source_type="borrower",
                            description=f"Reconciliation check on document {doc_id}",
                        )
                    )

        # Save ESG assessment
        if esg_output and esg_output.get("status") == "completed":
            session.add(
                EsgAssessment(
                    case_id=cid,
                    climate_risk_rating=esg_output.get("climate_risk_rating"),
                    environmental_flags=esg_output.get("environmental_flags"),
                    social_flags=esg_output.get("social_flags"),
                    governance_flags=esg_output.get("governance_flags"),
                    taxonomy_alignment=esg_output.get("taxonomy_alignment"),
                    missing_esg_data=esg_output.get("missing_esg_data"),
                    esg_risk_horizon=esg_output.get("esg_risk_horizon"),
                    confidence=esg_output.get("confidence"),
                    details=esg_output,
                )
            )

            # Save ESG flags as findings too
            for flag in esg_output.get("environmental_flags", []):
                if isinstance(flag, dict):
                    session.add(
                        CaseFinding(
                            case_id=cid,
                            finding_type="esg",
                            severity=flag.get("severity", "info"),
                            title=flag.get("flag", "ESG flag")[:200],
                            description=flag.get("detail", ""),
                            source_refs={"source": "esg_agent"},
                            evidence_artifact_ids=artifact_ids_list,
                            created_by_agent="esg_agent",
                        )
                    )

        # Save risk assessment
        session.add(
            RiskAssessment(
                case_id=cid,
                proposed_risk_class=decision_output.get(
                    "proposed_risk_class", "Unknown"
                ),
                compliance_status=decision_output.get("compliance_status", "unknown"),
                recommendation=decision_output.get("recommendation"),
                reasoning=decision_output.get("reasoning"),
                confidence=decision_output.get("confidence"),
                details=decision_output,
                generated_by=_get_generated_by(),
            )
        )

        # NOTE: Do NOT set case.status here — _create_checkpoint() will set it
        # to "checkpoint_pending" right after this function returns.
        # Setting "review_ready" + committing creates a race window where
        # the frontend poll can catch an intermediate status.

        await session.commit()


def _map_severity(level: str) -> str:
    """Map risk level to finding severity."""
    return {
        "low": "info",
        "moderate": "warning",
        "elevated": "high",
        "high": "critical",
    }.get(level, "info")


# ---------------------------------------------------------------------------
# Agent runners with tracking (for parallel execution)
# ---------------------------------------------------------------------------


async def _run_regulation_with_tracking(
    case_id: str, case_data: dict, extraction_output: dict, regulations: list[dict]
) -> dict:
    """Run regulation agent with DB tracking."""
    await _update_agent_run(case_id, "regulation_agent", "running")
    try:
        output = await run_regulation_agent(case_data, extraction_output, regulations)
        await _update_agent_run(case_id, "regulation_agent", "completed", output)
        return output
    except Exception as e:
        await _update_agent_run(case_id, "regulation_agent", "failed", error=str(e))
        raise


async def _run_process_with_tracking(
    case_id: str, case_data: dict, extraction_output: dict
) -> dict:
    """Run risk process agent with DB tracking."""
    await _update_agent_run(case_id, "risk_process_agent", "running")
    try:
        output = await run_risk_process_agent(case_data, extraction_output)
        await _update_agent_run(case_id, "risk_process_agent", "completed", output)
        return output
    except Exception as e:
        await _update_agent_run(case_id, "risk_process_agent", "failed", error=str(e))
        raise


async def _run_esg_with_tracking(
    case_id: str, case_data: dict, extraction_output: dict, regulations: list[dict]
) -> dict:
    """Run ESG agent with DB tracking."""
    await _update_agent_run(case_id, "esg_agent", "running")
    try:
        output = await run_esg_agent(case_data, extraction_output, regulations)
        await _update_agent_run(case_id, "esg_agent", "completed", output)
        return output
    except Exception as e:
        await _update_agent_run(case_id, "esg_agent", "failed", error=str(e))
        raise


# ---------------------------------------------------------------------------
# Abort helper — marks case as failed when an agent errors out
# ---------------------------------------------------------------------------


async def _fail_case(case_id: str, errors: list[str]) -> dict:
    """Mark the case as failed and return a terminal result."""
    async with async_session() as session:
        from sqlalchemy import and_, select

        result = await session.execute(select(Case).where(Case.id == case_id))
        case = result.scalar_one_or_none()
        if case:
            case.status = "failed"
            case.workflow_paused_at_checkpoint = None

        result = await session.execute(
            select(AgentRun).where(
                and_(
                    AgentRun.case_id == case_id,
                    AgentRun.status.in_(["pending", "running"]),
                )
            )
        )
        unfinished_runs = result.scalars().all()
        error_text = "; ".join(errors)[:1000] if errors else "Workflow aborted"
        now = datetime.now(UTC)
        for run in unfinished_runs:
            run.status = "failed"
            run.error_message = error_text
            if not run.started_at:
                run.started_at = now
            run.ended_at = now

        await session.commit()

    logger.error(f"Workflow aborted for case {case_id}: {errors}")
    return {"status": "failed", "errors": errors, "case_id": case_id}


# ---------------------------------------------------------------------------
# Concurrency guard — prevents two workflow runs for the same case
# ---------------------------------------------------------------------------
_running_workflows: set[str] = set()


# ---------------------------------------------------------------------------
# Main workflow
# ---------------------------------------------------------------------------


async def run_workflow(case_id: str, resume_from: str | None = None) -> dict:
    """Execute the 8-agent workflow for a case.

    If resume_from is set, skip agents that already completed and continue
    from the checkpoint.

    Pipeline:
      intake → extraction → [CHECKPOINT] → reconciliation
      → [regulation + risk_process + esg (parallel)] → [CHECKPOINT]
      → historical → decision → [CHECKPOINT] → END
    """
    # ── Concurrency guard ──────────────────────────────────────────────────
    if case_id in _running_workflows:
        logger.warning(
            "Workflow already running for case %s — skipping duplicate invocation",
            case_id,
        )
        return {
            "status": "skipped",
            "errors": ["Duplicate workflow invocation"],
            "case_id": case_id,
        }
    _running_workflows.add(case_id)

    errors: list[str] = []

    try:
        # Load data
        case_data, documents, extractions = await _load_case_data(case_id)
        regulations = await _load_regulations()
        historical_cases = await _load_historical_cases()

        # If resuming, load previously completed agent outputs
        prior_outputs = {}
        if resume_from:
            prior_outputs = await _load_agent_outputs(case_id)

        # Determine which phases to skip based on resume point
        skip_phase_1 = resume_from in (
            "post_extraction",
            "post_regulation",
            "pre_decision",
        )
        skip_phase_2 = resume_from in ("post_regulation", "pre_decision")
        skip_phase_3 = resume_from == "pre_decision"

        # =====================================================================
        # PHASE 1: Intake + Extraction
        # =====================================================================
        if not skip_phase_1:
            # 1. Intake Agent
            await _update_agent_run(case_id, "intake_agent", "running")
            try:
                intake_output = await run_intake_agent(case_data, documents)
                await _update_agent_run(
                    case_id, "intake_agent", "completed", intake_output
                )
            except Exception as e:
                logger.error(f"Intake agent failed: {e}")
                await _update_agent_run(case_id, "intake_agent", "failed", error=str(e))
                errors.append(f"intake_agent: {e}")
                return await _fail_case(case_id, errors)

            # 2. Extraction Agent
            await _update_agent_run(case_id, "extraction_agent", "running")
            try:
                extraction_output = await run_extraction_agent(documents, extractions)
                await _update_agent_run(
                    case_id, "extraction_agent", "completed", extraction_output
                )
            except Exception as e:
                logger.error(f"Extraction agent failed: {e}")
                await _update_agent_run(
                    case_id, "extraction_agent", "failed", error=str(e)
                )
                errors.append(f"extraction_agent: {e}")
                return await _fail_case(case_id, errors)

            # --- CHECKPOINT: post_extraction ---
            if errors:
                return await _fail_case(case_id, errors)
            await _create_checkpoint(case_id, "post_extraction")
            return {
                "status": "paused",
                "checkpoint": "post_extraction",
                "errors": errors,
                "case_id": case_id,
            }
        else:
            extraction_output = prior_outputs.get(
                "extraction_agent",
                {
                    "document_count": 0,
                    "aggregated_entities": [],
                    "aggregated_metrics": [],
                    "enhanced_extractions": [],
                },
            )

        # =====================================================================
        # PHASE 2: Reconciliation + Parallel (Regulation, Risk Process, ESG)
        # =====================================================================
        if not skip_phase_2:
            # 3. Reconciliation Agent
            await _update_agent_run(case_id, "reconciliation_agent", "running")
            try:
                reconciliation_output = await run_reconciliation_agent(
                    extraction_output
                )
                await _update_agent_run(
                    case_id,
                    "reconciliation_agent",
                    "completed",
                    reconciliation_output,
                )
            except Exception as e:
                logger.error(f"Reconciliation agent failed: {e}")
                await _update_agent_run(
                    case_id, "reconciliation_agent", "failed", error=str(e)
                )
                errors.append(f"reconciliation_agent: {e}")
                reconciliation_output = {"anomalies": [], "passing_checks": []}

            # 4, 5, 6. Regulation + Risk Process + ESG (parallel)
            regulation_task = _run_regulation_with_tracking(
                case_id, case_data, extraction_output, regulations
            )
            process_task = _run_process_with_tracking(
                case_id, case_data, extraction_output
            )
            esg_task = _run_esg_with_tracking(
                case_id, case_data, extraction_output, regulations
            )

            results = await asyncio.gather(
                regulation_task, process_task, esg_task, return_exceptions=True
            )

            regulation_output = (
                results[0] if not isinstance(results[0], Exception) else {}
            )
            process_output = results[1] if not isinstance(results[1], Exception) else {}
            esg_output = results[2] if not isinstance(results[2], Exception) else {}

            if isinstance(results[0], Exception):
                errors.append(f"regulation_agent: {results[0]}")
            if isinstance(results[1], Exception):
                errors.append(f"risk_process_agent: {results[1]}")
            if isinstance(results[2], Exception):
                errors.append(f"esg_agent: {results[2]}")

            # --- CHECKPOINT: post_regulation ---
            if errors:
                return await _fail_case(case_id, errors)
            await _create_checkpoint(case_id, "post_regulation")
            return {
                "status": "paused",
                "checkpoint": "post_regulation",
                "errors": errors,
                "case_id": case_id,
            }
        else:
            reconciliation_output = prior_outputs.get(
                "reconciliation_agent", {"anomalies": [], "passing_checks": []}
            )
            regulation_output = prior_outputs.get("regulation_agent", {})
            process_output = prior_outputs.get("risk_process_agent", {})
            esg_output = prior_outputs.get("esg_agent", {})

        # =====================================================================
        # PHASE 3: Historical + Decision
        # =====================================================================
        if not skip_phase_3:
            # 7. Historical Similarity Agent
            await _update_agent_run(case_id, "historical_agent", "running")
            try:
                historical_output = await run_historical_agent(
                    case_data, historical_cases
                )
                await _update_agent_run(
                    case_id, "historical_agent", "completed", historical_output
                )
            except Exception as e:
                logger.error(f"Historical agent failed: {e}")
                await _update_agent_run(
                    case_id, "historical_agent", "failed", error=str(e)
                )
                errors.append(f"historical_agent: {e}")
                historical_output = {"similar_cases": []}

            # 8. Decision Support Agent
            await _update_agent_run(case_id, "decision_agent", "running")
            try:
                decision_output = await run_decision_agent(
                    case_data,
                    extraction_output,
                    regulation_output,
                    process_output,
                    historical_output,
                )
                await _update_agent_run(
                    case_id, "decision_agent", "completed", decision_output
                )
            except Exception as e:
                logger.error(f"Decision agent failed: {e}")
                await _update_agent_run(
                    case_id, "decision_agent", "failed", error=str(e)
                )
                errors.append(f"decision_agent: {e}")
                decision_output = {}

            # Save all findings, ESG assessment, and risk assessment
            if decision_output:
                await _save_findings(
                    case_id,
                    decision_output,
                    esg_output=esg_output,
                    reconciliation_output=reconciliation_output,
                    extraction_output=extraction_output,
                )

            # --- CHECKPOINT: pre_decision ---
            if errors:
                return await _fail_case(case_id, errors)
            await _create_checkpoint(case_id, "pre_decision")
            return {
                "status": "paused",
                "checkpoint": "pre_decision",
                "errors": errors,
                "case_id": case_id,
            }

        # If we got here via resume_from="pre_decision", mark as done
        async with async_session() as session:
            from sqlalchemy import select

            result = await session.execute(select(Case).where(Case.id == case_id))
            case = result.scalar_one_or_none()
            if case:
                case.status = "review_ready"
                case.workflow_paused_at_checkpoint = None
            await session.commit()

        return {
            "status": "completed" if not errors else "completed_with_errors",
            "errors": errors,
            "case_id": case_id,
        }

    except Exception as e:
        logger.error(f"Workflow failed for case {case_id}: {e}")
        return {"status": "failed", "errors": [str(e)], "case_id": case_id}

    finally:
        _running_workflows.discard(case_id)


async def resume_workflow(case_id: str, checkpoint_name: str) -> dict:
    """Resume a paused workflow after checkpoint approval.

    Continues from the phase after the given checkpoint.
    """
    logger.info(
        f"Resuming workflow for case {case_id} from checkpoint '{checkpoint_name}'"
    )
    return await run_workflow(case_id, resume_from=checkpoint_name)


async def run_workflow_background(case_id: str) -> None:
    """Background task wrapper for the workflow."""
    try:
        result = await run_workflow(case_id)
        logger.info(f"Workflow completed for case {case_id}: {result['status']}")
    except Exception as e:
        logger.error(f"Background workflow failed for case {case_id}: {e}")
