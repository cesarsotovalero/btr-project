"""Tests for the reconciliation agent."""

import pytest

from app.agents.reconciliation_agent import run_reconciliation_agent


@pytest.mark.asyncio
async def test_reconciliation_basic():
    """Reconciliation agent returns anomalies and passing_checks."""
    extraction = {
        "aggregated_metrics": [
            {"label": "Total Assets", "value": "100"},
            {"label": "Total Liabilities", "value": "60"},
            {"label": "Total Equity", "value": "40"},
            {"label": "Revenue", "value": "50"},
            {"label": "Total Debt", "value": "60"},
        ],
        "aggregated_entities": [],
        "enhanced_extractions": [
            {
                "text": (
                    "Balance sheet. Total assets 100M."
                    " Total liabilities 60M. Equity 40M."
                ),
                "entities": {
                    "financial_figures": [
                        {"label": "Revenue", "value": "50"},
                    ]
                },
            },
            {
                "text": "Income statement. Revenue 50.",
                "entities": {
                    "financial_figures": [
                        {"label": "Revenue", "value": "50"},
                    ]
                },
            },
        ],
    }
    result = await run_reconciliation_agent(extraction)

    assert "anomalies" in result
    assert isinstance(result["anomalies"], list)
    assert "passing_checks" in result
    # Balance sheet should balance: 100 = 60 + 40
    balance_anomalies = [
        a for a in result["anomalies"] if a.get("type") == "balance_sheet_equation"
    ]
    assert len(balance_anomalies) == 0


@pytest.mark.asyncio
async def test_reconciliation_balance_mismatch():
    """Detects balance-sheet imbalance."""
    extraction = {
        "aggregated_metrics": [
            {"label": "Total Assets", "value": "100"},
            {"label": "Total Liabilities", "value": "70"},
            {"label": "Total Equity", "value": "20"},
        ],
        "aggregated_entities": [],
        "enhanced_extractions": [],
    }
    result = await run_reconciliation_agent(extraction)

    balance_anomalies = [
        a for a in result["anomalies"] if a.get("type") == "balance_sheet_equation"
    ]
    assert len(balance_anomalies) == 1


@pytest.mark.asyncio
async def test_reconciliation_empty():
    """Handles empty extraction."""
    result = await run_reconciliation_agent(
        {
            "aggregated_metrics": [],
            "aggregated_entities": [],
            "enhanced_extractions": [],
        }
    )

    assert "anomalies" in result
    assert "passing_checks" in result
