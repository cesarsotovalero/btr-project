"""Tests for the mock LLM provider."""

import pytest

from app.llm.mock_provider import MockLLMProvider


@pytest.mark.asyncio
async def test_mock_analyze_document():
    llm = MockLLMProvider()
    result = await llm.analyze_document("Sample text", "pdf")
    assert "key_topics" in result
    assert "confidence" in result
    assert "summary" in result


@pytest.mark.asyncio
async def test_mock_assess_compliance():
    llm = MockLLMProvider()
    result = await llm.assess_compliance(
        {"company_name": "Test", "sector": "Energy"},
        [{"source_name": "CRR"}],
    )
    assert "checks" in result
    assert len(result["checks"]) > 0


@pytest.mark.asyncio
async def test_mock_synthesize_risk():
    llm = MockLLMProvider()
    result = await llm.synthesize_risk(
        {"company_name": "Test"},
        [],
        {"status": "ok"},
        {"status": "ok"},
        [],
    )
    assert "proposed_risk_class" in result
    assert "confidence" in result
    assert "reasoning" in result


@pytest.mark.asyncio
async def test_mock_assess_esg_risk():
    llm = MockLLMProvider()
    result = await llm.assess_esg_risk(
        {"company_name": "Test", "sector": "Energy"},
        [{"text": "Carbon data"}],
        [{"source_name": "EU Taxonomy"}],
    )
    assert "climate_risk_rating" in result
    assert "environmental_flags" in result
    assert "social_flags" in result
    assert "governance_flags" in result
    assert "taxonomy_alignment" in result
    assert "missing_esg_data" in result
    assert isinstance(result["environmental_flags"], list)


@pytest.mark.asyncio
async def test_mock_detect_anomalies():
    llm = MockLLMProvider()
    result = await llm.detect_anomalies(
        [{"text": "Balance sheet", "metrics": []}],
        [{"label": "Revenue", "value": "100M"}],
    )
    assert "anomalies" in result
    assert "cross_statement_checks" in result
    assert isinstance(result["anomalies"], list)
    assert isinstance(result["cross_statement_checks"], list)
