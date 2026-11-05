"""Tests for reference data CRUD + toggle endpoints."""

import io

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_regulations_empty(client: AsyncClient, auth_headers: dict):
    res = await client.get("/api/regulations", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 0
    assert data["regulations"] == []


@pytest.mark.asyncio
async def test_create_regulation(client: AsyncClient, auth_headers: dict):
    payload = {
        "source_name": "Test Regulation",
        "source_type": "regulation",
        "version": "1.0",
        "content_reference": "https://example.com",
        "content_text": "Some content",
    }
    res = await client.post("/api/regulations", json=payload, headers=auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["source_name"] == "Test Regulation"
    assert data["active"] is True


@pytest.mark.asyncio
async def test_toggle_regulation(client: AsyncClient, auth_headers: dict):
    # Create first
    payload = {"source_name": "Toggle Reg", "source_type": "guideline"}
    res = await client.post("/api/regulations", json=payload, headers=auth_headers)
    reg_id = res.json()["id"]

    # Deactivate
    res = await client.patch(
        f"/api/regulations/{reg_id}/toggle",
        json={"active": False},
        headers=auth_headers,
    )
    assert res.status_code == 200
    assert res.json()["active"] is False

    # Activate
    res = await client.patch(
        f"/api/regulations/{reg_id}/toggle",
        json={"active": True},
        headers=auth_headers,
    )
    assert res.json()["active"] is True


@pytest.mark.asyncio
async def test_delete_regulation(client: AsyncClient, auth_headers: dict):
    payload = {"source_name": "Del Reg", "source_type": "standard"}
    res = await client.post("/api/regulations", json=payload, headers=auth_headers)
    reg_id = res.json()["id"]

    res = await client.delete(f"/api/regulations/{reg_id}", headers=auth_headers)
    assert res.status_code == 204

    # Verify gone
    res = await client.get("/api/regulations", headers=auth_headers)
    assert all(r["id"] != reg_id for r in res.json()["regulations"])


@pytest.mark.asyncio
async def test_list_historical_cases_empty(client: AsyncClient, auth_headers: dict):
    res = await client.get("/api/historical-cases", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 0
    assert data["cases"] == []


@pytest.mark.asyncio
async def test_create_historical_case(client: AsyncClient, auth_headers: dict):
    payload = {
        "company_name": "Test Corp",
        "sector": "Energy",
        "country": "Sweden",
        "revenue_band": "50-200M",
        "debt_profile": "moderate",
        "outcome": "approved",
        "final_risk_class": "low",
        "decision_notes": "Clean history",
    }
    res = await client.post("/api/historical-cases", json=payload, headers=auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["company_name"] == "Test Corp"
    assert data["active"] is True


@pytest.mark.asyncio
async def test_toggle_historical_case(client: AsyncClient, auth_headers: dict):
    payload = {"company_name": "Toggle Corp", "sector": "Tech"}
    res = await client.post("/api/historical-cases", json=payload, headers=auth_headers)
    hc_id = res.json()["id"]

    # Deactivate
    res = await client.patch(
        f"/api/historical-cases/{hc_id}/toggle",
        json={"active": False},
        headers=auth_headers,
    )
    assert res.status_code == 200
    assert res.json()["active"] is False

    # Verify filtered out with active_only
    res = await client.get(
        "/api/historical-cases?active_only=true", headers=auth_headers
    )
    assert all(c["id"] != hc_id for c in res.json()["cases"])


@pytest.mark.asyncio
async def test_delete_historical_case(client: AsyncClient, auth_headers: dict):
    payload = {"company_name": "Del Corp"}
    res = await client.post("/api/historical-cases", json=payload, headers=auth_headers)
    hc_id = res.json()["id"]

    res = await client.delete(f"/api/historical-cases/{hc_id}", headers=auth_headers)
    assert res.status_code == 204

    res = await client.get("/api/historical-cases", headers=auth_headers)
    assert all(c["id"] != hc_id for c in res.json()["cases"])


@pytest.mark.asyncio
async def test_active_only_filter(client: AsyncClient, auth_headers: dict):
    """Create two regulations, deactivate one, verify active_only filter."""
    await client.post(
        "/api/regulations",
        json={"source_name": "Active Reg", "source_type": "regulation"},
        headers=auth_headers,
    )
    r2 = await client.post(
        "/api/regulations",
        json={"source_name": "Inactive Reg", "source_type": "regulation"},
        headers=auth_headers,
    )
    # Deactivate second
    await client.patch(
        f"/api/regulations/{r2.json()['id']}/toggle",
        json={"active": False},
        headers=auth_headers,
    )

    # Without filter — both
    res = await client.get("/api/regulations", headers=auth_headers)
    assert res.json()["total"] == 2

    # With active_only — only one
    res = await client.get("/api/regulations?active_only=true", headers=auth_headers)
    assert res.json()["total"] == 1
    assert res.json()["regulations"][0]["source_name"] == "Active Reg"


@pytest.mark.asyncio
async def test_create_regulation_with_pdf(client: AsyncClient, auth_headers: dict):
    """Upload a regulation with a PDF file attached."""
    pdf_content = b"%PDF-1.4 fake pdf content for testing"
    res = await client.post(
        "/api/regulations/upload",
        data={
            "source_name": "Internal Policy v2",
            "source_type": "guideline",
            "version": "2.0",
        },
        files={"file": ("policy.pdf", io.BytesIO(pdf_content), "application/pdf")},
        headers=auth_headers,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["source_name"] == "Internal Policy v2"
    assert data["source_type"] == "guideline"
    assert data["pdf_path"] is not None
    assert data["pdf_path"].endswith(".pdf")
    assert data["active"] is True


@pytest.mark.asyncio
async def test_create_regulation_pdf_rejects_non_pdf(
    client: AsyncClient, auth_headers: dict
):
    """Only PDF files should be accepted."""
    res = await client.post(
        "/api/regulations/upload",
        data={
            "source_name": "Bad File",
            "source_type": "regulation",
        },
        files={"file": ("notes.txt", io.BytesIO(b"text"), "text/plain")},
        headers=auth_headers,
    )
    assert res.status_code == 400
    assert "PDF" in res.json()["detail"]


@pytest.mark.asyncio
async def test_regulation_response_includes_pdf_path(
    client: AsyncClient, auth_headers: dict
):
    """Regulations without PDF should have pdf_path=null."""
    payload = {"source_name": "No PDF Reg", "source_type": "regulation"}
    res = await client.post("/api/regulations", json=payload, headers=auth_headers)
    assert res.status_code == 201
    assert res.json()["pdf_path"] is None
