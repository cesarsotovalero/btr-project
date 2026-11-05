"""Historical Similarity Agent — finds similar past cases and explains precedent."""

import logging

from app.llm import get_llm_provider

logger = logging.getLogger(__name__)


async def run_historical_agent(
    case_data: dict,
    historical_cases: list[dict],
) -> dict:
    """Retrieve and rank similar historical cases.

    Uses weighted similarity + LLM for natural language explanation.
    """
    llm = get_llm_provider()

    # Simple weighted similarity scoring (deterministic)
    scored_cases = []
    for hist in historical_cases:
        score = 0.0
        reasons = []

        if hist.get("sector") == case_data.get("sector"):
            score += 0.3
            reasons.append("Same sector")
        if hist.get("country") == case_data.get("country"):
            score += 0.2
            reasons.append("Same country")
        if hist.get("revenue_band") and hist.get("revenue_band") == case_data.get(
            "revenue_band"
        ):
            score += 0.2
            reasons.append("Same revenue band")
        if hist.get("debt_profile") and hist.get("debt_profile") == case_data.get(
            "debt_profile"
        ):
            score += 0.15
            reasons.append("Similar debt profile")

        # Base similarity for any historical case
        score = max(score, 0.1)

        scored_cases.append(
            {
                "id": str(hist.get("id", "")),
                "company": hist.get("company_name", "Unknown"),
                "sector": hist.get("sector"),
                "country": hist.get("country"),
                "outcome": hist.get("outcome"),
                "risk_class": hist.get("final_risk_class"),
                "decision_notes": hist.get("decision_notes", ""),
                "similarity_score": round(score, 2),
                "similarity_reasons": reasons,
                "closed_at": str(hist.get("closed_at", "")),
            }
        )

    # Sort by score descending and take top 5
    scored_cases.sort(key=lambda x: x["similarity_score"], reverse=True)
    top_cases = scored_cases[:5]

    # Use LLM for richer explanation if there are cases
    llm_result = await llm.find_similar_cases(case_data, top_cases)

    return {
        "status": "completed",
        "similar_cases": llm_result.get("similar_cases", top_cases),
        "precedent_strength": llm_result.get("precedent_strength", "unknown"),
        "caution_notes": llm_result.get("caution_notes", []),
        "confidence": llm_result.get("confidence", 0.5),
    }
