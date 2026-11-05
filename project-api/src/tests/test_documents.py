"""Tests for Document endpoints."""

import io

import pytest


@pytest.mark.asyncio
async def test_upload_document(client, auth_headers, tmp_path):
    # Create case first
    res = await client.post(
        "/api/cases", json={"company_name": "DocTest Co"}, headers=auth_headers
    )
    case_id = res.json()["id"]

    # Upload a fake PDF
    content = b"%PDF-1.4 fake pdf content for testing"
    res2 = await client.post(
        f"/api/cases/{case_id}/documents",
        files={"file": ("report.pdf", io.BytesIO(content), "application/pdf")},
        headers=auth_headers,
    )
    assert res2.status_code == 201
    data = res2.json()
    assert data["filename"] == "report.pdf"
    assert data["file_type"] == "pdf"


@pytest.mark.asyncio
async def test_list_documents_empty(client, auth_headers):
    res = await client.post(
        "/api/cases", json={"company_name": "EmptyDocs Co"}, headers=auth_headers
    )
    case_id = res.json()["id"]
    res2 = await client.get(f"/api/cases/{case_id}/documents", headers=auth_headers)
    assert res2.status_code == 200
    assert res2.json()["documents"] == []


@pytest.mark.asyncio
async def test_upload_invalid_type(client, auth_headers):
    res = await client.post(
        "/api/cases", json={"company_name": "BadFile Co"}, headers=auth_headers
    )
    case_id = res.json()["id"]
    content = b"not a valid file"
    res2 = await client.post(
        f"/api/cases/{case_id}/documents",
        files={"file": ("data.exe", io.BytesIO(content), "application/octet-stream")},
        headers=auth_headers,
    )
    assert res2.status_code == 400
