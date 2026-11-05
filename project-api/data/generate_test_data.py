#!/usr/bin/env python3
"""
Generate fake test documents for the BTR SEB Risk Assessment platform.

Produces PDF and Excel files for each seed case:
  1. Nordvik Energy AB   (Energy / Sweden / ESG-relevant)
  2. FinTech Solutions Oy (Technology / Finland)
  3. Baltic Cement Industries SIA (Manufacturing / Latvia / ESG-relevant)

Each case gets:
  - Annual Report (PDF) - financial summary, governance, ESG sections
  - Financial Statements (Excel) - balance sheet, income statement, ratios
  - Loan Application (PDF) - purpose, collateral, management info
  - ESG Disclosure (Excel) - emissions, taxonomy alignment, social metrics

Deliberate inconsistencies are planted so the reconciliation agent detects them:
  - Revenue in the annual report != revenue in the financial statements (case 1)
  - Debt figure in Excel != debt in annual report (case 3)
"""

from __future__ import annotations

from pathlib import Path

from fpdf import FPDF
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill

OUTPUT_DIR = Path(__file__).parent / "test_documents"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


class ReportPDF(FPDF):
    """Simple PDF helper with header/footer."""

    company: str = ""
    doc_title: str = ""

    def header(self):
        self.set_font("Helvetica", "B", 10)
        self.cell(0, 6, f"{self.company}  -  {self.doc_title}", align="L")
        self.ln(4)
        self.set_draw_color(0, 71, 171)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(6)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 7)
        self.cell(0, 8, f"Page {self.page_no()}/{{nb}}  |  Confidential", align="C")

    def section(self, heading: str, body: str):
        self.set_font("Helvetica", "B", 12)
        self.cell(0, 8, heading, new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 9)
        self.multi_cell(0, 5, body)
        self.ln(4)

    def kv_table(self, rows: list[tuple[str, str]]):
        self.set_font("Helvetica", "", 9)
        col_w = [60, 120]
        for label, value in rows:
            self.set_font("Helvetica", "B", 9)
            self.cell(col_w[0], 6, label)
            self.set_font("Helvetica", "", 9)
            self.cell(col_w[1], 6, str(value), new_x="LMARGIN", new_y="NEXT")
        self.ln(3)


def styled_workbook() -> Workbook:
    wb = Workbook()
    return wb


def header_fill() -> PatternFill:
    return PatternFill(start_color="004AB7", end_color="004AB7", fill_type="solid")


def header_font() -> Font:
    return Font(bold=True, color="FFFFFF", size=11)


def write_header_row(ws, row: int, values: list[str]):
    for col, val in enumerate(values, 1):
        cell = ws.cell(row=row, column=col, value=val)
        cell.font = header_font()
        cell.fill = header_fill()
        cell.alignment = Alignment(horizontal="center")


def write_data_rows(ws, start_row: int, rows: list[list]):
    for r, data in enumerate(rows, start_row):
        for c, val in enumerate(data, 1):
            cell = ws.cell(row=r, column=c, value=val)
            if isinstance(val, (int, float)):
                cell.number_format = "#,##0"


def auto_width(ws):
    for col in ws.columns:
        max_len = 0
        col_letter = col[0].column_letter
        for cell in col:
            try:
                max_len = max(max_len, len(str(cell.value or "")))
            except Exception:
                pass
        ws.column_dimensions[col_letter].width = min(max_len + 4, 40)


# =====================================================================
# CASE 1 - Nordvik Energy AB
# =====================================================================


def nordvik_annual_report():
    pdf = ReportPDF()
    pdf.company = "Nordvik Energy AB"
    pdf.doc_title = "Annual Report 2025"
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.section(
        "1. Company Overview",
        "Nordvik Energy AB (org. nr 556789-1234) is a Swedish mid-cap energy company "
        "headquartered in Gothenburg. Founded in 1978, the company operates across the "
        "Nordic region with activities spanning upstream exploration, renewable power "
        "generation, and district heating distribution. As of 31 December 2025, Nordvik "
        "employs 1,240 full-time equivalents across Sweden, Norway, and Finland.",
    )
    pdf.section(
        "2. Financial Highlights",
        "Revenue: SEK 4,850 million (2024: SEK 4,520 million)\n"
        "EBITDA: SEK 980 million (2024: SEK 910 million)\n"
        "Net income: SEK 420 million (2024: SEK 380 million)\n"
        "Total assets: SEK 8,200 million\n"
        "Total equity: SEK 3,100 million\n"
        "Total debt: SEK 2,600 million\n"
        "Total liabilities: SEK 5,100 million\n"
        "Return on equity: 13.5%\n"
        "Net debt / EBITDA: 2.7x\n\n"
        "Revenue grew 7.3% year-over-year driven by higher electricity spot prices "
        "and the commissioning of the Vastervik wind farm (120 MW).",
    )
    pdf.section(
        "3. Risk Management",
        "Nordvik applies the three lines of defence model. The Chief Risk Officer "
        "reports directly to the Board Risk Committee. Key risk categories include "
        "commodity price risk, regulatory and compliance risk, operational risk, and "
        "credit risk on counterparty exposures. The company maintains a Value-at-Risk "
        "limit of SEK 50 million at 95% confidence for its trading book.",
    )
    pdf.section(
        "4. Sustainability and ESG",
        "Nordvik has set a net-zero target for Scope 1 and Scope 2 emissions by 2040. "
        "In 2025 total GHG emissions were 185,000 tCO2e (Scope 1: 120,000, Scope 2: "
        "65,000). Scope 3 emissions are estimated at 1.2 million tCO2e but are not "
        "yet independently verified.\n\n"
        "The company's transition plan includes:\n"
        "- Phase-out of fossil-fuel district heating by 2032\n"
        "- 500 MW of new renewable capacity by 2030\n"
        "- Green bond framework aligned to EU Taxonomy objectives for climate mitigation\n\n"
        "EU Taxonomy alignment of capex: 35% eligible, 22% aligned.\n"
        "Water stress: two facilities in southern Sweden are located in moderate water "
        "stress zones per WRI Aqueduct mapping. No biodiversity impact assessments "
        "have been completed for new wind installations.\n\n"
        "Social: The company reports a gender pay gap of 6.2% and has implemented "
        "supply chain due diligence per the Norwegian Transparency Act. No human rights "
        "violations were identified in 2025. Board diversity: 40% female directors.",
    )
    pdf.section(
        "5. Corporate Governance",
        "The Board of Directors comprises 10 members, including 3 employee representatives. "
        "The Audit Committee held 8 meetings during the year. The Nomination Committee "
        "follows the Swedish Corporate Governance Code. Related-party transactions are "
        "disclosed in Note 34 of the consolidated financial statements.",
    )
    pdf.section(
        "6. Outlook 2026",
        "Management expects revenue in the range of SEK 5,000-5,300 million for 2026, "
        "supported by new wind capacity and stable district heating demand. Capex is "
        "planned at SEK 1,200 million, of which 60% is taxonomy-aligned renewable "
        "investment. The company will publish its first CSRD-compliant sustainability "
        "report in Q1 2027.",
    )

    path = OUTPUT_DIR / "nordvik_energy" / "Nordvik_Energy_Annual_Report_2025.pdf"
    path.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(path))
    print(f"  Created: {path}")


def nordvik_financial_statements():
    wb = styled_workbook()

    # --- Balance Sheet ---
    ws = wb.active
    ws.title = "Balance Sheet"
    write_header_row(ws, 1, ["Item", "2025 (MSEK)", "2024 (MSEK)"])
    data = [
        ["Total Assets", 8200, 7800],
        ["Current Assets", 2100, 1950],
        ["Non-current Assets", 6100, 5850],
        ["Total Liabilities", 5100, 4900],
        ["Current Liabilities", 1400, 1300],
        ["Non-current Liabilities", 3700, 3600],
        ["Total Equity", 3100, 2900],
        ["Total Debt", 2600, 2500],
        ["Cash and Equivalents", 450, 380],
    ]
    write_data_rows(ws, 2, data)
    auto_width(ws)

    # --- Income Statement ---
    ws2 = wb.create_sheet("Income Statement")
    write_header_row(ws2, 1, ["Item", "2025 (MSEK)", "2024 (MSEK)"])
    income_data = [
        # NOTE: Revenue is 4,870 here vs 4,850 in the annual report PDF
        # This is a DELIBERATE inconsistency for reconciliation testing
        ["Revenue", 4870, 4520],
        ["Cost of Goods Sold", -3200, -2980],
        ["Gross Profit", 1670, 1540],
        ["Operating Expenses", -690, -630],
        ["EBITDA", 980, 910],
        ["Depreciation & Amortisation", -320, -300],
        ["Operating Income", 660, 610],
        ["Financial Income", 15, 12],
        ["Financial Expenses", -145, -140],
        ["Profit Before Tax", 530, 482],
        ["Income Tax", -110, -102],
        ["Net Income", 420, 380],
    ]
    write_data_rows(ws2, 2, income_data)
    auto_width(ws2)

    # --- Key Ratios ---
    ws3 = wb.create_sheet("Key Ratios")
    write_header_row(ws3, 1, ["Ratio", "2025", "2024"])
    ratio_data = [
        ["Return on Equity (%)", 13.5, 13.1],
        ["Net Debt / EBITDA", 2.2, 2.3],
        ["Interest Coverage", 4.6, 4.4],
        ["Current Ratio", 1.5, 1.5],
        ["Debt-to-Equity", 0.84, 0.86],
        ["EBITDA Margin (%)", 20.1, 20.1],
        ["Equity Ratio (%)", 37.8, 37.2],
        ["Leverage Ratio", 2.65, 2.69],
    ]
    write_data_rows(ws3, 2, ratio_data)
    auto_width(ws3)

    path = (
        OUTPUT_DIR / "nordvik_energy" / "Nordvik_Energy_Financial_Statements_2025.xlsx"
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(str(path))
    print(f"  Created: {path}")


def nordvik_loan_application():
    pdf = ReportPDF()
    pdf.company = "Nordvik Energy AB"
    pdf.doc_title = "Loan Application - Project Vastervik II"
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.section("1. Loan Request Summary", "")
    pdf.kv_table(
        [
            ("Borrower", "Nordvik Energy AB (556789-1234)"),
            ("Loan Amount Requested", "SEK 800 million"),
            (
                "Purpose",
                "Construction of 200 MW onshore wind farm (Vastervik Phase II)",
            ),
            ("Tenor", "7 years, bullet repayment"),
            ("Pricing Indication", "STIBOR 3M + 175 bps"),
            (
                "Collateral",
                "First-priority pledge on project assets and assignment of PPA revenues",
            ),
        ]
    )

    pdf.section(
        "2. Project Description",
        "Vastervik Phase II is a 200 MW onshore wind project located in Kalmar County, "
        "Sweden. The project has all environmental permits in place (decision dated "
        "2024-06-15) and a 15-year fixed-price Power Purchase Agreement with a Nordic "
        "utility rated A- by S&P.\n\n"
        "Expected annual generation: 580 GWh (P50 estimate, validated by DNV).\n"
        "Construction period: 18 months, starting Q2 2026.\n"
        "EPC contractor: Vestas Wind Systems A/S (turnkey contract at SEK 650 million).",
    )
    pdf.section(
        "3. Financial Projections",
        "Projected annual revenue: SEK 290-320 million (based on PPA price of SEK 500/MWh).\n"
        "DSCR during operations: 1.35x - 1.55x (base case).\n"
        "Project IRR: 9.2% (unlevered).\n"
        "Break-even electricity price: SEK 340/MWh.\n\n"
        "The project is expected to be EU Taxonomy-aligned for climate change mitigation "
        "(climate mitigation) as a renewable energy activity under NACE code D.35.1.1.",
    )
    pdf.section(
        "4. Management & Sponsors",
        "CEO: Lars Eriksson (15 years in Nordic energy sector).\n"
        "CFO: Maria Andersson (former VP Finance at Vattenfall).\n"
        "Board Chair: Gustav Svensson (former CEO of Swedish Energy Agency).\n\n"
        "Shareholders: Nordvik Holdings (60%), Nordic Infrastructure Fund II (25%), "
        "Management & Board (15%).",
    )
    pdf.section(
        "5. Key Risks",
        "- Construction risk: mitigated by turnkey EPC, 10% contingency budget\n"
        "- Wind resource risk: P90 generation covers debt service at 1.1x\n"
        "- Regulatory risk: Swedish energy policy stable, permits secured\n"
        "- Counterparty risk: PPA buyer rated A-\n"
        "- ESG / climate physical risk: low; site not in flood or wildfire zone",
    )

    path = OUTPUT_DIR / "nordvik_energy" / "Nordvik_Energy_Loan_Application_2025.pdf"
    path.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(path))
    print(f"  Created: {path}")


def nordvik_esg_disclosure():
    wb = styled_workbook()

    # --- Emissions ---
    ws = wb.active
    ws.title = "GHG Emissions"
    write_header_row(ws, 1, ["Metric", "2025", "2024", "2023", "Unit"])
    data = [
        ["Scope 1 Emissions", 120000, 135000, 150000, "tCO2e"],
        ["Scope 2 Emissions (market-based)", 65000, 72000, 80000, "tCO2e"],
        ["Scope 2 Emissions (location-based)", 78000, 85000, 92000, "tCO2e"],
        ["Scope 3 Emissions (estimated)", 1200000, 1250000, 1300000, "tCO2e"],
        ["Total GHG (Scope 1+2 market)", 185000, 207000, 230000, "tCO2e"],
        ["Carbon Intensity", 38.1, 45.8, 50.9, "tCO2e/MSEK revenue"],
        ["Renewable Share of Generation", 42, 35, 28, "%"],
    ]
    write_data_rows(ws, 2, data)
    auto_width(ws)

    # --- EU Taxonomy ---
    ws2 = wb.create_sheet("EU Taxonomy")
    write_header_row(ws2, 1, ["Objective", "Eligible %", "Aligned %", "Notes"])
    tax_data = [
        ["Climate Change Mitigation", 55, 22, "Wind farms, district heating upgrades"],
        ["Climate Change Adaptation", 10, 5, "Grid resilience investments"],
        ["Water and Marine Resources", 3, 0, "Assessment pending"],
        ["Circular Economy", 2, 1, "Recycling of turbine blades"],
        ["Pollution Prevention", 8, 4, "Emission filtration systems"],
        ["Biodiversity and Ecosystems", 0, 0, "No assessment completed"],
    ]
    write_data_rows(ws2, 2, tax_data)
    auto_width(ws2)

    # --- Social ---
    ws3 = wb.create_sheet("Social Metrics")
    write_header_row(ws3, 1, ["Metric", "2025", "2024"])
    social_data = [
        ["Total Employees (FTE)", 1240, 1185],
        ["Gender Pay Gap (%)", 6.2, 7.1],
        ["Female Board Members (%)", 40, 30],
        ["Lost Time Injury Rate (LTIR)", 1.8, 2.1],
        ["Training Hours per Employee", 42, 38],
        ["Supply Chain Audits Completed", 28, 22],
        ["Human Rights Incidents", 0, 0],
        ["Community Investment (MSEK)", 12, 10],
    ]
    write_data_rows(ws3, 2, social_data)
    auto_width(ws3)

    # --- Governance ---
    ws4 = wb.create_sheet("Governance")
    write_header_row(ws4, 1, ["Metric", "Value"])
    gov_data = [
        ["Board Size", 10],
        ["Independent Directors", 6],
        ["Board Meetings per Year", 12],
        ["Audit Committee Meetings", 8],
        ["Risk Committee Meetings", 6],
        ["ESG/Sustainability Committee", "Yes"],
        ["Whistleblower Reports", 3],
        ["Anti-corruption Training (%)", 95],
        ["Executive ESG-linked Compensation", "Yes (20% of bonus)"],
    ]
    write_data_rows(ws4, 2, gov_data)
    auto_width(ws4)

    path = OUTPUT_DIR / "nordvik_energy" / "Nordvik_Energy_ESG_Disclosure_2025.xlsx"
    path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(str(path))
    print(f"  Created: {path}")


# =====================================================================
# CASE 2 - FinTech Solutions Oy
# =====================================================================


def fintech_annual_report():
    pdf = ReportPDF()
    pdf.company = "FinTech Solutions Oy"
    pdf.doc_title = "Annual Report 2025"
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.section(
        "1. Company Overview",
        "FinTech Solutions Oy (FI-2456781-9) is a Finnish technology company "
        "specialising in digital payment infrastructure for the European banking "
        "sector. Headquartered in Helsinki and founded in 2015, the company employs "
        "320 people across Finland, Estonia, and Germany.",
    )
    pdf.section(
        "2. Financial Highlights",
        "Revenue: EUR 85 million (2024: EUR 62 million)\n"
        "EBITDA: EUR 22 million (2024: EUR 14 million)\n"
        "Net income: EUR 12 million (2024: EUR 5.5 million)\n"
        "Total assets: EUR 145 million\n"
        "Total equity: EUR 95 million\n"
        "Total debt: EUR 20 million\n"
        "Total liabilities: EUR 50 million\n"
        "Cash: EUR 38 million\n\n"
        "Revenue grew 37% driven by expansion of our real-time payment API to 12 new "
        "bank partners and the launch of the Open Banking Gateway product in Q2 2025.",
    )
    pdf.section(
        "3. Products & Services",
        "1. Real-Time Payment API - processes EUR 2.1 billion annually\n"
        "2. Open Banking Gateway - PSD2 compliant aggregation platform\n"
        "3. KYC/AML-as-a-Service - automated identity verification\n"
        "4. Treasury Dashboard - real-time liquidity management for corporate clients\n\n"
        "The company holds a Payment Institution licence from the Finnish Financial "
        "Supervisory Authority (FIN-FSA) and is registered under PSD2.",
    )
    pdf.section(
        "4. Risk Management",
        "Key risks: operational (system availability SLA 99.95%), cybersecurity (SOC 2 "
        "Type II certified), regulatory (PSD2/PSD3 transition), and counterparty credit "
        "risk (limited, as funds remain in client trust accounts).\n\n"
        "The company complies with DORA requirements for ICT risk management "
        "and has completed resilience testing with two designated critical service "
        "providers.",
    )
    pdf.section(
        "5. Sustainability",
        "As a technology firm, FinTech Solutions has a limited environmental footprint. "
        "Cloud infrastructure is hosted on AWS (eu-north-1) which runs on 100% renewable "
        "energy. Total Scope 1+2 emissions: 45 tCO2e (office operations only).\n\n"
        "Social: 44% of engineering team is female. Flexible remote-first policy. "
        "No supply chain human rights concerns identified.\n"
        "Governance: Board has 7 members, 3 independent. No ESG committee (considered "
        "immaterial given sector and size).",
    )

    path = OUTPUT_DIR / "fintech_solutions" / "FinTech_Solutions_Annual_Report_2025.pdf"
    path.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(path))
    print(f"  Created: {path}")


def fintech_financial_statements():
    wb = styled_workbook()

    ws = wb.active
    ws.title = "Balance Sheet"
    write_header_row(ws, 1, ["Item", "2025 (MEUR)", "2024 (MEUR)"])
    data = [
        ["Total Assets", 145, 110],
        ["Current Assets", 62, 48],
        ["Non-current Assets", 83, 62],
        ["Total Liabilities", 50, 42],
        ["Current Liabilities", 30, 25],
        ["Non-current Liabilities", 20, 17],
        ["Total Equity", 95, 68],
        ["Total Debt", 20, 22],
        ["Cash and Equivalents", 38, 28],
    ]
    write_data_rows(ws, 2, data)
    auto_width(ws)

    ws2 = wb.create_sheet("Income Statement")
    write_header_row(ws2, 1, ["Item", "2025 (MEUR)", "2024 (MEUR)"])
    income_data = [
        ["Revenue", 85, 62],
        ["Cost of Revenue", -42, -32],
        ["Gross Profit", 43, 30],
        ["R&D Expenses", -12, -10],
        ["Sales & Marketing", -6, -4],
        ["General & Administrative", -3, -2],
        ["EBITDA", 22, 14],
        ["Depreciation & Amortisation", -5, -4],
        ["Operating Income", 17, 10],
        ["Financial Income", 1.2, 0.8],
        ["Financial Expenses", -1.5, -1.8],
        ["Profit Before Tax", 16.7, 9.0],
        ["Income Tax", -4.7, -3.5],
        ["Net Income", 12, 5.5],
    ]
    write_data_rows(ws2, 2, income_data)
    auto_width(ws2)

    ws3 = wb.create_sheet("Key Ratios")
    write_header_row(ws3, 1, ["Ratio", "2025", "2024"])
    ratio_data = [
        ["Revenue Growth (%)", 37.1, 28.5],
        ["Gross Margin (%)", 50.6, 48.4],
        ["EBITDA Margin (%)", 25.9, 22.6],
        ["Net Margin (%)", 14.1, 8.9],
        ["Return on Equity (%)", 12.6, 8.1],
        ["Debt-to-Equity", 0.21, 0.32],
        ["Current Ratio", 2.07, 1.92],
        ["Cash / Total Assets (%)", 26.2, 25.5],
    ]
    write_data_rows(ws3, 2, ratio_data)
    auto_width(ws3)

    path = (
        OUTPUT_DIR
        / "fintech_solutions"
        / "FinTech_Solutions_Financial_Statements_2025.xlsx"
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(str(path))
    print(f"  Created: {path}")


def fintech_loan_application():
    pdf = ReportPDF()
    pdf.company = "FinTech Solutions Oy"
    pdf.doc_title = "Credit Facility Application"
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.section("1. Facility Request", "")
    pdf.kv_table(
        [
            ("Borrower", "FinTech Solutions Oy (FI-2456781-9)"),
            ("Facility Type", "Revolving Credit Facility"),
            ("Amount Requested", "EUR 15 million"),
            ("Purpose", "Working capital and potential acquisition financing"),
            ("Tenor", "3 years with 2x 1-year extension options"),
            ("Pricing", "EURIBOR 3M + 120 bps"),
            ("Collateral", "Unsecured; negative pledge on key assets"),
        ]
    )

    pdf.section(
        "2. Business Rationale",
        "FinTech Solutions is experiencing rapid growth (37% YoY revenue) and requires "
        "a flexible credit facility to support working capital needs during periods of "
        "customer onboarding (typical 60-90 day payment terms from bank clients).\n\n"
        "The facility may also be drawn to finance bolt-on acquisitions in the regulatory "
        "technology (RegTech) space, targeting companies with EUR 3-8 million revenue.",
    )
    pdf.section(
        "3. Repayment Capacity",
        "Strong cash generation: EUR 22 million EBITDA with minimal capex requirements "
        "(EUR 4 million p.a., primarily capitalised software development).\n"
        "Free cash flow: EUR 16 million (2025).\n"
        "Cash reserves: EUR 38 million (well above requested facility size).\n"
        "Debt-to-equity: 0.21x (significantly below sector average of 0.8x).",
    )
    pdf.section(
        "4. Management",
        "CEO: Jukka Virtanen (co-founder, former Nordea Digital Banking lead).\n"
        "CTO: Anna Korhonen (co-founder, ex-Google, 8 patents in payment tech).\n"
        "CFO: Mikko Laakso (former CFO at Basware Oyj, 20 years in SaaS finance).\n\n"
        "Investors: Nordic Capital (Series B lead), Supercell founder angel fund.",
    )

    path = (
        OUTPUT_DIR
        / "fintech_solutions"
        / "FinTech_Solutions_Credit_Application_2025.pdf"
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(path))
    print(f"  Created: {path}")


# =====================================================================
# CASE 3 - Baltic Cement Industries SIA
# =====================================================================


def baltic_annual_report():
    pdf = ReportPDF()
    pdf.company = "Baltic Cement Industries SIA"
    pdf.doc_title = "Annual Report 2025"
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.section(
        "1. Company Overview",
        "Baltic Cement Industries SIA (LV-40203456789) is a Latvian cement and "
        "building materials manufacturer with operations in Latvia, Lithuania, and "
        "Estonia. Founded in 1992, the company operates three production plants with "
        "a total clinker capacity of 2.8 million tonnes per year. Employees: 890.",
    )
    pdf.section(
        "2. Financial Highlights",
        "Revenue: EUR 310 million (2024: EUR 295 million)\n"
        "EBITDA: EUR 62 million (2024: EUR 58 million)\n"
        "Net income: EUR 18 million (2024: EUR 15 million)\n"
        "Total assets: EUR 520 million\n"
        "Total equity: EUR 180 million\n"
        "Total debt: EUR 240 million\n"
        "Total liabilities: EUR 340 million\n\n"
        "Revenue growth of 5.1% was driven by infrastructure investment across the "
        "Baltic states under the EU Recovery and Resilience Facility.",
    )
    pdf.section(
        "3. Risk Management",
        "Key risks include commodity price risk (energy and raw materials account for "
        "60% of production costs), currency risk (EUR/USD for imported coal), regulatory "
        "risk (EU ETS carbon permit costs), and environmental liability risk.\n\n"
        "The company participates in the EU Emissions Trading System (ETS) and currently "
        "holds carbon permits covering 85% of annual emissions. The shortfall is purchased "
        "on the spot market. Carbon allowance cost in 2025: EUR 78/tCO2.",
    )
    pdf.section(
        "4. Sustainability and ESG",
        "Cement manufacturing is a carbon-intensive industry. Baltic Cement's total "
        "Scope 1 emissions were 1,850,000 tCO2e in 2025 (primarily from clinker "
        "calcination and fuel combustion). Scope 2 emissions: 95,000 tCO2e.\n\n"
        "Carbon intensity: 0.68 tCO2 per tonne of cement (industry average: 0.60).\n"
        "The company's carbon intensity exceeds the EU Taxonomy technical screening "
        "criteria for cement (0.498 tCO2/t for climate mitigation alignment).\n\n"
        "Transition plan: Invest EUR 120 million over 5 years in:\n"
        "- Alternative fuels (waste-derived fuels to replace 40% of coal by 2028)\n"
        "- Clinker substitution (targeting 30% slag/fly ash blend by 2029)\n"
        "- Carbon capture pilot (feasibility study commissioned, report due Q4 2026)\n\n"
        "Water usage: 1.2 million cubic metres annually. One plant (Riga) is located "
        "in a high water stress area per WRI Aqueduct. No circular economy programme.\n\n"
        "Social: 12 lost-time injuries recorded in 2025 (LTIR: 13.5). One significant "
        "dust emission exceedance event at the Klaipeda plant triggered a regulatory "
        "fine of EUR 85,000. Supply chain consists primarily of local quarries; no "
        "human rights assessment of raw material suppliers has been performed.",
    )
    pdf.section(
        "5. Governance",
        "Board of Directors: 6 members, 1 independent. The majority shareholder "
        "(CemCo Holdings, 72%) appoints 4 of 6 directors. No dedicated ESG or "
        "sustainability committee. Executive compensation is not linked to ESG targets.\n\n"
        "The company was subject to a regulatory inspection by the Latvian Competition "
        "Authority in Q3 2025 regarding allegedly coordinated pricing in the Latvian "
        "market. The investigation is ongoing.",
    )

    path = OUTPUT_DIR / "baltic_cement" / "Baltic_Cement_Annual_Report_2025.pdf"
    path.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(path))
    print(f"  Created: {path}")


def baltic_financial_statements():
    wb = styled_workbook()

    ws = wb.active
    ws.title = "Balance Sheet"
    write_header_row(ws, 1, ["Item", "2025 (MEUR)", "2024 (MEUR)"])
    data = [
        ["Total Assets", 520, 505],
        ["Current Assets", 110, 100],
        ["Non-current Assets", 410, 405],
        ["Total Liabilities", 340, 330],
        ["Current Liabilities", 95, 88],
        ["Non-current Liabilities", 245, 242],
        ["Total Equity", 180, 175],
        # NOTE: Debt is 255 here vs 240 in the Annual Report PDF
        # DELIBERATE inconsistency - includes off-balance-sheet lease liabilities
        ["Total Debt", 255, 248],
        ["Cash and Equivalents", 22, 18],
    ]
    write_data_rows(ws, 2, data)
    auto_width(ws)

    ws2 = wb.create_sheet("Income Statement")
    write_header_row(ws2, 1, ["Item", "2025 (MEUR)", "2024 (MEUR)"])
    income_data = [
        ["Revenue", 310, 295],
        ["Cost of Goods Sold", -218, -210],
        ["Gross Profit", 92, 85],
        ["Operating Expenses", -30, -27],
        ["EBITDA", 62, 58],
        ["Depreciation & Amortisation", -28, -26],
        ["Operating Income", 34, 32],
        ["Financial Income", 0.5, 0.3],
        ["Financial Expenses", -12, -13],
        ["Profit Before Tax", 22.5, 19.3],
        ["Income Tax", -4.5, -4.3],
        ["Net Income", 18, 15],
    ]
    write_data_rows(ws2, 2, income_data)
    auto_width(ws2)

    ws3 = wb.create_sheet("Key Ratios")
    write_header_row(ws3, 1, ["Ratio", "2025", "2024"])
    ratio_data = [
        ["Return on Equity (%)", 10.0, 8.6],
        ["Net Debt / EBITDA", 3.76, 3.97],
        ["Interest Coverage", 2.83, 2.46],
        ["Current Ratio", 1.16, 1.14],
        ["Debt-to-Equity", 1.42, 1.42],
        ["EBITDA Margin (%)", 20.0, 19.7],
        ["Equity Ratio (%)", 34.6, 34.7],
    ]
    write_data_rows(ws3, 2, ratio_data)
    auto_width(ws3)

    path = OUTPUT_DIR / "baltic_cement" / "Baltic_Cement_Financial_Statements_2025.xlsx"
    path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(str(path))
    print(f"  Created: {path}")


def baltic_loan_application():
    pdf = ReportPDF()
    pdf.company = "Baltic Cement Industries SIA"
    pdf.doc_title = "Term Loan Application"
    pdf.alias_nb_pages()
    pdf.add_page()

    pdf.section("1. Loan Request", "")
    pdf.kv_table(
        [
            ("Borrower", "Baltic Cement Industries SIA (LV-40203456789)"),
            ("Loan Amount", "EUR 45 million"),
            (
                "Purpose",
                "Refinancing of existing bank debt and capex for alternative fuel conversion",
            ),
            ("Tenor", "5 years, semi-annual amortisation"),
            ("Pricing", "EURIBOR 6M + 280 bps"),
            (
                "Collateral",
                "First-priority mortgage on Riga plant, pledge on inventory",
            ),
            ("Financial Covenants", "Net Debt/EBITDA < 4.5x, Interest Coverage > 2.0x"),
        ]
    )

    pdf.section(
        "2. Use of Proceeds",
        "EUR 30 million: refinancing of existing bilateral loan maturing Q3 2026.\n"
        "EUR 15 million: investment in alternative fuel handling infrastructure at the "
        "Riga plant, enabling replacement of 40% coal consumption with refuse-derived "
        "fuel (RDF) by 2028.\n\n"
        "This capex is expected to reduce annual carbon emissions by approximately "
        "180,000 tCO2e and lower fuel costs by EUR 8-10 million per year.",
    )
    pdf.section(
        "3. Key Risks",
        "- EU ETS: carbon price above EUR 100/t would significantly impact margins\n"
        "- CBAM: Cross-Border Adjustment Mechanism could affect export competitiveness\n"
        "- Environmental: ongoing regulatory inspection for dust emissions\n"
        "- Governance: concentrated ownership structure, limited board independence\n"
        "- Market: Baltic construction market cyclicality\n"
        "- Transition risk: cement industry faces long-term structural pressure from "
        "  carbon pricing and taxonomy non-alignment",
    )

    path = OUTPUT_DIR / "baltic_cement" / "Baltic_Cement_Loan_Application_2025.pdf"
    path.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(path))
    print(f"  Created: {path}")


def baltic_esg_disclosure():
    wb = styled_workbook()

    ws = wb.active
    ws.title = "GHG Emissions"
    write_header_row(ws, 1, ["Metric", "2025", "2024", "2023", "Unit"])
    data = [
        ["Scope 1 Emissions", 1850000, 1900000, 1950000, "tCO2e"],
        ["Scope 2 Emissions (market-based)", 95000, 98000, 102000, "tCO2e"],
        ["Scope 2 Emissions (location-based)", 105000, 110000, 115000, "tCO2e"],
        ["Scope 3 Emissions", "Not reported", "Not reported", "Not reported", "tCO2e"],
        ["Total GHG (Scope 1+2 market)", 1945000, 1998000, 2052000, "tCO2e"],
        ["Carbon Intensity (per tonne cement)", 0.68, 0.70, 0.72, "tCO2/t"],
        ["EU Taxonomy Benchmark (cement)", 0.498, 0.498, 0.498, "tCO2/t"],
        ["EU ETS Allowances Held (%)", 85, 88, 90, "%"],
        ["Carbon Permit Cost (avg)", 78, 72, 65, "EUR/tCO2"],
        ["Alternative Fuel Share (%)", 12, 8, 5, "%"],
    ]
    write_data_rows(ws, 2, data)
    auto_width(ws)

    ws2 = wb.create_sheet("EU Taxonomy")
    write_header_row(ws2, 1, ["Objective", "Eligible %", "Aligned %", "Notes"])
    tax_data = [
        [
            "Climate Change Mitigation",
            25,
            0,
            "Carbon intensity exceeds 0.498 tCO2/t benchmark",
        ],
        ["Climate Change Adaptation", 5, 2, "Flood defence at Riga plant"],
        [
            "Water and Marine Resources",
            8,
            0,
            "High water stress area - assessment pending",
        ],
        ["Circular Economy", 3, 1, "Slag and fly ash blending in cement mix"],
        [
            "Pollution Prevention",
            12,
            4,
            "Dust emission controls (under regulatory review)",
        ],
        [
            "Biodiversity and Ecosystems",
            2,
            0,
            "Quarry rehabilitation programme early stage",
        ],
    ]
    write_data_rows(ws2, 2, tax_data)
    auto_width(ws2)

    ws3 = wb.create_sheet("Social Metrics")
    write_header_row(ws3, 1, ["Metric", "2025", "2024"])
    social_data = [
        ["Total Employees", 890, 870],
        ["Lost Time Injury Rate (LTIR)", 13.5, 15.2],
        ["Fatalities", 0, 0],
        ["Female Employees (%)", 18, 17],
        ["Female Managers (%)", 12, 10],
        ["Gender Pay Gap (%)", 14.5, 16.0],
        ["Training Hours per Employee", 18, 15],
        ["Supply Chain Human Rights Assessment", "Not performed", "Not performed"],
        ["Regulatory Fines (EUR)", 85000, 0],
    ]
    write_data_rows(ws3, 2, social_data)
    auto_width(ws3)

    ws4 = wb.create_sheet("Governance")
    write_header_row(ws4, 1, ["Metric", "Value"])
    gov_data = [
        ["Board Size", 6],
        ["Independent Directors", 1],
        ["Majority Shareholder Appointed", "4 of 6"],
        ["Board Meetings per Year", 6],
        ["Audit Committee", "Yes (2 members)"],
        ["ESG/Sustainability Committee", "No"],
        ["Executive ESG-linked Compensation", "No"],
        ["Whistleblower Channel", "Yes"],
        ["Whistleblower Reports", 1],
        ["Ongoing Regulatory Investigations", 1],
        ["Anti-corruption Training (%)", 65],
    ]
    write_data_rows(ws4, 2, gov_data)
    auto_width(ws4)

    path = OUTPUT_DIR / "baltic_cement" / "Baltic_Cement_ESG_Disclosure_2025.xlsx"
    path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(str(path))
    print(f"  Created: {path}")


# =====================================================================
# Main
# =====================================================================


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("\n=== Generating Nordvik Energy AB test documents ===")
    nordvik_annual_report()
    nordvik_financial_statements()
    nordvik_loan_application()
    nordvik_esg_disclosure()

    print("\n=== Generating FinTech Solutions Oy test documents ===")
    fintech_annual_report()
    fintech_financial_statements()
    fintech_loan_application()

    print("\n=== Generating Baltic Cement Industries SIA test documents ===")
    baltic_annual_report()
    baltic_financial_statements()
    baltic_loan_application()
    baltic_esg_disclosure()

    # Summary
    total = sum(1 for _ in OUTPUT_DIR.rglob("*") if _.is_file())
    print(f"\n{'=' * 60}")
    print(f"Generated {total} test files in {OUTPUT_DIR}/")
    print(f"{'=' * 60}")
    print("\nFiles per case:")
    for d in sorted(OUTPUT_DIR.iterdir()):
        if d.is_dir():
            files = list(d.iterdir())
            print(f"  {d.name}/")
            for f in sorted(files):
                size_kb = f.stat().st_size / 1024
                print(f"    {f.name}  ({size_kb:.1f} KB)")

    print("\nDeliberate inconsistencies planted for reconciliation testing:")
    print(
        "  1. Nordvik Energy: Revenue in Annual Report (SEK 4,850M) != "
        "Excel Income Statement (SEK 4,870M)"
    )
    print(
        "  2. Baltic Cement: Total Debt in Annual Report (EUR 240M) != "
        "Excel Balance Sheet (EUR 255M)"
    )
    print("\nTo test: upload these files to the corresponding cases in the BTR UI,")
    print("then trigger analysis to exercise all 8 agents + checkpoints.")


if __name__ == "__main__":
    main()
