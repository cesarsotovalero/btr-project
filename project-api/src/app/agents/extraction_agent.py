"""Extraction Agent — extracts structured information from parsed documents."""

import logging

from app.llm import get_llm_provider

logger = logging.getLogger(__name__)


async def run_extraction_agent(documents: list[dict], extractions: list[dict]) -> dict:
    """Enhance parsed extractions with LLM-powered entity and metric extraction.

    Takes the raw parser output and enriches it with the LLM provider.
    """
    llm = get_llm_provider()
    enhanced_extractions = []
    all_entities = []
    all_metrics = []
    all_tables = []

    for extraction in extractions:
        doc_json = extraction.get("extracted_json", {}) or {}
        full_text = doc_json.get("full_text", "")
        doc_type = doc_json.get("document_type", "unknown")

        # LLM analysis of document
        analysis = await llm.analyze_document(full_text, doc_type)

        # LLM entity extraction
        entities = await llm.extract_entities(full_text)

        enhanced = {
            "document_id": extraction.get("document_id"),
            "analysis": analysis,
            "entities": entities,
            "parser_sections": doc_json.get("sections", []),
            "parser_tables": doc_json.get("tables", []),
            "parser_metrics": doc_json.get("key_metrics", []),
            "confidence": min(
                doc_json.get("confidence", 0.5),
                analysis.get("confidence", 0.5),
            ),
        }
        enhanced_extractions.append(enhanced)

        # Aggregate across documents
        if isinstance(entities.get("financial_figures"), list):
            all_entities.extend(entities["financial_figures"])
        if isinstance(doc_json.get("key_metrics"), list):
            all_metrics.extend(doc_json["key_metrics"])
        if isinstance(doc_json.get("tables"), list):
            all_tables.extend(doc_json["tables"])

    return {
        "status": "completed",
        "document_count": len(extractions),
        "enhanced_extractions": enhanced_extractions,
        "aggregated_entities": all_entities,
        "aggregated_metrics": all_metrics,
        "aggregated_tables": all_tables,
        "confidence": (
            sum(e["confidence"] for e in enhanced_extractions)
            / len(enhanced_extractions)
            if enhanced_extractions
            else 0.0
        ),
    }
