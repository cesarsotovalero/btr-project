"""Reference data API router — regulations and historical cases."""

import os
import uuid

import aiofiles
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models.historical_case import HistoricalCase
from app.models.regulation_source import RegulationSource
from app.models.user import User
from app.schemas.reference import (
    HistoricalCaseCreateBase,
    HistoricalCaseListResponse,
    HistoricalCaseSearchResponse,
    RegulationCreateBase,
    RegulationListResponse,
    ToggleActiveRequest,
)

router = APIRouter(tags=["references"])


# ── Regulations ──────────────────────────────────────────────────────────


@router.get("/regulations", response_model=RegulationListResponse)
async def list_regulations(
    active_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List regulation sources. Default shows all; pass active_only=true to filter."""
    query = select(RegulationSource)
    if active_only:
        query = query.where(RegulationSource.active.is_(True))
    query = query.order_by(RegulationSource.source_name)

    result = await db.execute(query)
    regulations = result.scalars().all()
    return RegulationListResponse(regulations=regulations, total=len(regulations))


@router.post("/regulations", status_code=status.HTTP_201_CREATED)
async def create_regulation(
    body: RegulationCreateBase,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new regulation source."""
    reg = RegulationSource(
        source_name=body.source_name,
        source_type=body.source_type,
        version=body.version,
        content_reference=body.content_reference,
        content_text=body.content_text,
        active=True,
    )
    db.add(reg)
    await db.commit()
    await db.refresh(reg)
    return reg


@router.post("/regulations/upload", status_code=status.HTTP_201_CREATED)
async def create_regulation_with_pdf(
    source_name: str = Form(...),
    source_type: str = Form(...),
    version: str | None = Form(None),
    content_reference: str | None = Form(None),
    content_text: str | None = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new regulation source with an uploaded PDF."""
    filename = file.filename or "regulation.pdf"
    ext = os.path.splitext(filename)[1].lower()
    if ext != ".pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed for regulations.",
        )

    # Save PDF to regulations subdirectory
    reg_dir = os.path.join(settings.upload_dir, "regulations")
    os.makedirs(reg_dir, exist_ok=True)
    file_id = str(uuid.uuid4())
    storage_path = os.path.join(reg_dir, f"{file_id}.pdf")

    content = await file.read()
    async with aiofiles.open(storage_path, "wb") as f:
        await f.write(content)

    # Extract text from PDF to populate content_text if not provided
    extracted_text = content_text
    if not extracted_text:
        try:
            from app.parsers.pdf_parser import parse_pdf

            result = await parse_pdf(storage_path, filename)
            extracted_text = result.get("full_text", "")[:50000]
        except Exception:
            extracted_text = None

    reg = RegulationSource(
        source_name=source_name,
        source_type=source_type,
        version=version,
        content_reference=content_reference,
        content_text=extracted_text,
        pdf_path=storage_path,
        active=True,
    )
    db.add(reg)
    await db.commit()
    await db.refresh(reg)
    return reg


@router.patch("/regulations/{regulation_id}/toggle")
async def toggle_regulation(
    regulation_id: str,
    body: ToggleActiveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle active status of a regulation source."""
    result = await db.execute(
        select(RegulationSource).where(RegulationSource.id == regulation_id)
    )
    reg = result.scalar_one_or_none()
    if not reg:
        raise HTTPException(status_code=404, detail="Regulation not found")
    reg.active = body.active
    await db.commit()
    await db.refresh(reg)
    return reg


@router.delete("/regulations/{regulation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_regulation(
    regulation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a regulation source."""
    result = await db.execute(
        select(RegulationSource).where(RegulationSource.id == regulation_id)
    )
    reg = result.scalar_one_or_none()
    if not reg:
        raise HTTPException(status_code=404, detail="Regulation not found")
    await db.delete(reg)
    await db.commit()


# ── Historical Cases ─────────────────────────────────────────────────────


@router.get("/historical-cases", response_model=HistoricalCaseListResponse)
async def list_historical_cases(
    active_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all historical cases. Default shows all; pass active_only=true to filter."""
    query = select(HistoricalCase)
    if active_only:
        query = query.where(HistoricalCase.active.is_(True))
    query = query.order_by(HistoricalCase.company_name)

    result = await db.execute(query)
    cases = result.scalars().all()
    return HistoricalCaseListResponse(cases=cases, total=len(cases))


@router.post("/historical-cases", status_code=status.HTTP_201_CREATED)
async def create_historical_case(
    body: HistoricalCaseCreateBase,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new historical case."""
    hc = HistoricalCase(
        company_name=body.company_name,
        sector=body.sector,
        country=body.country,
        revenue_band=body.revenue_band,
        debt_profile=body.debt_profile,
        outcome=body.outcome,
        final_risk_class=body.final_risk_class,
        decision_notes=body.decision_notes,
        active=True,
    )
    db.add(hc)
    await db.commit()
    await db.refresh(hc)
    return hc


@router.patch("/historical-cases/{case_id}/toggle")
async def toggle_historical_case(
    case_id: str,
    body: ToggleActiveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle active status of a historical case."""
    result = await db.execute(
        select(HistoricalCase).where(HistoricalCase.id == case_id)
    )
    hc = result.scalar_one_or_none()
    if not hc:
        raise HTTPException(status_code=404, detail="Historical case not found")
    hc.active = body.active
    await db.commit()
    await db.refresh(hc)
    return hc


@router.delete("/historical-cases/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_historical_case(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a historical case."""
    result = await db.execute(
        select(HistoricalCase).where(HistoricalCase.id == case_id)
    )
    hc = result.scalar_one_or_none()
    if not hc:
        raise HTTPException(status_code=404, detail="Historical case not found")
    await db.delete(hc)
    await db.commit()


@router.get("/historical-cases/search", response_model=HistoricalCaseSearchResponse)
async def search_historical_cases(
    sector: str | None = Query(None),
    country: str | None = Query(None),
    revenue_band: str | None = Query(None),
    debt_profile: str | None = Query(None),
    limit: int = Query(5, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search historical cases by similarity dimensions (active only)."""
    query = select(HistoricalCase).where(HistoricalCase.active.is_(True))
    filters = []

    if sector:
        filters.append(HistoricalCase.sector == sector)
    if country:
        filters.append(HistoricalCase.country == country)
    if revenue_band:
        filters.append(HistoricalCase.revenue_band == revenue_band)
    if debt_profile:
        filters.append(HistoricalCase.debt_profile == debt_profile)

    if filters:
        query = query.where(or_(*filters))

    query = query.limit(limit)
    result = await db.execute(query)
    cases = result.scalars().all()
    return HistoricalCaseSearchResponse(cases=cases, total=len(cases))
