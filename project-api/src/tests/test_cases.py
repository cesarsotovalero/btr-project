"""Tests for Case endpoints."""

import pytest


@pytest.mark.asyncio
async def test_health(client):
    res = await client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_unauthenticated_request(client):
    res = await client.get("/api/cases")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_create_case(client, auth_headers):
    res = await client.post(
        "/api/cases",
        json={
            "company_name": "Test Corp",
            "sector": "Technology",
            "country": "Sweden",
        },
        headers=auth_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["company_name"] == "Test Corp"
    assert data["case_number"].startswith("BTR-")
    assert data["status"] == "created"
    return data


@pytest.mark.asyncio
async def test_list_cases_empty(client, auth_headers):
    res = await client.get("/api/cases", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 0
    assert data["cases"] == []


@pytest.mark.asyncio
async def test_create_and_list_cases(client, auth_headers):
    # Create
    res = await client.post(
        "/api/cases",
        json={
            "company_name": "Alpha AB",
            "sector": "Energy",
            "country": "Norway",
        },
        headers=auth_headers,
    )
    assert res.status_code == 200
    case_id = res.json()["id"]

    # List
    res2 = await client.get("/api/cases", headers=auth_headers)
    assert res2.status_code == 200
    assert res2.json()["total"] == 1

    # Get by ID
    res3 = await client.get(f"/api/cases/{case_id}", headers=auth_headers)
    assert res3.status_code == 200
    assert res3.json()["company_name"] == "Alpha AB"


@pytest.mark.asyncio
async def test_update_case(client, auth_headers):
    res = await client.post(
        "/api/cases",
        json={
            "company_name": "Beta Oy",
        },
        headers=auth_headers,
    )
    case_id = res.json()["id"]

    res2 = await client.patch(
        f"/api/cases/{case_id}",
        json={
            "sector": "Finance",
            "country": "Finland",
        },
        headers=auth_headers,
    )
    assert res2.status_code == 200
    assert res2.json()["sector"] == "Finance"


@pytest.mark.asyncio
async def test_get_case_not_found(client, auth_headers):
    res = await client.get("/api/cases/nonexistent-id", headers=auth_headers)
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_duplicate_company(client, auth_headers):
    await client.post(
        "/api/cases", json={"company_name": "Dup Co"}, headers=auth_headers
    )
    res2 = await client.post(
        "/api/cases", json={"company_name": "Dup Co"}, headers=auth_headers
    )
    assert res2.status_code == 400


@pytest.mark.asyncio
async def test_delete_case(client, auth_headers):
    """Deleting a case removes it and returns 204."""
    res = await client.post(
        "/api/cases",
        json={"company_name": "Delete Me AB", "sector": "Energy", "country": "Sweden"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    case_id = res.json()["id"]

    # Delete
    res2 = await client.delete(f"/api/cases/{case_id}", headers=auth_headers)
    assert res2.status_code == 204

    # Confirm gone
    res3 = await client.get(f"/api/cases/{case_id}", headers=auth_headers)
    assert res3.status_code == 404


@pytest.mark.asyncio
async def test_delete_case_not_found(client, auth_headers):
    """Deleting a non-existent case returns 404."""
    res = await client.delete("/api/cases/nonexistent-id", headers=auth_headers)
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_delete_case_with_documents(client, auth_headers):
    """Deleting a case with uploaded documents succeeds."""
    # Create case
    res = await client.post(
        "/api/cases",
        json={"company_name": "DocDel Corp"},
        headers=auth_headers,
    )
    case_id = res.json()["id"]

    # Upload a document
    import io

    fake_file = io.BytesIO(b"fake pdf content")
    await client.post(
        f"/api/cases/{case_id}/documents",
        files={"file": ("report.pdf", fake_file, "application/pdf")},
        data={"document_type": "annual_report"},
        headers=auth_headers,
    )

    # Delete case (should cascade to docs)
    res2 = await client.delete(f"/api/cases/{case_id}", headers=auth_headers)
    assert res2.status_code == 204

    # Verify case is gone
    res3 = await client.get(f"/api/cases/{case_id}", headers=auth_headers)
    assert res3.status_code == 404
