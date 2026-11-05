"""Tests for the ESG agent and mock LLM ESG methods."""

import pytest

from app.agents.esg_agent import run_esg_agent


@pytest.mark.asyncio
async def test_esg_agent_high_risk_sector():
    """ESG agent flags energy sector as high climate risk."""
    case_data = {"company_name": "Nordvik Energy", "sector": "Energy"}
    extraction = {
        "documents": [
            {
                "text": "Carbon emissions report showing scope 1 and scope 2 data.",
                "metrics": [{"label": "Revenue", "value": "500M SEK"}],
            }
        ]
    }
    regulations = [
        {
            "source_name": "EU Taxonomy Regulation",
            "content_text": "Climate mitigation taxonomy alignment.",
        }
    ]
    result = await run_esg_agent(case_data, extraction, regulations)

    assert result["climate_risk_rating"] in ("high", "medium", "critical")
    assert "environmental_flags" in result
    assert "taxonomy_alignment" in result
    assert "missing_esg_data" in result
    assert isinstance(result["environmental_flags"], list)


@pytest.mark.asyncio
async def test_esg_agent_low_risk_sector():
    """ESG agent handles non-ESG sector gracefully."""
    case_data = {"company_name": "FinTech Co", "sector": "Technology"}
    extraction = {
        "documents": [
            {
                "text": "Software platform revenue breakdown.",
                "metrics": [{"label": "Revenue", "value": "50M EUR"}],
            }
        ]
    }
    result = await run_esg_agent(case_data, extraction, [])

    assert "climate_risk_rating" in result
    assert isinstance(result.get("environmental_flags", []), list)


@pytest.mark.asyncio
async def test_esg_agent_empty_extraction():
    """ESG agent handles empty extraction data."""
    case_data = {"company_name": "Test Corp", "sector": "Energy"}
    extraction = {"documents": []}
    result = await run_esg_agent(case_data, extraction, [])

    assert "climate_risk_rating" in result
