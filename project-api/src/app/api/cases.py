"""Case API router — CRUD endpoints for risk assessment cases."""

import os
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete as sa_delete
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models.agent_run import AgentRun
from app.models.analyst_review import AnalystReview
from app.models.audit_log import AuditLog
from app.models.case import Case
from app.models.case_finding import CaseFinding
from app.models.document import Document
from app.models.document_extraction import DocumentExtraction
from app.models.esg_assessment import EsgAssessment
from app.models.evidence_ref import EvidenceRef
from app.models.risk_assessment import RiskAssessment
from app.models.user import User
from app.models.workflow_checkpoint import WorkflowCheckpoint
from app.schemas.case import CaseCreate, CaseListResponse, CaseResponse, CaseUpdate

router = APIRouter(prefix="/cases", tags=["cases"])


def _generate_case_number() -> str:
    now = datetime.now(UTC)
    short_id = uuid.uuid4().hex[:4].upper()
    return f"BTR-{now.year}-{short_id}"


@router.post("", response_model=CaseResponse)
async def create_case(
    data: CaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new risk assessment case."""
    # Check for duplicate company
    existing = await db.execute(
        select(Case).where(Case.company_name == data.company_name)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A case for company '{data.company_name}' already exists.",
        )

    case_number = _generate_case_number()
    case = Case(case_number=case_number, owner_id=current_user.id, **data.model_dump())
    db.add(case)
    await db.flush()

    # Audit log
    db.add(
        AuditLog(
            case_id=case.id,
            event_type="case_created",
            actor=current_user.full_name or current_user.username,
            payload={"case_number": case.case_number},
        )
    )
    await db.flush()
    return case


@router.get("", response_model=CaseListResponse)
async def list_cases(
    skip: int = 0,
    limit: int = 50,
    status_filter: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all cases with optional status filter."""
    query = select(Case)
    count_query = select(func.count(Case.id))

    if status_filter:
        query = query.where(Case.status == status_filter)
        count_query = count_query.where(Case.status == status_filter)

    query = query.order_by(Case.created_at.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    cases = result.scalars().all()

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return CaseListResponse(cases=cases, total=total)


@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single case by ID."""
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found.",
        )
    return case


@router.patch("/{case_id}", response_model=CaseResponse)
async def update_case(
    case_id: str,
    data: CaseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update case fields."""
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found.",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(case, field, value)

    db.add(
        AuditLog(
            case_id=case.id,
            event_type="case_updated",
            actor=current_user.full_name or current_user.username,
            payload={"updated_fields": list(update_data.keys())},
        )
    )
    await db.flush()
    await db.refresh(case)
    return case


@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_case(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a case and all associated data from the database."""
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found.",
        )

    # Delete children in dependency order (deepest first).

    # 1. Evidence refs (FK → case_findings)
    finding_ids_q = select(CaseFinding.id).where(CaseFinding.case_id == case_id)
    await db.execute(
        sa_delete(EvidenceRef).where(EvidenceRef.finding_id.in_(finding_ids_q))
    )

    # 2. Case findings
    await db.execute(sa_delete(CaseFinding).where(CaseFinding.case_id == case_id))

    # 3. Document extractions (FK → documents)
    doc_ids_q = select(Document.id).where(Document.case_id == case_id)
    await db.execute(
        sa_delete(DocumentExtraction).where(
            DocumentExtraction.document_id.in_(doc_ids_q)
        )
    )

    # 4. Delete document files from disk, then document rows
    doc_result = await db.execute(select(Document).where(Document.case_id == case_id))
    for doc in doc_result.scalars().all():
        if doc.storage_path and os.path.isfile(doc.storage_path):
            try:
                os.remove(doc.storage_path)
            except OSError:
                pass
        await db.delete(doc)

    # 5. Remaining direct children
    await db.execute(sa_delete(AgentRun).where(AgentRun.case_id == case_id))
    await db.execute(sa_delete(AnalystReview).where(AnalystReview.case_id == case_id))
    await db.execute(sa_delete(AuditLog).where(AuditLog.case_id == case_id))
    await db.execute(sa_delete(EsgAssessment).where(EsgAssessment.case_id == case_id))
    await db.execute(sa_delete(RiskAssessment).where(RiskAssessment.case_id == case_id))
    await db.execute(
        sa_delete(WorkflowCheckpoint).where(WorkflowCheckpoint.case_id == case_id)
    )

    # 6. Delete the case itself
    await db.delete(case)
    await db.commit()
    return None
