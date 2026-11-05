"""Tests for checkpoint and ESG API endpoints."""

import pytest

from app.models import Case, WorkflowCheckpoint


@pytest.mark.asyncio
async def test_get_checkpoints_empty(client, auth_headers, db_session):
    """Returns empty list when no checkpoints exist."""
    case = Case(
        case_number="BTR-TEST-CP-001",
        company_name="Test Corp",
        sector="Energy",
        country="Sweden",
        status="new",
    )
    db_session.add(case)
    await db_session.flush()

    resp = await client.get(f"/api/cases/{case.id}/checkpoints", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["checkpoints"] == []


@pytest.mark.asyncio
async def test_get_checkpoints_with_pending(client, auth_headers, db_session):
    """Returns pending checkpoint."""
    case = Case(
        case_number="BTR-TEST-CP-002",
        company_name="Test Corp",
        sector="Energy",
        country="Sweden",
        status="checkpoint_pending",
        workflow_paused_at_checkpoint="post_extraction",
    )
    db_session.add(case)
    await db_session.flush()

    cp = WorkflowCheckpoint(
        case_id=case.id,
        checkpoint_name="post_extraction",
        status="pending",
    )
    db_session.add(cp)
    await db_session.flush()

    resp = await client.get(f"/api/cases/{case.id}/checkpoints", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["checkpoints"][0]["status"] == "pending"
    assert data["checkpoints"][0]["checkpoint_name"] == "post_extraction"


@pytest.mark.asyncio
async def test_approve_checkpoint(client, auth_headers, db_session):
    """Approving a checkpoint updates status."""
    case = Case(
        case_number="BTR-TEST-CP-003",
        company_name="Test Corp",
        sector="Energy",
        country="Sweden",
        status="checkpoint_pending",
    )
    db_session.add(case)
    await db_session.flush()

    cp = WorkflowCheckpoint(
        case_id=case.id,
        checkpoint_name="post_extraction",
        status="pending",
    )
    db_session.add(cp)
    await db_session.flush()

    resp = await client.post(
        f"/api/cases/{case.id}/checkpoints/{cp.id}/approve",
        json={"reviewer_name": "analyst1", "comment": "Looks good"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "approved"


@pytest.mark.asyncio
async def test_reject_checkpoint(client, auth_headers, db_session):
    """Rejecting a checkpoint updates status."""
    case = Case(
        case_number="BTR-TEST-CP-004",
        company_name="Test Corp",
        sector="Energy",
        country="Sweden",
        status="checkpoint_pending",
    )
    db_session.add(case)
    await db_session.flush()

    cp = WorkflowCheckpoint(
        case_id=case.id,
        checkpoint_name="post_regulation",
        status="pending",
    )
    db_session.add(cp)
    await db_session.flush()

    resp = await client.post(
        f"/api/cases/{case.id}/checkpoints/{cp.id}/reject",
        json={"reviewer_name": "analyst2", "comment": "Data quality insufficient"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "rejected"


@pytest.mark.asyncio
async def test_reject_already_resolved(client, auth_headers, db_session):
    """Cannot reject an already resolved checkpoint."""
    case = Case(
        case_number="BTR-TEST-CP-005",
        company_name="Test Corp",
        sector="Energy",
        country="Sweden",
        status="analyzing",
    )
    db_session.add(case)
    await db_session.flush()

    cp = WorkflowCheckpoint(
        case_id=case.id,
        checkpoint_name="post_extraction",
        status="approved",
    )
    db_session.add(cp)
    await db_session.flush()

    resp = await client.post(
        f"/api/cases/{case.id}/checkpoints/{cp.id}/reject",
        json={"reviewer_name": "analyst3", "comment": "Too late"},
        headers=auth_headers,
    )
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_get_esg_assessment_not_found(client, auth_headers, db_session):
    """Returns null (200) when no ESG assessment exists."""
    case = Case(
        case_number="BTR-TEST-ESG-001",
        company_name="Test Corp",
        sector="Energy",
        country="Sweden",
        status="new",
    )
    db_session.add(case)
    await db_session.flush()

    resp = await client.get(
        f"/api/cases/{case.id}/esg-assessment", headers=auth_headers
    )
    assert resp.status_code == 200
    assert resp.json() is None


@pytest.mark.asyncio
async def test_analyze_conflict_when_case_is_analyzing(
    client, auth_headers, db_session
):
    """Cannot trigger analysis again while case status is already analyzing."""
    case = Case(
        case_number="BTR-TEST-ANL-001",
        company_name="Test Corp",
        sector="Energy",
        country="Sweden",
        status="analyzing",
    )
    db_session.add(case)
    await db_session.flush()

    resp = await client.post(
        f"/api/cases/{case.id}/analyze",
        json={},
        headers=auth_headers,
    )
    assert resp.status_code == 409
    assert resp.json()["detail"] == "Analysis already in progress for this case."


@pytest.mark.asyncio
async def test_analyze_conflict_when_case_is_checkpoint_pending(
    client, auth_headers, db_session
):
    """Cannot trigger analysis while case is paused at a checkpoint."""
    case = Case(
        case_number="BTR-TEST-ANL-002",
        company_name="Test Corp",
        sector="Energy",
        country="Sweden",
        status="checkpoint_pending",
        workflow_paused_at_checkpoint="post_extraction",
    )
    db_session.add(case)
    await db_session.flush()

    resp = await client.post(
        f"/api/cases/{case.id}/analyze",
        json={},
        headers=auth_headers,
    )
    assert resp.status_code == 409
    assert (
        resp.json()["detail"] == "Case is paused at a checkpoint."
        " Resolve the checkpoint before starting a new analysis."
    )
