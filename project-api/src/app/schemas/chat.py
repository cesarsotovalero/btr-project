"""Chat schemas — request/response models for the analyst chatbot."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Analyst question about the case",
    )


class ChatSourceResponse(BaseModel):
    document_name: str
    document_id: str = ""
    page: int | None = None
    excerpt: str = ""
    relevance: float = 0.0


class ChatResponse(BaseModel):
    answer: str
    sources: list[ChatSourceResponse] = []
    confidence: float = 0.0
