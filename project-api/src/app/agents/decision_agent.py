"""Decision Support Agent — synthesizes all outputs into a risk recommendation."""

import logging

from app.llm import get_llm_provider

logger = logging.getLogger(__name__)


async def run_decision_agent(
    case_data: dict,
    extraction_output: dict,
    regulation_output: dict,
    process_output: dict,
    historical_output: dict,
) -> dict:
    """Produce the final draft risk assessment.

    Combines all prior agent outputs into an analyst-friendly recommendation.
    """
    llm = get_llm_provider()

    # Prepare inputs for synthesis
    extractions = extraction_output.get("enhanced_extractions", [])
    compliance = regulation_output.get("compliance", {})
    process_check = {
        "process_compliance": process_output.get("process_compliance"),
        "steps": process_output.get("steps", []),
        "blocking_items": process_output.get("blocking_items", []),
    }
    similar_cases = historical_output.get("similar_cases", [])

    # Run LLM synthesis
    synthesis = await llm.synthesize_risk(
        case_data=case_data,
        extractions=extractions,
        compliance=compliance,
        process_check=process_check,
        similar_cases=similar_cases,
    )

    # Layer A: Deterministic checks (override if critical)
    deterministic_flags = _run_deterministic_checks(
        case_data, extraction_output, regulation_output, process_output
    )

    # Merge deterministic flags into synthesis
    if deterministic_flags.get("critical_issues"):
        synthesis["missing_items"] = (
            synthesis.get("missing_items", []) + deterministic_flags["critical_issues"]
        )
        # Downgrade risk class if critical issues found
        if synthesis.get("confidence", 1.0) > 0.3:
            synthesis["confidence"] = max(synthesis.get("confidence", 0.5) - 0.15, 0.3)

    synthesis["deterministic_checks"] = deterministic_flags
    synthesis["status"] = "completed"

    return synthesis


def _run_deterministic_checks(
    case_data: dict,
    extraction_output: dict,
    regulation_output: dict,
    process_output: dict,
) -> dict:
    """Run simple rule-based checks that don't need an LLM."""
    critical_issues = []
    warnings = []

    # Check: minimum documents
    doc_count = extraction_output.get("document_count", 0)
    if doc_count < 2:
        critical_issues.append(
            f"Only {doc_count} document(s) provided — minimum 2 recommended"
        )

    # Check: financial data present
    metrics = extraction_output.get("aggregated_metrics", [])
    if not metrics:
        critical_issues.append("No financial metrics extracted from documents")

    # Check: compliance status
    overall_compliance = regulation_output.get("overall_status", "unknown")
    if overall_compliance == "non_compliant":
        critical_issues.append("Case is non-compliant with one or more regulations")

    # Check: process completion
    completed_steps = process_output.get("completed_steps", 0)
    total_steps = process_output.get("total_steps", 6)
    if completed_steps < total_steps / 2:
        warnings.append(f"Only {completed_steps}/{total_steps} process steps completed")

    # Check: blocking items
    blocking = process_output.get("blocking_items", [])
    if blocking:
        for item in blocking:
            warnings.append(f"Process blocker: {item}")

    return {
        "critical_issues": critical_issues,
        "warnings": warnings,
        "checks_passed": len(critical_issues) == 0,
    }
