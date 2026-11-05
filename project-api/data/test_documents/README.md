# Test Documents for BTR SEB Risk Assessment

Generated fake data sources to test the full 8-agent analysis pipeline.
Run `python data/generate_test_data.py` from `project-api/` to regenerate.

---

## Case 1 — Nordvik Energy AB

| Field            | Value  |
| ---------------- | ------ |
| **Country**      | Sweden |
| **Sector**       | Energy |
| **ESG Relevant** | Yes    |

### Documents

| File                                            | Type  | Description                                                                                                                                                                                 |
| ----------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Nordvik_Energy_Annual_Report_2025.pdf`         | PDF   | Financial highlights (Revenue SEK 4,850M, EBITDA SEK 980M), risk management, ESG/sustainability section (net-zero target, Scope 1+2 emissions, EU Taxonomy alignment), corporate governance |
| `Nordvik_Energy_Financial_Statements_2025.xlsx` | Excel | Balance sheet, income statement, key ratios — 3 sheets                                                                                                                                      |
| `Nordvik_Energy_Loan_Application_2025.pdf`      | PDF   | SEK 800M term loan for 200 MW onshore wind farm (Västervik Phase II), project description, financial projections, collateral                                                                |
| `Nordvik_Energy_ESG_Disclosure_2025.xlsx`       | Excel | GHG emissions (Scope 1/2/3 over 3 years), EU Taxonomy alignment by objective, social metrics, governance indicators — 4 sheets                                                              |

### Key financial figures

- Revenue: SEK 4,850M
- EBITDA: SEK 980M
- Net Income: SEK 420M
- Total Assets: SEK 8,200M
- Total Equity: SEK 3,100M
- Total Debt: SEK 2,600M
- Net Debt / EBITDA: 2.7x

### ESG highlights

- Scope 1 emissions: 120,000 tCO2e
- Scope 2 emissions: 65,000 tCO2e
- Net-zero target: 2040
- EU Taxonomy capex aligned: 22%
- Green bond framework in place
- CSRD report planned for Q1 2027

---

## Case 2 — FinTech Solutions Oy

| Field            | Value      |
| ---------------- | ---------- |
| **Country**      | Finland    |
| **Sector**       | Technology |
| **ESG Relevant** | No         |

### Documents

| File                                               | Type  | Description                                                                                                       |
| -------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------- |
| `FinTech_Solutions_Annual_Report_2025.pdf`         | PDF   | Company overview, products (payment API, Open Banking Gateway), risk management (DORA, PSD2), limited ESG section |
| `FinTech_Solutions_Financial_Statements_2025.xlsx` | Excel | Balance sheet, income statement, key ratios — 3 sheets                                                            |
| `FinTech_Solutions_Credit_Application_2025.pdf`    | PDF   | EUR 15M revolving credit facility for working capital and potential acquisitions                                  |

### Key financial figures

- Revenue: EUR 85M (37% YoY growth)
- EBITDA: EUR 22M
- Net Income: EUR 12M
- Total Assets: EUR 145M
- Total Equity: EUR 95M
- Total Debt: EUR 20M
- Debt-to-Equity: 0.21x
- Cash: EUR 38M

### ESG highlights

- Minimal environmental footprint (45 tCO2e Scope 1+2)
- Cloud hosted on 100% renewable energy (AWS eu-north-1)
- No dedicated ESG committee

---

## Case 3 — Baltic Cement Industries SIA

| Field            | Value                  |
| ---------------- | ---------------------- |
| **Country**      | Latvia                 |
| **Sector**       | Manufacturing (Cement) |
| **ESG Relevant** | Yes                    |

### Documents

| File                                           | Type  | Description                                                                                                                      |
| ---------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| `Baltic_Cement_Annual_Report_2025.pdf`         | PDF   | Financials, high carbon intensity (0.68 tCO2/t vs 0.498 benchmark), ongoing competition authority investigation, weak governance |
| `Baltic_Cement_Financial_Statements_2025.xlsx` | Excel | Balance sheet, income statement, key ratios — 3 sheets                                                                           |
| `Baltic_Cement_Loan_Application_2025.pdf`      | PDF   | EUR 45M term loan for debt refinancing + alternative fuel conversion capex                                                       |
| `Baltic_Cement_ESG_Disclosure_2025.xlsx`       | Excel | GHG emissions (1.85M tCO2e Scope 1), EU Taxonomy non-alignment, social metrics, governance gaps — 4 sheets                       |

### Key financial figures

- Revenue: EUR 310M
- EBITDA: EUR 62M
- Net Income: EUR 18M
- Total Assets: EUR 520M
- Total Equity: EUR 180M
- Total Debt: EUR 240M (per annual report)
- Net Debt / EBITDA: 3.76x

### ESG highlights

- Scope 1 emissions: 1,850,000 tCO2e
- Carbon intensity: 0.68 tCO2/t (exceeds EU Taxonomy benchmark of 0.498)
- EU Taxonomy climate mitigation aligned: 0%
- EU ETS allowance shortfall: 15%
- Regulatory fine: EUR 85,000 (dust emissions)
- Ongoing competition authority investigation
- No ESG committee, no ESG-linked executive compensation
- 1 independent director out of 6

---

## Deliberate Inconsistencies

These mismatches are planted so the **reconciliation agent** detects cross-document discrepancies:

| Case           | Metric     | Annual Report (PDF) | Financial Statements (Excel) | Delta    |
| -------------- | ---------- | ------------------- | ---------------------------- | -------- |
| Nordvik Energy | Revenue    | SEK 4,850M          | SEK 4,870M                   | +SEK 20M |
| Baltic Cement  | Total Debt | EUR 240M            | EUR 255M                     | +EUR 15M |

---

## What These Documents Exercise

| Agent              | What gets triggered                                                                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Intake**         | File type detection, metadata extraction                                                                                                                          |
| **Extraction**     | Regex-based financial metric parsing (Revenue, EBITDA, Net Income, Total Assets, Equity, Debt), entity extraction (company names, currencies, dates, percentages) |
| **Reconciliation** | Cross-document revenue mismatch (Nordvik), debt mismatch (Baltic), balance sheet equation check, leverage ratio flagging                                          |
| **Regulation**     | EU Taxonomy, EU ETS, CSRD, PSD2, DORA, Swedish Corporate Governance Code references                                                                               |
| **Risk Process**   | Varying risk profiles from low (FinTech) to high (Baltic Cement)                                                                                                  |
| **ESG**            | Keywords: emissions, carbon, taxonomy, Scope 1/2/3, net-zero, transition plan, water stress, biodiversity, CSRD, green bond, circular economy                     |
| **Historical**     | Comparison with precedent cases                                                                                                                                   |
| **Decision**       | Final risk rating recommendation with evidence from all upstream agents                                                                                           |

---

## How to Use

1. Start the BTR application (`docker-compose up` or run API + UI locally)
2. Navigate to the case list in the UI
3. Open a case (e.g., _Nordvik Energy AB_)
4. Upload the corresponding documents from the matching subfolder
5. Trigger analysis to run the full 8-agent pipeline
6. Approve/reject at each human-in-the-loop checkpoint
7. Review the final decision, ESG assessment, and audit trace
