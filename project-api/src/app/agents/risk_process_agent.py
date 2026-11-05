"""Risk Process Agent - enforces SEB's internal risk assessment process."""

import logging

from app.llm import get_llm_provider

logger = logging.getLogger(__name__)


async def run_risk_process_agent(
    case_data: dict,
    extraction_output: dict,
) -> dict:
    """Check that the case follows internal risk process steps.

    Evaluates what steps have been completed and what's missing.
    """
    llm = get_llm_provider()

    case_context = {
        "company_name": case_data.get("company_name"),
        "sector": case_data.get("sector"),
        "country": case_data.get("country"),
        "status": case_data.get("status"),
        "document_count": extraction_output.get("document_count", 0),
        "has_financials": any(
            m.get("name") in ("revenue", "ebitda", "net_income", "total_assets")
            for m in extraction_output.get("aggregated_metrics", [])
        ),
        "has_entities": len(extraction_output.get("aggregated_entities", [])) > 0,
    }

    process_check = await llm.assess_risk_process(case_context, [])

    return {
        "status": "completed",
        "process_compliance": process_check.get("process_compliance", "unknown"),
        "steps": process_check.get("steps", []),
        "completed_steps": process_check.get("completed", 0),
        "total_steps": process_check.get("total", 6),
        "blocking_items": process_check.get("blocking_items", []),
        "confidence": process_check.get("confidence", 0.0),
    }
