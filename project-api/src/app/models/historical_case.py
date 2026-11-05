"""HistoricalCase model — past case outcomes for similarity retrieval."""

import uuid
from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class HistoricalCase(Base):
    __tablename__ = "historical_cases"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    company_name: Mapped[str] = mapped_column(String(256), nullable=False)
    sector: Mapped[str | None] = mapped_column(String(128))
    country: Mapped[str | None] = mapped_column(String(128))
    revenue_band: Mapped[str | None] = mapped_column(String(64))
    debt_profile: Mapped[str | None] = mapped_column(String(64))
    outcome: Mapped[str | None] = mapped_column(String(64))
    final_risk_class: Mapped[str | None] = mapped_column(String(64))
    decision_notes: Mapped[str | None] = mapped_column(Text)
    case_features: Mapped[dict | None] = mapped_column(JSON)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
