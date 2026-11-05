"""Tests for the analyst chatbot — LLM method + API endpoint."""

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.llm.mock_provider import MockLLMProvider
from app.models.document import Document

# ---------------------------------------------------------------------------
# LLM unit tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_mock_answer_case_question_risk():
    llm = MockLLMProvider()
    result = await llm.answer_case_question(
        question="What is the risk rating?",
        case_data={"company_name": "TestCo", "sector": "Energy"},
        documents=[{"id": "d1", "filename": "report.pdf"}],
        extractions=[],
        findings=[],
        risk_assessment={"proposed_risk_class": "B+"},
    )
    assert "answer" in result
    assert "sources" in result
    assert "confidence" in result
    assert result["confidence"] > 0
    assert "B+" in result["answer"]
    assert len(result["sources"]) > 0


@pytest.mark.asyncio
async def test_mock_answer_case_question_compliance():
    llm = MockLLMProvider()
    result = await llm.answer_case_question(
        question="What is the compliance status of this company?",
        case_data={"company_name": "TestCo", "sector": "Technology"},
        documents=[{"id": "d1", "filename": "annual_report.pdf"}],
        extractions=[],
        findings=[],
        risk_assessment=None,
    )
    assert (
        "compliance" in result["answer"].lower()
        or "compliant" in result["answer"].lower()
    )


@pytest.mark.asyncio
async def test_mock_answer_case_question_generic():
    llm = MockLLMProvider()
    result = await llm.answer_case_question(
        question="Tell me about this case",
        case_data={"company_name": "TestCo", "sector": "Technology"},
        documents=[],
        extractions=[],
        findings=[],
        risk_assessment=None,
    )
    assert "TestCo" in result["answer"]
    assert isinstance(result["sources"], list)


# ---------------------------------------------------------------------------
# API integration tests
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture()
async def case_with_docs(
    client: AsyncClient, auth_headers: dict, db_session: AsyncSession
):
    """Create a case with a document for chat testing."""
    # Create case
    res = await client.post(
        "/api/cases",
        json={
            "company_name": "ChatTest Corp",
            "sector": "Technology",
            "country": "Sweden",
        },
        headers=auth_headers,
    )
    assert res.status_code == 200
    case_id = res.json()["id"]

    # Add a document record directly (no actual file needed for chat)
    doc = Document(
        case_id=case_id,
        filename="annual_report_2025.pdf",
        file_type="pdf",
        storage_path="/tmp/fake.pdf",
        file_size=1024,
        upload_status="uploaded",
        parsed_status="parsed",
    )
    db_session.add(doc)
    await db_session.flush()

    return case_id


@pytest.mark.asyncio
async def test_chat_endpoint_success(
    client: AsyncClient, auth_headers: dict, case_with_docs: str
):
    res = await client.post(
        f"/api/cases/{case_with_docs}/chat",
        json={"question": "What is the risk classification?"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert "sources" in data
    assert "confidence" in data
    assert len(data["answer"]) > 0


@pytest.mark.asyncio
async def test_chat_endpoint_not_found(client: AsyncClient, auth_headers: dict):
    res = await client.post(
        "/api/cases/nonexistent-id/chat",
        json={"question": "Hello?"},
        headers=auth_headers,
    )
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_chat_endpoint_empty_question(
    client: AsyncClient, auth_headers: dict, case_with_docs: str
):
    res = await client.post(
        f"/api/cases/{case_with_docs}/chat",
        json={"question": ""},
        headers=auth_headers,
    )
    assert res.status_code == 422  # Validation error — min_length=1
