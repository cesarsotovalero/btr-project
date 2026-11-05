"""Regulation Context Agent — retrieves and matches relevant regulations."""

import logging

from app.llm import get_llm_provider

logger = logging.getLogger(__name__)


async def run_regulation_agent(
    case_data: dict,
    extraction_output: dict,
    regulations: list[dict],
) -> dict:
    """Retrieve relevant regulations, assess compliance, build policy checklist.

    Uses the LLM to map case data against regulation snippets.
    """
    llm = get_llm_provider()

    # Build case context for the LLM
    case_context = {
        "company_name": case_data.get("company_name"),
        "sector": case_data.get("sector"),
        "country": case_data.get("country"),
        "entities": extraction_output.get("aggregated_entities", []),
        "metrics": extraction_output.get("aggregated_metrics", []),
    }

    # Format regulation data for LLM
    reg_data = [
        {
            "source_name": r.get("source_name"),
            "source_type": r.get("source_type"),
            "content_text": r.get("content_text", "")[:1000],
        }
        for r in regulations
    ]

    # Run compliance assessment via LLM
    compliance = await llm.assess_compliance(case_context, reg_data)

    # Build relevant rule set
    relevant_rules = []
    for reg in regulations:
        relevant_rules.append(
            {
                "regulation_id": str(reg.get("id", "")),
                "name": reg.get("source_name"),
                "type": reg.get("source_type"),
                "version": reg.get("version"),
                "relevance": "high"
                if reg.get("source_type") in ("eu_directive", "internal_policy")
                else "medium",
            }
        )

    return {
        "status": "completed",
        "compliance": compliance,
        "relevant_rules": relevant_rules,
        "policy_checklist": compliance.get("checks", []),
        "overall_status": compliance.get("overall_status", "unknown"),
        "confidence": compliance.get("confidence", 0.0),
    }
