"""Chat API router — analyst chatbot for case Q&A."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.llm import get_llm_provider
from app.models.case import Case
from app.models.case_finding import CaseFinding
from app.models.document import Document
from app.models.document_extraction import DocumentExtraction
from app.models.risk_assessment import RiskAssessment
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(tags=["chat"])


@router.post("/cases/{case_id}/chat", response_model=ChatResponse)
async def chat_with_case(
    case_id: str,
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ask a question about a case — returns AI-generated answer with sources."""

    # 1. Load case
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Case not found."
        )

    # 2. Load documents
    doc_result = await db.execute(select(Document).where(Document.case_id == case_id))
    documents = doc_result.scalars().all()

    # 3. Load extractions for all documents
    doc_ids = [d.id for d in documents]
    extractions = []
    if doc_ids:
        ext_result = await db.execute(
            select(DocumentExtraction).where(
                DocumentExtraction.document_id.in_(doc_ids)
            )
        )
        extractions = ext_result.scalars().all()

    # 4. Load findings
    finding_result = await db.execute(
        select(CaseFinding)
        .where(CaseFinding.case_id == case_id)
        .order_by(CaseFinding.created_at.desc())
    )
    findings = finding_result.scalars().all()

    # 5. Load latest risk assessment
    risk_result = await db.execute(
        select(RiskAssessment)
        .where(RiskAssessment.case_id == case_id)
        .order_by(RiskAssessment.created_at.desc())
    )
    risk_assessment = risk_result.scalars().first()

    # 6. Prepare data dicts for LLM
    case_data = {
        "id": case.id,
        "case_number": case.case_number,
        "company_name": case.company_name,
        "sector": case.sector,
        "country": case.country,
        "status": case.status,
        "esg_relevant": case.esg_relevant,
        "description": case.description,
    }

    docs_data = [
        {
            "id": d.id,
            "filename": d.filename,
            "file_type": d.file_type,
            "file_size": d.file_size,
            "parsed_status": d.parsed_status,
        }
        for d in documents
    ]

    ext_data = [
        {
            "document_id": e.document_id,
            "extracted_text": (e.extracted_text or "")[:2000],
            "extracted_json": e.extracted_json,
            "confidence": e.confidence,
        }
        for e in extractions
    ]

    findings_data = [
        {
            "finding_type": f.finding_type,
            "severity": f.severity,
            "title": f.title,
            "description": f.description,
            "source_refs": f.source_refs,
            "created_by_agent": f.created_by_agent,
        }
        for f in findings
    ]

    risk_data = None
    if risk_assessment:
        risk_data = {
            "proposed_risk_class": risk_assessment.proposed_risk_class,
            "compliance_status": risk_assessment.compliance_status,
            "recommendation": risk_assessment.recommendation,
            "reasoning": risk_assessment.reasoning,
            "confidence": risk_assessment.confidence,
            "details": risk_assessment.details,
        }

    # 7. Call LLM
    llm = get_llm_provider()
    result = await llm.answer_case_question(
        question=body.question,
        case_data=case_data,
        documents=docs_data,
        extractions=ext_data,
        findings=findings_data,
        risk_assessment=risk_data,
    )

    return ChatResponse(
        answer=result.get("answer", "I was unable to generate an answer."),
        sources=result.get("sources", []),
        confidence=result.get("confidence", 0.0),
    )
