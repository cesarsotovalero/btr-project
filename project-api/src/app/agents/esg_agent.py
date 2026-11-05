"""ESG Risk Agent — assesses environmental, social, and governance risk.

Evaluates climate risk, EU Taxonomy alignment, and ESG data completeness
as required by EU supervisory expectations (EBA ESG guidelines, EU Taxonomy
Regulation, CSRD) and prudential risk management frameworks.
"""

import logging

from app.llm import get_llm_provider

logger = logging.getLogger(__name__)

# Sectors with elevated climate transition or physical risk
HIGH_CLIMATE_RISK_SECTORS = {
    "Energy",
    "Mining",
    "Transportation",
    "Agriculture",
    "Real Estate",
    "Manufacturing",
    "Utilities",
    "Oil & Gas",
    "Chemicals",
}

# Keywords that signal ESG-relevant content in documents
ESG_KEYWORDS = {
    "emissions",
    "carbon",
    "taxonomy",
    "csrd",
    "sustainability",
    "climate",
    "esg",
    "ghg",
    "scope 1",
    "scope 2",
    "scope 3",
    "net zero",
    "net-zero",
    "transition plan",
    "physical risk",
    "transition risk",
    "biodiversity",
    "circular economy",
    "water stress",
    "pollution",
    "human rights",
    "supply chain",
    "governance",
    "green bond",
    "sustainable finance",
}


async def run_esg_agent(
    case_data: dict,
    extraction_output: dict,
    regulations: list[dict],
) -> dict:
    """Assess ESG and climate risk for the case.

    Combines deterministic pre-checks (sector risk, keyword scanning, regulation
    matching) with LLM-powered ESG analysis against EU Taxonomy objectives.
    """
    llm = get_llm_provider()

    # --- Deterministic pre-checks ---
    sector = case_data.get("sector", "")
    sector_is_high_risk = sector in HIGH_CLIMATE_RISK_SECTORS

    # Scan extracted content for ESG keywords
    esg_keyword_hits = set()
    all_text = ""
    for ext in extraction_output.get("enhanced_extractions", []):
        doc_text = ""
        analysis = ext.get("analysis", {})
        if isinstance(analysis, dict):
            doc_text += analysis.get("summary", "") + " "
        entities = ext.get("entities", {})
        if isinstance(entities, dict):
            for ref in entities.get("regulatory_references", []):
                doc_text += str(ref) + " "
        for section in ext.get("parser_sections", []):
            if isinstance(section, dict):
                doc_text += section.get("content", "") + " "
        all_text += doc_text

    text_lower = all_text.lower()
    for kw in ESG_KEYWORDS:
        if kw in text_lower:
            esg_keyword_hits.add(kw)

    # Check which regulations mention ESG/climate/taxonomy
    esg_regulations = []
    for reg in regulations:
        reg_text = (
            reg.get("content_text", "") + " " + reg.get("source_name", "")
        ).lower()
        if any(
            term in reg_text
            for term in [
                "esg",
                "taxonomy",
                "climate",
                "environmental",
                "sustainability",
                "csrd",
                "green",
            ]
        ):
            esg_regulations.append(reg)

    # --- LLM-powered ESG assessment ---
    case_context = {
        "company_name": case_data.get("company_name"),
        "sector": case_data.get("sector"),
        "country": case_data.get("country"),
        "entities": extraction_output.get("aggregated_entities", []),
        "metrics": extraction_output.get("aggregated_metrics", []),
    }

    esg_result = await llm.assess_esg_risk(
        case_context,
        extraction_output.get("enhanced_extractions", [])[:5],
        esg_regulations or regulations[:3],
    )

    # --- Merge deterministic flags with LLM output ---
    deterministic_flags = []
    if sector_is_high_risk:
        deterministic_flags.append(
            {
                "flag": f"High climate-risk sector: {sector}",
                "severity": "high",
                "detail": f"The {sector} sector is classified as high climate "
                "transition risk under EBA ESG risk management guidelines. "
                "Enhanced ESG due diligence is required.",
                "source": "deterministic",
            }
        )

    if not esg_keyword_hits:
        deterministic_flags.append(
            {
                "flag": "No ESG content detected in documents",
                "severity": "warning",
                "detail": "None of the submitted documents contain ESG-related "
                "keywords. This may indicate missing sustainability disclosures.",
                "source": "deterministic",
            }
        )

    if not esg_regulations:
        deterministic_flags.append(
            {
                "flag": "No ESG-specific regulations loaded",
                "severity": "info",
                "detail": "No active regulation sources mention ESG, taxonomy, "
                "or climate. Consider adding EU Taxonomy and CSRD references.",
                "source": "deterministic",
            }
        )

    # Combine environmental flags from LLM with deterministic flags
    env_flags = esg_result.get("environmental_flags", [])
    for df in deterministic_flags:
        env_flags.insert(0, df)

    return {
        "status": "completed",
        "climate_risk_rating": esg_result.get("climate_risk_rating", "unknown"),
        "environmental_flags": env_flags,
        "social_flags": esg_result.get("social_flags", []),
        "governance_flags": esg_result.get("governance_flags", []),
        "taxonomy_alignment": esg_result.get("taxonomy_alignment", {}),
        "missing_esg_data": esg_result.get("missing_esg_data", []),
        "esg_risk_horizon": esg_result.get("esg_risk_horizon", "unknown"),
        "risk_horizon_assessment": esg_result.get("risk_horizon_assessment", ""),
        "deterministic_checks": {
            "sector_is_high_risk": sector_is_high_risk,
            "esg_keyword_hits": sorted(esg_keyword_hits),
            "esg_regulations_count": len(esg_regulations),
        },
        "confidence": esg_result.get("confidence", 0.0),
    }
