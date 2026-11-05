from __future__ import annotations

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.agents import workflow
from app.models import AgentRun, Case, Document, WorkflowCheckpoint


async def _seed_case_with_agent_runs(db_session: AsyncSession) -> Case:
    case = Case(
        case_number="BTR-WF-TEST-001",
        company_name="Workflow Test Co",
        sector="Energy",
        country="SE",
        status="analyzing",
    )
    db_session.add(case)
    await db_session.flush()

    doc = Document(
        case_id=case.id,
        filename="financials.pdf",
        file_type="pdf",
        storage_path="/tmp/financials.pdf",
        parsed_status="completed",
    )
    db_session.add(doc)

    for agent_name in workflow.AGENT_NAMES:
        db_session.add(
            AgentRun(
                case_id=case.id,
                agent_name=agent_name,
                status="pending",
            )
        )

    await db_session.commit()
    return case


def _patch_workflow_session(db_session: AsyncSession, monkeypatch) -> None:
    session_factory = async_sessionmaker(
        db_session.bind,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    monkeypatch.setattr(workflow, "async_session", session_factory)


@pytest.mark.asyncio
async def test_run_workflow_extraction_failure_marks_case_failed(
    db_session: AsyncSession, monkeypatch
) -> None:
    case = await _seed_case_with_agent_runs(db_session)
    _patch_workflow_session(db_session, monkeypatch)

    async def fake_intake(case_data: dict, documents: list[dict]) -> dict:
        return {"ok": True}

    async def fake_extraction(documents: list[dict], extractions: list[dict]) -> dict:
        raise RuntimeError("extraction exploded")

    monkeypatch.setattr(workflow, "run_intake_agent", fake_intake)
    monkeypatch.setattr(workflow, "run_extraction_agent", fake_extraction)

    result = await workflow.run_workflow(case.id)

    assert result["status"] == "failed"
    assert any("extraction_agent" in err for err in result["errors"])

    case_status_row = (
        await db_session.execute(
            select(Case.status, Case.workflow_paused_at_checkpoint).where(
                Case.id == case.id
            )
        )
    ).one()
    assert case_status_row[0] == "failed"
    assert case_status_row[1] is None

    checkpoints = (
        (
            await db_session.execute(
                select(WorkflowCheckpoint).where(WorkflowCheckpoint.case_id == case.id)
            )
        )
        .scalars()
        .all()
    )
    assert checkpoints == []

    run_statuses = dict(
        (
            await db_session.execute(
                select(AgentRun.agent_name, AgentRun.status).where(
                    AgentRun.case_id == case.id
                )
            )
        ).all()
    )
    assert run_statuses["intake_agent"] == "completed"
    assert run_statuses["extraction_agent"] == "failed"
    assert all(status not in {"pending", "running"} for status in run_statuses.values())


@pytest.mark.asyncio
async def test_run_workflow_phase1_success_pauses_at_post_extraction(
    db_session: AsyncSession, monkeypatch
) -> None:
    case = await _seed_case_with_agent_runs(db_session)
    _patch_workflow_session(db_session, monkeypatch)

    async def fake_intake(case_data: dict, documents: list[dict]) -> dict:
        return {"ok": True}

    async def fake_extraction(documents: list[dict], extractions: list[dict]) -> dict:
        return {"document_count": len(documents)}

    monkeypatch.setattr(workflow, "run_intake_agent", fake_intake)
    monkeypatch.setattr(workflow, "run_extraction_agent", fake_extraction)

    result = await workflow.run_workflow(case.id)

    assert result["status"] == "paused"
    assert result["checkpoint"] == "post_extraction"

    case_status_row = (
        await db_session.execute(
            select(Case.status, Case.workflow_paused_at_checkpoint).where(
                Case.id == case.id
            )
        )
    ).one()
    assert case_status_row[0] == "checkpoint_pending"
    assert case_status_row[1] == "post_extraction"

    checkpoints = (
        (
            await db_session.execute(
                select(WorkflowCheckpoint).where(WorkflowCheckpoint.case_id == case.id)
            )
        )
        .scalars()
        .all()
    )
    assert len(checkpoints) == 1
    assert checkpoints[0].checkpoint_name == "post_extraction"
    assert checkpoints[0].status == "pending"

    statuses = dict(
        (
            await db_session.execute(
                select(AgentRun.agent_name, AgentRun.status).where(
                    AgentRun.case_id == case.id
                )
            )
        ).all()
    )
    assert statuses["intake_agent"] == "completed"
    assert statuses["extraction_agent"] == "completed"
