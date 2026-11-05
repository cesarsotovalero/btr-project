"""Reconciliation & Anomaly Agent — validates numeric consistency across documents.

Runs deterministic cross-statement checks (balance sheet equation, ratio
recomputation, duplicate detection) plus LLM-powered anomaly detection for
nuanced inconsistencies that simple rules cannot catch.

Directly addresses supervisory observations that reconciliation errors and
manual adjustments are root causes of poor risk reporting (RDARR guidance).
"""

import logging

from app.llm import get_llm_provider

logger = logging.getLogger(__name__)


def _try_float(value: str | int | float | None) -> float | None:
    """Attempt to parse a numeric value."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    try:
        cleaned = (
            str(value)
            .replace(",", "")
            .replace(" ", "")
            .replace("SEK", "")
            .replace("EUR", "")
            .replace("USD", "")
            .replace("M", "e6")
            .replace("B", "e9")
            .replace("K", "e3")
            .strip()
        )
        return float(cleaned)
    except (ValueError, TypeError):
        return None


def _find_metric(metrics: list[dict], *labels: str) -> float | None:
    """Find a metric by label (case-insensitive partial match)."""
    for metric in metrics:
        metric_label = str(metric.get("label", "") or metric.get("name", "")).lower()
        for label in labels:
            if label.lower() in metric_label:
                val = metric.get("value") or metric.get("amount")
                result = _try_float(val)
                if result is not None:
                    return result
    return None


async def run_reconciliation_agent(extraction_output: dict) -> dict:
    """Validate numeric consistency across extracted documents.

    Returns anomalies, passing checks, and a reconciliation confidence score.
    """
    llm = get_llm_provider()

    # Gather all metrics from all documents
    all_metrics = extraction_output.get("aggregated_metrics", [])
    all_entities = extraction_output.get("aggregated_entities", [])
    enhanced = extraction_output.get("enhanced_extractions", [])

    # Combine metrics from parser and entity extraction
    combined_metrics = list(all_metrics)
    for entity in all_entities:
        if isinstance(entity, dict) and "label" in entity:
            combined_metrics.append(entity)

    anomalies = []
    passing_checks = []

    # --- Deterministic checks ---

    # 1. Balance sheet equation: Assets ≈ Liabilities + Equity
    total_assets = _find_metric(combined_metrics, "total assets", "assets")
    total_liabilities = _find_metric(
        combined_metrics, "total liabilities", "liabilities"
    )
    equity = _find_metric(
        combined_metrics, "equity", "shareholders equity", "net worth"
    )

    if (
        total_assets is not None
        and total_liabilities is not None
        and equity is not None
    ):
        expected = total_liabilities + equity
        tolerance = abs(total_assets) * 0.01  # 1% tolerance
        if abs(total_assets - expected) <= tolerance:
            passing_checks.append(
                {
                    "check": "Balance sheet equation (Assets = Liabilities + Equity)",
                    "status": "pass",
                    "detail": f"Assets ({total_assets:,.0f})"
                    f" ≈ Liabilities"
                    f" ({total_liabilities:,.0f}) "
                    f"+ Equity ({equity:,.0f})"
                    f" = {expected:,.0f}. "
                    f"Difference:"
                    f" {abs(total_assets - expected):,.0f}.",
                }
            )
        else:
            anomalies.append(
                {
                    "type": "balance_sheet_equation",
                    "description": (
                        f"Balance sheet does not balance:"
                        f" Assets ({total_assets:,.0f}) "
                        f"≠ Liabilities"
                        f" ({total_liabilities:,.0f})"
                        f" + Equity ({equity:,.0f}) "
                        f"= {expected:,.0f}. Difference:"
                        f" {abs(total_assets - expected):,.0f}."
                    ),
                    "severity": "critical",
                    "affected_fields": [
                        "total_assets",
                        "total_liabilities",
                        "equity",
                    ],
                    "suggested_resolution": (
                        "Request clarification from"
                        " company. Verify all line"
                        " items are included and"
                        " check for off-balance-"
                        "sheet items."
                    ),
                }
            )
    else:
        passing_checks.append(
            {
                "check": "Balance sheet equation (Assets = Liabilities + Equity)",
                "status": "inconclusive",
                "detail": (
                    "Could not find all three values"
                    " (assets, liabilities, equity) "
                    "in extracted metrics."
                    " Manual verification recommended."
                ),
            }
        )

    # 2. Revenue consistency across documents
    revenue_values = []
    for ext in enhanced:
        ext_entities = ext.get("entities", {})
        if isinstance(ext_entities, dict):
            for fig in ext_entities.get("financial_figures", []):
                if (
                    isinstance(fig, dict)
                    and "revenue" in str(fig.get("label", "")).lower()
                ):
                    val = _try_float(fig.get("value"))
                    if val is not None:
                        revenue_values.append(
                            {"value": val, "document_id": ext.get("document_id")}
                        )

    if len(revenue_values) >= 2:
        vals = [rv["value"] for rv in revenue_values]
        max_val, min_val = max(vals), min(vals)
        if max_val > 0 and (max_val - min_val) / max_val > 0.05:
            anomalies.append(
                {
                    "type": "cross_document_revenue_mismatch",
                    "description": f"Revenue figures differ across documents: "
                    f"range from {min_val:,.0f} to {max_val:,.0f} "
                    f"({((max_val - min_val) / max_val * 100):.1f}% variance).",
                    "severity": "warning",
                    "affected_fields": ["revenue"],
                    "suggested_resolution": "Confirm which figure is from audited "
                    "financial statements vs. management estimates.",
                }
            )
        else:
            passing_checks.append(
                {
                    "check": "Revenue consistency across documents",
                    "status": "pass",
                    "detail": f"Revenue figures are consistent across "
                    f"{len(revenue_values)} document references.",
                }
            )

    # 3. Leverage ratio sanity check
    _find_metric(combined_metrics, "revenue", "turnover", "sales")
    total_debt = _find_metric(combined_metrics, "debt", "total debt", "net debt")
    ebitda = _find_metric(combined_metrics, "ebitda")

    if total_debt is not None and ebitda is not None and ebitda > 0:
        leverage = total_debt / ebitda
        if leverage > 6.0:
            anomalies.append(
                {
                    "type": "high_leverage_ratio",
                    "description": f"Debt/EBITDA ratio is {leverage:.1f}x, which is "
                    "significantly above typical thresholds (< 4x for investment "
                    "grade, < 6x for speculative).",
                    "severity": "high",
                    "affected_fields": ["total_debt", "ebitda"],
                    "suggested_resolution": (
                        "Verify debt figure"
                        " includes/excludes "
                        "off-balance-sheet items."
                        " Assess whether cash"
                        " reserves mitigate"
                        " leverage."
                    ),
                }
            )
        else:
            passing_checks.append(
                {
                    "check": "Leverage ratio (Debt/EBITDA)",
                    "status": "pass",
                    "detail": f"Debt/EBITDA ratio is {leverage:.1f}x — "
                    f"within expected range.",
                }
            )

    # 4. Duplicate entity detection across documents
    seen_orgs = {}
    for ext in enhanced:
        ext_entities = ext.get("entities", {})
        if isinstance(ext_entities, dict):
            for org in ext_entities.get("organizations", []):
                org_lower = str(org).lower().strip()
                if org_lower in seen_orgs:
                    seen_orgs[org_lower].append(ext.get("document_id"))
                else:
                    seen_orgs[org_lower] = [ext.get("document_id")]

    # Not an anomaly itself, but useful context
    multi_doc_entities = {k: v for k, v in seen_orgs.items() if len(v) > 1}

    # --- LLM-powered anomaly detection ---
    llm_anomalies = await llm.detect_anomalies(
        extraction_output.get("enhanced_extractions", [])[:5],
        combined_metrics[:20],
    )

    # Merge LLM anomalies (avoid duplicates with deterministic ones)
    deterministic_types = {a["type"] for a in anomalies}
    for llm_anomaly in llm_anomalies.get("anomalies", []):
        if llm_anomaly.get("type") not in deterministic_types:
            llm_anomaly["source"] = "llm"
            anomalies.append(llm_anomaly)

    # Merge LLM cross-statement checks
    deterministic_check_names = {c["check"] for c in passing_checks}
    for llm_check in llm_anomalies.get("cross_statement_checks", []):
        if llm_check.get("check") not in deterministic_check_names:
            llm_check["source"] = "llm"
            passing_checks.append(llm_check)

    # Compute overall confidence
    det_confidence = 0.85 if passing_checks else 0.5
    llm_confidence = llm_anomalies.get("confidence", 0.5)
    overall_confidence = (det_confidence + llm_confidence) / 2

    # Tag each anomaly with document IDs where possible
    for anomaly in anomalies:
        if "document_ids" not in anomaly:
            anomaly["document_ids"] = [
                ext.get("document_id") for ext in enhanced if ext.get("document_id")
            ]

    return {
        "status": "completed",
        "anomalies": anomalies,
        "passing_checks": passing_checks,
        "multi_document_entities": multi_doc_entities,
        "metrics_evaluated": len(combined_metrics),
        "confidence": overall_confidence,
    }
