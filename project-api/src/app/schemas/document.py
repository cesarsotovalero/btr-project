"""Document schemas — request/response models for document endpoints."""

from datetime import datetime

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: str
    case_id: str
    filename: str
    file_type: str
    storage_path: str
    file_size: int | None
    upload_status: str
    parsed_status: str
    ocr_used: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    total: int


class ExtractionResponse(BaseModel):
    id: str
    document_id: str
    extracted_text: str | None
    extracted_json: dict | None
    confidence: float | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ParseResponse(BaseModel):
    document_id: str
    status: str
    message: str
    extraction_id: str | None = None
