"""Analysis API router.

Trigger analysis, get findings, risk assessments,
agent runs, ESG, checkpoints.
"""

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models.agent_run import AgentRun
from app.models.audit_log import AuditLog
from app.models.case import Case
from app.models.case_finding import CaseFinding
from app.models.esg_assessment import EsgAssessment
from app.models.risk_assessment import RiskAssessment
from app.models.user import User
from app.models.workflow_checkpoint import WorkflowCheckpoint
from app.schemas.analysis import (
    AgentRunListResponse,
    AnalyzeResponse,
    CheckpointActionRequest,
    CheckpointListResponse,
    EsgAssessmentResponse,
    FindingExplanationResponse,
    FindingListResponse,
    RiskAssessmentResponse,
)

router = APIRouter(tags=["analysis"])

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


@router.post("/cases/{case_id}/analyze", response_model=AnalyzeResponse)
async def trigger_analysis(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger the multi-agent analysis workflow for a case."""
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Case not found."
        )

    if case.status == "analyzing":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Analysis already in progress for this case.",
        )

    if case.status == "checkpoint_pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Case is paused at a checkpoint. Resolve the checkpoint before "
                "starting a new analysis."
            ),
        )

    # Check if analysis is already running
    running = await db.execute(
        select(AgentRun).where(
            AgentRun.case_id == case_id,
            AgentRun.status.in_(["pending", "running"]),
        )
    )
    if running.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Analysis already in progress for this case.",
        )

    # Clean up stale agent runs from previous analysis attempts
    from sqlalchemy import delete

    await db.execute(delete(AgentRun).where(AgentRun.case_id == case_id))

    # Also clean up stale checkpoints so the new run starts fresh
    await db.execute(
        delete(WorkflowCheckpoint).where(WorkflowCheckpoint.case_id == case_id)
    )
    await db.flush()

    # Create agent run entries for each agent in the pipeline
    agent_run_ids = []
    for agent_name in AGENT_NAMES:
        agent_run = AgentRun(
            case_id=case_id,
            agent_name=agent_name,
            status="pending",
        )
        db.add(agent_run)
        await db.flush()
        agent_run_ids.append(agent_run.id)

    # Update case status
    case.status = "analyzing"

    db.add(
        AuditLog(
            case_id=case_id,
            event_type="analysis_triggered",
            actor=current_user.full_name or current_user.username,
            payload={"agent_count": len(AGENT_NAMES)},
        )
    )
    await db.flush()

    # Trigger the workflow asynchronously via background task
    import asyncio

    from app.agents.workflow import run_workflow_background

    asyncio.create_task(run_workflow_background(case_id))

    return AnalyzeResponse(
        case_id=case_id,
        status="started",
        message=f"Analysis triggered with {len(AGENT_NAMES)} agents.",
        agent_run_ids=agent_run_ids,
    )


@router.get("/cases/{case_id}/findings", response_model=FindingListResponse)
async def get_findings(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(CaseFinding)
        .where(CaseFinding.case_id == case_id)
        .order_by(CaseFinding.created_at.desc())
    )
    findings = result.scalars().all()
    return FindingListResponse(findings=findings, total=len(findings))


@router.post(
    "/cases/{case_id}/findings/{finding_id}/explain",
    response_model=FindingExplanationResponse,
)
async def explain_finding(
    case_id: str,
    finding_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a natural-language explanation for a specific finding."""
    from app.llm import get_llm_provider
    from app.models.document import Document
    from app.models.document_extraction import DocumentExtraction

    # 1. Load finding
    result = await db.execute(
        select(CaseFinding).where(
            CaseFinding.id == finding_id,
            CaseFinding.case_id == case_id,
        )
    )
    finding = result.scalar_one_or_none()
    if not finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found.",
        )

    # 2. Load case
    case_result = await db.execute(select(Case).where(Case.id == case_id))
    case = case_result.scalar_one_or_none()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found.",
        )

    # 3. Load documents + extractions
    doc_result = await db.execute(select(Document).where(Document.case_id == case_id))
    documents = doc_result.scalars().all()
    doc_ids = [d.id for d in documents]
    extractions = []
    if doc_ids:
        ext_result = await db.execute(
            select(DocumentExtraction).where(
                DocumentExtraction.document_id.in_(doc_ids)
            )
        )
        extractions = ext_result.scalars().all()

    # 4. Prepare data dicts
    case_data = {
        "id": case.id,
        "company_name": case.company_name,
        "sector": case.sector,
        "country": case.country,
        "status": case.status,
        "description": case.description,
    }
    docs_data = [
        {
            "id": d.id,
            "filename": d.filename,
            "file_type": d.file_type,
        }
        for d in documents
    ]
    ext_data = [
        {
            "document_id": e.document_id,
            "extracted_text": (e.extracted_text or "")[:2000],
            "extracted_json": e.extracted_json,
        }
        for e in extractions
    ]
    finding_data = {
        "id": finding.id,
        "finding_type": finding.finding_type,
        "severity": finding.severity,
        "title": finding.title,
        "description": finding.description,
        "source_refs": finding.source_refs,
        "created_by_agent": finding.created_by_agent,
    }

    # 5. Call LLM
    llm = get_llm_provider()
    result = await llm.explain_finding(
        finding=finding_data,
        case_data=case_data,
        documents=docs_data,
        extractions=ext_data,
    )

    return FindingExplanationResponse(
        explanation=result.get("explanation", "Unable to generate explanation."),
        document_references=result.get("document_references", []),
        confidence=result.get("confidence", 0.0),
    )


@router.get(
    "/cases/{case_id}/risk-assessment", response_model=RiskAssessmentResponse | None
)
async def get_risk_assessment(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(RiskAssessment)
        .where(RiskAssessment.case_id == case_id)
        .order_by(RiskAssessment.created_at.desc())
    )
    assessment = result.scalars().first()
    if not assessment:
        return None
    return assessment


@router.get("/cases/{case_id}/agent-runs", response_model=AgentRunListResponse)
async def get_agent_runs(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(AgentRun)
        .where(AgentRun.case_id == case_id)
        .order_by(AgentRun.created_at.asc())
    )
    runs = result.scalars().all()
    return AgentRunListResponse(agent_runs=runs, total=len(runs))


# ---------------------------------------------------------------------------
# ESG Assessment
# ---------------------------------------------------------------------------


@router.get(
    "/cases/{case_id}/esg-assessment",
    response_model=EsgAssessmentResponse | None,
)
async def get_esg_assessment(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(EsgAssessment)
        .where(EsgAssessment.case_id == case_id)
        .order_by(EsgAssessment.created_at.desc())
    )
    assessment = result.scalars().first()
    if not assessment:
        return None
    return assessment


# ---------------------------------------------------------------------------
# Workflow Checkpoints
# ---------------------------------------------------------------------------


@router.get("/cases/{case_id}/checkpoints", response_model=CheckpointListResponse)
async def get_checkpoints(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(WorkflowCheckpoint)
        .where(WorkflowCheckpoint.case_id == case_id)
        .order_by(WorkflowCheckpoint.paused_at.asc())
    )
    checkpoints = result.scalars().all()
    return CheckpointListResponse(checkpoints=checkpoints, total=len(checkpoints))


@router.post("/cases/{case_id}/checkpoints/{checkpoint_id}/approve")
async def approve_checkpoint(
    case_id: str,
    checkpoint_id: str,
    body: CheckpointActionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Approve a workflow checkpoint and resume the pipeline."""
    result = await db.execute(
        select(WorkflowCheckpoint).where(
            WorkflowCheckpoint.id == checkpoint_id,
            WorkflowCheckpoint.case_id == case_id,
        )
    )
    checkpoint = result.scalar_one_or_none()
    if not checkpoint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checkpoint not found.",
        )
    if checkpoint.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Checkpoint already {checkpoint.status}.",
        )

    checkpoint.status = "approved"
    checkpoint.reviewer_name = body.reviewer_name
    checkpoint.comment = body.comment
    checkpoint.resolved_at = datetime.now(UTC)

    # Update case
    case_result = await db.execute(select(Case).where(Case.id == case_id))
    case = case_result.scalar_one_or_none()
    if case:
        case.status = "analyzing"
        case.workflow_paused_at_checkpoint = None

    db.add(
        AuditLog(
            case_id=case_id,
            event_type="checkpoint_approved",
            actor=body.reviewer_name,
            payload={
                "checkpoint_id": checkpoint_id,
                "checkpoint_name": checkpoint.checkpoint_name,
                "comment": body.comment,
            },
        )
    )
    await db.commit()

    # Resume workflow from this checkpoint
    import asyncio

    from app.agents.workflow import resume_workflow

    async def _resume():
        try:
            await resume_workflow(case_id, checkpoint.checkpoint_name)
        except Exception as e:
            import logging

            logging.getLogger(__name__).error(
                f"Resume workflow failed for case {case_id}: {e}"
            )

    asyncio.create_task(_resume())

    return {
        "status": "approved",
        "checkpoint_id": checkpoint_id,
        "message": f"Checkpoint '{checkpoint.checkpoint_name}' approved. "
        "Workflow resumed.",
    }


@router.post("/cases/{case_id}/checkpoints/{checkpoint_id}/reject")
async def reject_checkpoint(
    case_id: str,
    checkpoint_id: str,
    body: CheckpointActionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reject a workflow checkpoint — stops the pipeline."""
    result = await db.execute(
        select(WorkflowCheckpoint).where(
            WorkflowCheckpoint.id == checkpoint_id,
            WorkflowCheckpoint.case_id == case_id,
        )
    )
    checkpoint = result.scalar_one_or_none()
    if not checkpoint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checkpoint not found.",
        )
    if checkpoint.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Checkpoint already {checkpoint.status}.",
        )

    checkpoint.status = "rejected"
    checkpoint.reviewer_name = body.reviewer_name
    checkpoint.comment = body.comment
    checkpoint.resolved_at = datetime.now(UTC)

    # Update case
    case_result = await db.execute(select(Case).where(Case.id == case_id))
    case = case_result.scalar_one_or_none()
    if case:
        case.status = "checkpoint_rejected"
        case.workflow_paused_at_checkpoint = None

    db.add(
        AuditLog(
            case_id=case_id,
            event_type="checkpoint_rejected",
            actor=body.reviewer_name,
            payload={
                "checkpoint_id": checkpoint_id,
                "checkpoint_name": checkpoint.checkpoint_name,
                "comment": body.comment,
            },
        )
    )
    await db.commit()

    return {
        "status": "rejected",
        "checkpoint_id": checkpoint_id,
        "message": f"Checkpoint '{checkpoint.checkpoint_name}' rejected. "
        "Workflow stopped.",
    }
