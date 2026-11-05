"""Initial schema with all 10 tables.

Revision ID: 001
Revises:
Create Date: 2026-03-08
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Cases
    op.create_table(
        "cases",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("case_number", sa.String(64), unique=True, nullable=False),
        sa.Column("company_name", sa.String(256), nullable=False),
        sa.Column("sector", sa.String(128)),
        sa.Column("country", sa.String(128)),
        sa.Column("status", sa.String(32), nullable=False, server_default="created"),
        sa.Column("description", sa.Text),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_cases_case_number", "cases", ["case_number"])

    # Documents
    op.create_table(
        "documents",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "case_id",
            sa.String(36),
            sa.ForeignKey("cases.id"),
            nullable=False,
        ),
        sa.Column("filename", sa.String(512), nullable=False),
        sa.Column("file_type", sa.String(32), nullable=False),
        sa.Column("storage_path", sa.String(1024), nullable=False),
        sa.Column("file_size", sa.Integer),
        sa.Column(
            "upload_status",
            sa.String(32),
            nullable=False,
            server_default="uploaded",
        ),
        sa.Column(
            "parsed_status",
            sa.String(32),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("ocr_used", sa.Boolean, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_documents_case_id", "documents", ["case_id"])

    # Document Extractions
    op.create_table(
        "document_extractions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "document_id",
            sa.String(36),
            sa.ForeignKey("documents.id"),
            nullable=False,
        ),
        sa.Column("extracted_text", sa.Text),
        sa.Column("extracted_json", sa.JSON),
        sa.Column("confidence", sa.Float),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index(
        "ix_document_extractions_document_id",
        "document_extractions",
        ["document_id"],
    )

    # Regulation Sources
    op.create_table(
        "regulation_sources",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("source_name", sa.String(256), nullable=False),
        sa.Column("source_type", sa.String(64), nullable=False),
        sa.Column("version", sa.String(64)),
        sa.Column("content_reference", sa.Text),
        sa.Column("content_text", sa.Text),
        sa.Column("active", sa.Boolean, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )

    # Case Findings
    op.create_table(
        "case_findings",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "case_id",
            sa.String(36),
            sa.ForeignKey("cases.id"),
            nullable=False,
        ),
        sa.Column("finding_type", sa.String(64), nullable=False),
        sa.Column("severity", sa.String(32), nullable=False, server_default="info"),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("source_refs", sa.JSON),
        sa.Column("created_by_agent", sa.String(128)),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_case_findings_case_id", "case_findings", ["case_id"])

    # Risk Assessments
    op.create_table(
        "risk_assessments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "case_id",
            sa.String(36),
            sa.ForeignKey("cases.id"),
            nullable=False,
        ),
        sa.Column("proposed_risk_class", sa.String(64), nullable=False),
        sa.Column("compliance_status", sa.String(64), nullable=False),
        sa.Column("recommendation", sa.Text),
        sa.Column("reasoning", sa.Text),
        sa.Column("confidence", sa.Float),
        sa.Column("details", sa.JSON),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_risk_assessments_case_id", "risk_assessments", ["case_id"])

    # Historical Cases
    op.create_table(
        "historical_cases",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("company_name", sa.String(256), nullable=False),
        sa.Column("sector", sa.String(128)),
        sa.Column("country", sa.String(128)),
        sa.Column("revenue_band", sa.String(64)),
        sa.Column("debt_profile", sa.String(64)),
        sa.Column("outcome", sa.String(64)),
        sa.Column("final_risk_class", sa.String(64)),
        sa.Column("decision_notes", sa.Text),
        sa.Column("case_features", sa.JSON),
        sa.Column("closed_at", sa.DateTime(timezone=True)),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )

    # Agent Runs
    op.create_table(
        "agent_runs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "case_id",
            sa.String(36),
            sa.ForeignKey("cases.id"),
            nullable=False,
        ),
        sa.Column("agent_name", sa.String(128), nullable=False),
        sa.Column("input_snapshot", sa.JSON),
        sa.Column("output_snapshot", sa.JSON),
        sa.Column("status", sa.String(32), nullable=False, server_default="pending"),
        sa.Column("error_message", sa.Text),
        sa.Column("started_at", sa.DateTime(timezone=True)),
        sa.Column("ended_at", sa.DateTime(timezone=True)),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_agent_runs_case_id", "agent_runs", ["case_id"])

    # Analyst Reviews
    op.create_table(
        "analyst_reviews",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "case_id",
            sa.String(36),
            sa.ForeignKey("cases.id"),
            nullable=False,
        ),
        sa.Column("reviewer_name", sa.String(256), nullable=False),
        sa.Column("action", sa.String(32), nullable=False),
        sa.Column("comment", sa.Text),
        sa.Column(
            "reviewed_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_analyst_reviews_case_id", "analyst_reviews", ["case_id"])

    # Audit Logs
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "case_id",
            sa.String(36),
            sa.ForeignKey("cases.id"),
            nullable=False,
        ),
        sa.Column("event_type", sa.String(64), nullable=False),
        sa.Column("actor", sa.String(256), nullable=False),
        sa.Column("payload", sa.JSON),
        sa.Column(
            "timestamp",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_audit_logs_case_id", "audit_logs", ["case_id"])


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("analyst_reviews")
    op.drop_table("agent_runs")
    op.drop_table("historical_cases")
    op.drop_table("risk_assessments")
    op.drop_table("case_findings")
    op.drop_table("regulation_sources")
    op.drop_table("document_extractions")
    op.drop_table("documents")
    op.drop_table("cases")
