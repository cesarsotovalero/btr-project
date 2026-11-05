"""Document API — upload, list, parse, extract, download, delete."""

import os
import uuid

import aiofiles
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models.audit_log import AuditLog
from app.models.case import Case
from app.models.document import Document
from app.models.document_extraction import DocumentExtraction
from app.models.user import User
from app.schemas.document import (
    DocumentListResponse,
    DocumentResponse,
    ExtractionResponse,
    ParseResponse,
)

router = APIRouter(tags=["documents"])

ALLOWED_EXTENSIONS = {
    ".pdf": "pdf",
    ".xlsx": "excel",
    ".xls": "excel",
    ".pptx": "pptx",
    ".ppt": "pptx",
    ".png": "image",
    ".jpg": "image",
    ".jpeg": "image",
    ".txt": "text",
    ".csv": "csv",
}


@router.post(
    "/cases/{case_id}/documents",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    case_id: str,
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a document to a case."""
    # Verify case exists
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Case not found."
        )

    # Validate file type
    filename = file.filename or "unknown"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        allowed = list(ALLOWED_EXTENSIONS.keys())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' not supported. Allowed: {allowed}",
        )

    file_type = ALLOWED_EXTENSIONS[ext]

    # Save file to disk
    case_dir = os.path.join(settings.upload_dir, str(case_id))
    os.makedirs(case_dir, exist_ok=True)
    doc_id = str(uuid.uuid4())
    storage_path = os.path.join(case_dir, f"{doc_id}{ext}")

    content = await file.read()
    async with aiofiles.open(storage_path, "wb") as f:
        await f.write(content)

    # Create DB record
    doc = Document(
        id=doc_id,
        case_id=case_id,
        filename=filename,
        file_type=file_type,
        storage_path=storage_path,
        file_size=len(content),
        upload_status="uploaded",
        parsed_status="pending",
    )
    db.add(doc)

    # Advance case status to 'uploaded' if still in initial 'created' state
    if case.status == "created":
        case.status = "uploaded"

    db.add(
        AuditLog(
            case_id=case_id,
            event_type="document_uploaded",
            actor=current_user.full_name or current_user.username,
            payload={
                "filename": filename,
                "file_type": file_type,
                "size": len(content),
            },
        )
    )
    await db.flush()
    return doc


@router.get("/cases/{case_id}/documents", response_model=DocumentListResponse)
async def list_documents(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all documents for a case."""
    result = await db.execute(
        select(Document)
        .where(Document.case_id == case_id)
        .order_by(Document.created_at.desc())
    )
    docs = result.scalars().all()
    return DocumentListResponse(documents=docs, total=len(docs))


@router.post("/documents/{document_id}/parse", response_model=ParseResponse)
async def parse_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger parsing of an uploaded document."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found."
        )

    if doc.parsed_status == "completed":
        return ParseResponse(
            document_id=doc.id,
            status="already_parsed",
            message="Document has already been parsed.",
        )

    # Import parser and run synchronously for prototype
    from app.parsers import parse_document as run_parser

    try:
        extraction_data = await run_parser(doc)
        doc.parsed_status = "completed"

        extraction = DocumentExtraction(
            document_id=doc.id,
            extracted_text=extraction_data.get("full_text"),
            extracted_json=extraction_data,
            confidence=extraction_data.get("confidence", 0.0),
        )
        db.add(extraction)

        db.add(
            AuditLog(
                case_id=doc.case_id,
                event_type="document_parsed",
                actor="parser",
                payload={
                    "document_id": str(doc.id),
                    "file_type": doc.file_type,
                    "ocr_used": extraction_data.get("ocr_used", False),
                },
            )
        )

        if extraction_data.get("ocr_used"):
            doc.ocr_used = True

        await db.flush()
        return ParseResponse(
            document_id=doc.id,
            status="completed",
            message="Document parsed successfully.",
            extraction_id=extraction.id,
        )
    except Exception as e:
        doc.parsed_status = "failed"
        await db.flush()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Parsing failed: {str(e)}",
        )


@router.get("/documents/{document_id}/extraction", response_model=ExtractionResponse)
async def get_extraction(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get extraction results for a document."""
    result = await db.execute(
        select(DocumentExtraction)
        .where(DocumentExtraction.document_id == document_id)
        .order_by(DocumentExtraction.created_at.desc())
    )
    extraction = result.scalars().first()
    if not extraction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No extraction found for this document.",
        )
    return extraction


@router.get("/documents/{document_id}/download")
async def download_document(
    document_id: str,
    token: str | None = Query(None, description="JWT token (for browser downloads)"),
    db: AsyncSession = Depends(get_db),
):
    """Download an uploaded document.

    Accepts authentication via a `token` query parameter
    (needed for direct browser downloads via <a> tags,
    which cannot set custom headers).
    """
    from app.auth import decode_access_token

    user = None

    # Authenticate via query-param token
    if token:
        user_id = decode_access_token(token)
        if user_id:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found."
        )

    if not os.path.isfile(doc.storage_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk.",
        )

    return FileResponse(
        path=doc.storage_path,
        filename=doc.filename,
        media_type="application/octet-stream",
    )


@router.delete(
    "/documents/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an uploaded document and its file from disk."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found."
        )

    case_id = doc.case_id

    # Delete associated extractions first
    ext_result = await db.execute(
        select(DocumentExtraction).where(DocumentExtraction.document_id == document_id)
    )
    for ext in ext_result.scalars().all():
        await db.delete(ext)

    # Delete file from disk (best-effort)
    if doc.storage_path and os.path.isfile(doc.storage_path):
        try:
            os.remove(doc.storage_path)
        except OSError:
            pass  # log but don't fail the request

    await db.delete(doc)

    db.add(
        AuditLog(
            case_id=case_id,
            event_type="document_deleted",
            actor=current_user.full_name or current_user.username,
            payload={
                "document_id": document_id,
                "filename": doc.filename,
            },
        )
    )
    await db.commit()
    return None
