"""
Seed data loader — populates the database with:
  • 10 regulation sources
  • 5 historical cases
  • 2 active sample cases
"""

import asyncio
import uuid

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import hash_password
from app.database import async_session, engine, init_db
from app.models import Case, HistoricalCase, RegulationSource
from app.models.user import User

# ---------- Regulation sources ----------
REGULATIONS = [
    {
        "source_name": "EU Capital Requirements Regulation (CRR)",
        "source_type": "regulation",
        "version": "2024.1",
        "content_text": (
            "The CRR establishes prudential requirements for credit institutions "
            "and investment firms. It covers own funds, capital requirements, "
            "large exposures, liquidity, leverage, and reporting obligations."
        ),
        "active": True,
    },
    {
        "source_name": "Anti-Money Laundering Directive (AMLD6)",
        "source_type": "directive",
        "version": "2024.2",
        "content_text": (
            "AMLD6 strengthens the EU framework for preventing money laundering "
            "and terrorist financing. Requires enhanced due diligence for high-risk "
            "third countries and politically exposed persons."
        ),
        "active": True,
    },
    {
        "source_name": "Basel III Final Framework",
        "source_type": "standard",
        "version": "2023.12",
        "content_text": (
            "Basel III reforms strengthen the regulation, supervision and risk "
            "management of banks. Includes revised standardised approaches for "
            "credit risk, operational risk, and the output floor."
        ),
        "active": True,
    },
    {
        "source_name": "IFRS 9 — Financial Instruments",
        "source_type": "accounting",
        "version": "2024.1",
        "content_text": (
            "IFRS 9 addresses classification, measurement, impairment and hedge "
            "accounting for financial instruments. Introduces expected credit loss "
            "model replacing incurred loss model."
        ),
        "active": True,
    },
    {
        "source_name": "EBA Guidelines on Loan Origination",
        "source_type": "guideline",
        "version": "2023.6",
        "content_text": (
            "EBA guidelines specify internal governance arrangements, procedures "
            "and mechanisms for credit granting. Covers creditworthiness assessment, "
            "collateral valuation and ongoing monitoring."
        ),
        "active": True,
    },
    {
        "source_name": "Swedish Financial Supervisory Authority (FI) Regulations",
        "source_type": "regulation",
        "version": "2024.3",
        "content_text": (
            "FI regulations for Swedish credit institutions covering capital "
            "adequacy, risk management, governance requirements, and reporting "
            "obligations specific to the Swedish market."
        ),
        "active": True,
    },
    {
        "source_name": "DORA — Digital Operational Resilience Act",
        "source_type": "regulation",
        "version": "2025.1",
        "content_text": (
            "DORA establishes ICT risk management requirements for financial "
            "entities. Covers ICT risk management frameworks, incident reporting, "
            "digital operational resilience testing, and third-party risk."
        ),
        "active": True,
    },
    {
        "source_name": "EU Taxonomy Regulation",
        "source_type": "regulation",
        "version": "2024.1",
        "content_text": (
            "The EU Taxonomy establishes a classification system for "
            "environmentally sustainable economic activities. Financial institutions "
            "must disclose the proportion of taxonomy-aligned exposures."
        ),
        "active": True,
    },
    {
        "source_name": "Internal Credit Policy v4.2",
        "source_type": "internal_policy",
        "version": "4.2",
        "content_text": (
            "Internal credit risk policy defining risk appetite, exposure limits "
            "by sector, geographic concentration limits, delegation of authority "
            "framework, and escalation procedures for high-risk cases."
        ),
        "active": True,
    },
    {
        "source_name": "SEB Group Risk Classification Framework",
        "source_type": "internal_policy",
        "version": "3.1",
        "content_text": (
            "Framework for classifying counterparty risk into classes: low, "
            "medium, high, critical. Defines scoring methodology, factor weights, "
            "override procedures, and annual review requirements."
        ),
        "active": True,
    },
    {
        "source_name": "EU AI Act — Financial Services Annex",
        "source_type": "regulation",
        "version": "2025.1",
        "content_text": (
            "The EU AI Act classifies AI systems used in creditworthiness "
            "assessment as high-risk. Mandates human oversight, transparency, "
            "accuracy monitoring, and conformity assessments for AI systems "
            "deployed by financial institutions."
        ),
        "active": True,
    },
    {
        "source_name": "CSRD — Corporate Sustainability Reporting Directive",
        "source_type": "directive",
        "version": "2024.1",
        "content_text": (
            "CSRD requires large companies and listed SMEs to report on ESG "
            "topics using ESRS. Financial institutions must evaluate borrower "
            "ESG disclosures for double-materiality and transition risk."
        ),
        "active": True,
    },
    {
        "source_name": "ECB Guide on Climate and Environmental Risks",
        "source_type": "guideline",
        "version": "2024.2",
        "content_text": (
            "ECB supervisory expectations for banks to identify, measure, "
            "manage, and disclose climate-related and environmental risks. "
            "Covers governance, risk appetite, scenario analysis, and "
            "stress testing for transition and physical risks."
        ),
        "active": True,
    },
]

# ---------- Historical cases ----------
HISTORICAL_CASES = [
    {
        "company_name": "ScandiSteel AB",
        "sector": "Manufacturing",
        "country": "Sweden",
        "revenue_band": "100M-500M",
        "debt_profile": "moderate",
        "outcome": "Approved with conditions — required quarterly reporting",
        "final_risk_class": "medium",
        "case_features": {
            "leverage_ratio": 3.2,
            "interest_coverage": 4.5,
            "years_in_business": 22,
            "esg_score": "B+",
        },
    },
    {
        "company_name": "Nordic Shipping Group",
        "sector": "Transportation",
        "country": "Norway",
        "revenue_band": "500M-1B",
        "debt_profile": "high",
        "outcome": "Approved — strong cash flow offset high leverage",
        "final_risk_class": "high",
        "case_features": {
            "leverage_ratio": 5.1,
            "interest_coverage": 2.8,
            "years_in_business": 35,
            "esg_score": "B",
        },
    },
    {
        "company_name": "GreenTech Solutions Oy",
        "sector": "Technology",
        "country": "Finland",
        "revenue_band": "10M-50M",
        "debt_profile": "low",
        "outcome": "Approved — low risk startup with strong growth",
        "final_risk_class": "low",
        "case_features": {
            "leverage_ratio": 1.2,
            "interest_coverage": 8.1,
            "years_in_business": 5,
            "esg_score": "A",
        },
    },
    {
        "company_name": "Baltic Real Estate Partners",
        "sector": "Real Estate",
        "country": "Latvia",
        "revenue_band": "50M-100M",
        "debt_profile": "high",
        "outcome": "Rejected — insufficient collateral coverage",
        "final_risk_class": "critical",
        "case_features": {
            "leverage_ratio": 7.8,
            "interest_coverage": 1.1,
            "years_in_business": 8,
            "esg_score": "C",
        },
    },
    {
        "company_name": "EnergiNord A/S",
        "sector": "Energy",
        "country": "Denmark",
        "revenue_band": "1B+",
        "debt_profile": "moderate",
        "outcome": "Approved — strong market position and stable revenue",
        "final_risk_class": "low",
        "case_features": {
            "leverage_ratio": 2.0,
            "interest_coverage": 6.3,
            "years_in_business": 45,
            "esg_score": "A-",
        },
    },
]


async def seed() -> None:
    """Run the full seed process (idempotent — safe to run repeatedly)."""
    # For SQLite (tests / legacy), create tables directly.
    # For Postgres, tables are managed by Alembic migrations.
    db_url = str(engine.url)
    if "sqlite" in db_url:
        await init_db()
    else:
        # Verify connectivity — tables should already exist via Alembic
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))

    async with async_session() as session:
        session: AsyncSession

        # Default analyst user (skip if already exists)
        result = await session.execute(select(User).where(User.username == "analyst"))
        existing_user = result.scalar_one_or_none()
        if existing_user:
            default_user_id = existing_user.id
            print("  ✓ Default user already exists (analyst / analyst123)")
        else:
            default_user_id = str(uuid.uuid4())
            default_user = User(
                id=default_user_id,
                username="analyst",
                email="analyst@example.com",
                hashed_password=hash_password("analyst123"),
                full_name="Anna Lindqvist",
                is_active=True,
                theme_preference="light",
            )
            session.add(default_user)
            print("  ✓ Inserted default user (analyst / analyst123)")

        # Regulations (skip if any exist)
        result = await session.execute(select(RegulationSource).limit(1))
        if result.scalar_one_or_none():
            print("  ✓ Regulation sources already seeded")
        else:
            for reg in REGULATIONS:
                session.add(RegulationSource(**reg))
            print(f"  ✓ Inserted {len(REGULATIONS)} regulation sources")

        # Historical cases (skip if any exist)
        result = await session.execute(select(HistoricalCase).limit(1))
        if result.scalar_one_or_none():
            print("  ✓ Historical cases already seeded")
        else:
            for hc in HISTORICAL_CASES:
                session.add(HistoricalCase(**hc))
            print(f"  ✓ Inserted {len(HISTORICAL_CASES)} historical cases")

        # Sample active cases (skip if any exist)
        result = await session.execute(select(Case).limit(1))
        if result.scalar_one_or_none():
            print("  ✓ Sample cases already seeded")
        else:
            case1 = Case(
                id=str(uuid.uuid4()),
                case_number="BTR-2025-0001",
                company_name="Nordvik Energy AB",
                sector="Energy",
                country="Sweden",
                status="new",
                esg_relevant=True,
                owner_id=default_user_id,
            )
            case2 = Case(
                id=str(uuid.uuid4()),
                case_number="BTR-2025-0002",
                company_name="FinTech Solutions Oy",
                sector="Technology",
                country="Finland",
                status="new",
                owner_id=default_user_id,
            )
            case3 = Case(
                id=str(uuid.uuid4()),
                case_number="BTR-2025-0003",
                company_name="Baltic Cement Industries SIA",
                sector="Manufacturing",
                country="Latvia",
                status="new",
                esg_relevant=True,
                owner_id=default_user_id,
            )
            session.add_all([case1, case2, case3])
            print("  ✓ Inserted 3 sample active cases")

        await session.commit()
        print("\n✅ Seed data loaded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
