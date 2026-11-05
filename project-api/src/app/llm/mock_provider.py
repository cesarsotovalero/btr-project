"""Mock LLM provider — returns realistic canned responses for local dev."""

import random

from app.llm.base import LLMProvider


class MockLLMProvider(LLMProvider):
    """Mock provider that returns plausible fake analysis results."""

    async def analyze_document(self, text: str, doc_type: str) -> dict:
        text_len = len(text)
        return {
            "summary": (
                f"This {doc_type} document contains "
                f"{text_len} characters of content. "
                "It appears to be a corporate "
                "financial document with sections "
                "covering company overview, financial "
                "performance, and governance structure."
            ),
            "document_quality": "good",
            "language": "English",
            "key_topics": [
                "Financial performance",
                "Corporate governance",
                "Risk management",
                "Regulatory compliance",
            ],
            "confidence": 0.82,
        }

    async def extract_entities(self, text: str) -> dict:
        return {
            "organizations": ["NordicTech AB", "SEB", "Finansinspektionen"],
            "financial_figures": [
                {"label": "Revenue", "value": "SEK 850M", "period": "2025"},
                {"label": "EBITDA", "value": "SEK 125M", "period": "2025"},
                {"label": "Net Debt", "value": "SEK 340M", "period": "2025"},
                {"label": "Total Assets", "value": "SEK 1,200M", "period": "2025"},
            ],
            "dates": ["2025-12-31", "2026-03-15"],
            "regulatory_references": [
                "Basel III",
                "CRD IV",
                "EU Anti-Money Laundering Directive",
            ],
            "confidence": 0.78,
        }

    async def assess_compliance(self, case_data: dict, regulations: list[dict]) -> dict:
        checks = []
        statuses = ["compliant", "compliant", "non_compliant", "unknown", "compliant"]
        items = [
            {
                "regulation": "KYC Requirements (AML Directive)",
                "requirement": "Complete customer due diligence documentation",
                "evidence": (
                    "Annual report includes board "
                    "member disclosures and "
                    "ownership structure"
                ),
            },
            {
                "regulation": "Basel III Capital Requirements",
                "requirement": "Adequate capital ratios disclosed",
                "evidence": "Financial statements show capital adequacy ratio of 14.2%",
            },
            {
                "regulation": "IFRS 9 Financial Instruments",
                "requirement": "Expected credit loss provisions documented",
                "evidence": "No ECL provision details found in submitted documents",
            },
            {
                "regulation": "Environmental Risk Assessment (EU Taxonomy)",
                "requirement": "Climate risk disclosure",
                "evidence": (
                    "Sustainability section present but lacks quantified metrics"
                ),
            },
            {
                "regulation": "Internal Credit Policy v3.2",
                "requirement": "Minimum 3 years of audited financials",
                "evidence": "2 years of audited financials provided (2024-2025)",
            },
        ]

        for i, item in enumerate(items):
            checks.append(
                {
                    **item,
                    "status": statuses[i],
                    "severity": "critical"
                    if statuses[i] == "non_compliant"
                    else "info",
                }
            )

        return {
            "overall_status": "partially_compliant",
            "checks": checks,
            "compliant_count": statuses.count("compliant"),
            "non_compliant_count": statuses.count("non_compliant"),
            "unknown_count": statuses.count("unknown"),
            "confidence": 0.75,
        }

    async def assess_risk_process(
        self, case_data: dict, process_steps: list[dict]
    ) -> dict:
        steps = [
            {
                "step": "1. Initial Screening",
                "status": "completed",
                "notes": "Company identified and sector classified",
            },
            {
                "step": "2. Document Collection",
                "status": "completed",
                "notes": "Financial statements and corporate presentations collected",
            },
            {
                "step": "3. Financial Analysis",
                "status": "completed",
                "notes": "Key ratios computed from submitted financials",
            },
            {
                "step": "4. Regulatory Check",
                "status": "partially_completed",
                "notes": "AML check complete; environmental risk assessment pending",
            },
            {
                "step": "5. Management Assessment",
                "status": "not_started",
                "notes": "Management interview not yet conducted",
            },
            {
                "step": "6. Committee Review",
                "status": "not_started",
                "notes": "Pending completion of prior steps",
            },
        ]

        return {
            "process_compliance": "partial",
            "steps": steps,
            "completed": 3,
            "total": 6,
            "blocking_items": [
                "Environmental risk assessment not completed",
                "Management assessment pending",
            ],
            "confidence": 0.80,
        }

    async def find_similar_cases(
        self, case_data: dict, historical_cases: list[dict]
    ) -> dict:
        similar = [
            {
                "company": "NordicBuild AB",
                "sector": case_data.get("sector", "Technology"),
                "outcome": "approved",
                "risk_class": "B+",
                "similarity_score": 0.87,
                "similarity_reason": (
                    "Same sector, similar revenue range, comparable debt profile"
                ),
                "decision_date": "2025-09-15",
            },
            {
                "company": "ScandiFin Holdings",
                "sector": case_data.get("sector", "Technology"),
                "outcome": "approved_with_conditions",
                "risk_class": "B",
                "similarity_score": 0.74,
                "similarity_reason": (
                    "Same country, similar company size, overlapping risk factors"
                ),
                "decision_date": "2025-06-22",
            },
            {
                "company": "Baltic Ventures Ltd",
                "sector": "Financial Services",
                "outcome": "rejected",
                "risk_class": "C",
                "similarity_score": 0.61,
                "similarity_reason": (
                    "Similar debt-to-equity ratio and regulatory concerns"
                ),
                "decision_date": "2024-12-01",
            },
        ]
        return {
            "similar_cases": similar,
            "precedent_strength": "moderate",
            "caution_notes": [
                "One similar case was rejected "
                "due to regulatory concerns — "
                "verify compliance status "
                "carefully."
            ],
            "confidence": 0.72,
        }

    async def synthesize_risk(
        self,
        case_data: dict,
        extractions: list[dict],
        compliance: dict,
        process_check: dict,
        similar_cases: list[dict],
    ) -> dict:
        proposed_class = random.choice(["B+", "B", "B-"])

        return {
            "proposed_risk_class": proposed_class,
            "compliance_status": compliance.get("overall_status", "unknown"),
            "recommendation": (
                "Conditional approval recommended. "
                "Request additional environmental "
                "risk documentation and schedule "
                "management interview before "
                "final decision."
            ),
            "reasoning": (
                f"Based on analysis of {len(extractions)} documents:\n\n"
                "**Strengths:**\n"
                "- Strong revenue growth (12% YoY)\n"
                "- Adequate capital ratios above regulatory minimums\n"
                "- Established market position in Nordic region\n\n"
                "**Concerns:**\n"
                "- Missing environmental risk assessment\n"
                "- Only 2 years of audited financials (policy requires 3)\n"
                "- Debt-to-equity ratio trending upward\n\n"
                "**Missing Information:**\n"
                "- EU Taxonomy alignment data\n"
                "- Updated management projections\n"
                "- Third-party credit rating\n\n"
                f"Proposed risk class: **{proposed_class}** "
                "(moderate risk, standard monitoring)"
            ),
            "confidence": 0.73,
            "risk_factors": [
                {
                    "factor": "Credit Risk",
                    "level": "moderate",
                    "detail": "Debt-to-equity ratio of 1.8x, trending upward",
                },
                {
                    "factor": "Regulatory Risk",
                    "level": "elevated",
                    "detail": "Incomplete compliance documentation",
                },
                {
                    "factor": "Market Risk",
                    "level": "low",
                    "detail": "Stable market position, diversified revenue",
                },
                {
                    "factor": "Operational Risk",
                    "level": "moderate",
                    "detail": "Key person dependency noted in governance review",
                },
            ],
            "missing_items": [
                "Environmental and climate risk assessment",
                "Third year of audited financials (2023)",
                "Management interview documentation",
                "Updated business plan / projections",
            ],
            "next_actions": [
                "Request environmental risk disclosure from company",
                "Schedule management assessment interview",
                "Obtain 2023 audited financial statements",
                "Present to credit committee for conditional approval",
            ],
        }

    async def assess_esg_risk(
        self, case_data: dict, extractions: list[dict], regulations: list[dict]
    ) -> dict:
        sector = case_data.get("sector", "Unknown")
        high_climate_sectors = {
            "Energy",
            "Mining",
            "Transportation",
            "Agriculture",
            "Real Estate",
            "Manufacturing",
        }
        is_high = sector in high_climate_sectors

        return {
            "climate_risk_rating": "high" if is_high else "moderate",
            "environmental_flags": [
                {
                    "flag": "Carbon exposure",
                    "severity": "high" if is_high else "moderate",
                    "detail": (
                        f"{sector} sector has "
                        f"{'significant' if is_high else 'moderate'} "
                        "carbon transition risk under "
                        "EU Taxonomy climate objectives."
                    ),
                },
                {
                    "flag": "Water usage disclosure gap",
                    "severity": "warning",
                    "detail": (
                        "No quantified water consumption "
                        "or management data found "
                        "in submitted documents."
                    ),
                },
            ],
            "social_flags": [
                {
                    "flag": "Supply chain labor standards",
                    "severity": "info",
                    "detail": "No adverse media or reported supply chain labor issues, "
                    "but no formal due diligence report provided.",
                },
            ],
            "governance_flags": [
                {
                    "flag": "Board ESG oversight",
                    "severity": "info",
                    "detail": (
                        "Board composition disclosed "
                        "but no dedicated ESG committee "
                        "or sustainability-linked "
                        "executive compensation "
                        "reported."
                    ),
                },
            ],
            "taxonomy_alignment": {
                "climate_mitigation": "partial",
                "climate_adaptation": "unknown",
                "water_and_marine_resources": "not_assessed",
                "circular_economy": "not_assessed",
                "pollution_prevention": "partial" if is_high else "unknown",
                "biodiversity_and_ecosystems": "not_assessed",
            },
            "missing_esg_data": [
                "Scope 1 and Scope 2 GHG emissions data",
                "Scope 3 value chain emissions estimate",
                "EU Taxonomy KPI disclosures (CapEx/OpEx/Revenue alignment)",
                "Climate transition plan or net-zero commitment details",
                "CSRD-aligned sustainability report",
            ],
            "esg_risk_horizon": "medium",
            "risk_horizon_assessment": (
                "Short-term (0-3y): Regulatory "
                "compliance risk from missing "
                "CSRD disclosures. "
                "Medium-term (3-10y): Transition "
                "risk from carbon pricing and "
                "taxonomy alignment. "
                "Long-term (10y+): Physical "
                "climate risk exposure requires "
                "scenario analysis."
            ),
            "confidence": 0.68,
        }

    async def detect_anomalies(
        self, extractions: list[dict], metrics: list[dict]
    ) -> dict:
        return {
            "anomalies": [
                {
                    "type": "cross_statement_mismatch",
                    "description": (
                        "Revenue figure in income "
                        "statement (SEK 850M) does not "
                        "match revenue referenced in "
                        "management presentation "
                        "(SEK 870M)."
                    ),
                    "severity": "warning",
                    "affected_fields": ["revenue"],
                    "suggested_resolution": "Request clarification from company on "
                    "which figure is from audited financials.",
                },
                {
                    "type": "balance_sheet_discrepancy",
                    "description": (
                        "Total debt in balance sheet "
                        "(SEK 340M) differs from debt "
                        "figure in notes to financial "
                        "statements (SEK 355M, "
                        "including off-balance-sheet "
                        "lease liabilities)."
                    ),
                    "severity": "high",
                    "affected_fields": ["total_debt", "net_debt"],
                    "suggested_resolution": "Verify whether IFRS 16 lease liabilities "
                    "are included; reconcile with auditor notes.",
                },
            ],
            "cross_statement_checks": [
                {
                    "check": "Assets = Liabilities + Equity",
                    "status": "pass",
                    "detail": "Balance sheet equation holds: 1,200M = 860M + 340M.",
                },
                {
                    "check": "Net income consistency",
                    "status": "pass",
                    "detail": "Net income in P&L matches retained earnings movement "
                    "in equity statement.",
                },
            ],
            "confidence": 0.76,
        }

    async def answer_case_question(
        self,
        question: str,
        case_data: dict,
        documents: list[dict],
        extractions: list[dict],
        findings: list[dict],
        risk_assessment: dict | None,
    ) -> dict:
        company = case_data.get("company_name", "the company")
        sector = case_data.get("sector", "Unknown")
        doc_count = len(documents)
        finding_count = len(findings)
        q_lower = question.lower()

        # Build contextual answer based on question keywords
        if any(kw in q_lower for kw in ["risk", "rating", "class", "score"]):
            risk_class = (
                risk_assessment.get("proposed_risk_class", "B")
                if risk_assessment
                else "Not yet assessed"
            )
            answer = (
                f"Based on my analysis of {company}, "
                "the proposed risk classification "
                f"is **{risk_class}**.\n\n"
                f"This assessment considers "
                f"{doc_count} submitted documents "
                f"and {finding_count} findings "
                "from our multi-agent analysis "
                "pipeline. Key risk factors "
                "include:\n\n"
                "1. **Credit Risk** — Moderate: "
                "Debt-to-equity ratio of 1.8x "
                "with upward trend\n"
                "2. **Regulatory Risk** — Elevated:"
                " Incomplete compliance "
                "documentation identified\n"
                "3. **Market Risk** — Low: Stable "
                "market position with diversified "
                "revenue streams\n"
                "4. **Operational Risk** — Moderate:"
                " Key person dependency noted "
                "in governance review\n\n"
                "I recommend reviewing the detailed"
                " risk factors in the Risk "
                "Workspace for a comprehensive "
                "breakdown."
            )
        elif any(kw in q_lower for kw in ["compliance", "regulation", "regulatory"]):
            answer = (
                f"The compliance assessment for "
                f"{company} shows a **partially "
                "compliant** status.\n\n"
                "Key compliance findings:\n\n"
                "- **KYC Requirements "
                "(AML Directive)** — Compliant: "
                "Board member disclosures and "
                "ownership structure documented\n"
                "- **Basel III Capital "
                "Requirements** — Compliant: "
                "Capital adequacy ratio "
                "of 14.2%\n"
                "- **IFRS 9 Financial "
                "Instruments** — Non-compliant: "
                "No expected credit loss provision "
                "details found\n"
                "- **EU Taxonomy Environmental "
                "Risk** — Unknown: Sustainability "
                "section present but lacks "
                "quantified metrics\n"
                "- **Internal Credit Policy "
                "v3.2** — Compliant (partial): "
                "Only 2 of required 3 years of "
                "audited financials provided\n\n"
                "The IFRS 9 non-compliance is "
                "flagged as **critical** severity "
                "and should be addressed before "
                "proceeding."
            )
        elif any(
            kw in q_lower
            for kw in ["esg", "climate", "environmental", "sustainability"]
        ):
            answer = (
                "The ESG risk assessment for "
                f"{company} in the {sector} sector "
                "indicates:\n\n"
                "**Climate Risk Rating**: "
                "Moderate\n\n"
                "**Environmental Flags**:\n"
                "- Carbon exposure risk (moderate "
                "severity) — sector has moderate "
                "carbon transition risk under "
                "EU Taxonomy\n"
                "- Water usage disclosure gap "
                "(warning) — no quantified water "
                "management data found\n\n"
                "**Missing ESG Data**:\n"
                "- Scope 1 and 2 GHG emissions\n"
                "- EU Taxonomy KPI disclosures "
                "(CapEx/OpEx/Revenue alignment)\n"
                "- CSRD-aligned sustainability "
                "report\n"
                "- Climate transition plan or "
                "net-zero commitment\n\n"
                "I recommend requesting additional "
                "ESG disclosures from the company "
                "to complete the assessment."
            )
        elif any(
            kw in q_lower for kw in ["document", "financial", "report", "statement"]
        ):
            doc_names = [d.get("filename", "Unknown") for d in documents[:5]]
            answer = (
                f"There are **{doc_count} documents** submitted for {company}:\n\n"
                + "".join(f"- {name}\n" for name in doc_names)
                + "\n"
                "Key financial figures extracted:\n\n"
                "| Metric | Value | Period |\n"
                "|--------|-------|--------|\n"
                "| Revenue | SEK 850M | 2025 |\n"
                "| EBITDA | SEK 125M | 2025 |\n"
                "| Net Debt | SEK 340M | 2025 |\n"
                "| Total Assets | SEK 1,200M | 2025 |\n\n"
                "Note: A cross-statement "
                "discrepancy was detected — "
                "revenue in the income statement "
                "(SEK 850M) does not match the "
                "management presentation "
                "(SEK 870M). "
                "I recommend requesting "
                "clarification from the company."
            )
        elif any(kw in q_lower for kw in ["finding", "issue", "concern", "problem"]):
            answer = (
                "The analysis pipeline identified "
                f"**{finding_count} findings** "
                f"for {company}. "
                "Here is a summary by severity:\n\n"
                "- **Critical**: IFRS 9 expected "
                "credit loss provisions "
                "not documented\n"
                "- **High**: Balance sheet debt "
                "discrepancy (SEK 340M vs "
                "SEK 355M in notes)\n"
                "- **Warning**: Revenue "
                "inconsistency across documents "
                "(SEK 850M vs SEK 870M)\n"
                "- **Warning**: Environmental risk "
                "assessment incomplete\n"
                "- **Info**: Only 2 of 3 required "
                "years of audited financials "
                "submitted\n\n"
                "Critical and high-severity "
                "findings should be addressed "
                "before checkpoint approval. "
                "The full finding details with "
                "evidence references are available "
                "in the Compliance Dashboard."
            )
        elif any(
            kw in q_lower for kw in ["recommend", "action", "next step", "what should"]
        ):
            answer = (
                "Based on my comprehensive "
                f"analysis of {company}, "
                "I recommend the following "
                "actions:\n\n"
                "1. **Request environmental risk "
                "disclosure** \u2014 EU Taxonomy "
                "alignment data is missing "
                "(priority: high)\n"
                "2. **Obtain 2023 audited "
                "financial statements** \u2014 "
                "Internal policy requires "
                "3 years; only 2 provided\n"
                "3. **Clarify revenue "
                "discrepancy** \u2014 SEK 850M vs "
                "SEK 870M across documents "
                "needs resolution\n"
                "4. **Verify debt figures** \u2014 "
                "Reconcile balance sheet debt "
                "(SEK 340M) with notes "
                "(SEK 355M, incl. "
                "IFRS 16 leases)\n"
                "5. **Schedule management "
                "assessment interview** \u2014 "
                "Required process step "
                "not yet completed\n\n"
                "Once these items are addressed, "
                "the case can be presented to "
                "the credit committee for "
                "conditional approval. "
                "The proposed risk class of "
                "**B** suggests standard "
                "monitoring terms would apply."
            )
        else:
            rc = (
                risk_assessment.get("proposed_risk_class", "Pending")
                if risk_assessment
                else "Pending"
            )
            cs = (
                risk_assessment.get("compliance_status", "Pending")
                if risk_assessment
                else "Pending"
            )
            answer = (
                "Here is a summary of the current "
                "assessment for "
                f"**{company}** "
                f"({sector} sector):\n\n"
                f"- **Documents analysed**: {doc_count}\n"
                f"- **Findings identified**: {finding_count}\n"
                f"- **Risk classification**: {rc}\n"
                f"- **Compliance status**: {cs}\n"
                "- **ESG risk**: Moderate "
                "(climate transition risk)\n\n"
                "The multi-agent pipeline has "
                "completed its analysis. Key "
                "areas requiring attention "
                "include missing environmental "
                "risk data, incomplete audited "
                "financials, and a detected "
                "revenue inconsistency across "
                "submitted documents.\n\n"
                "Feel free to ask me about "
                "specific areas such as risk "
                "factors, compliance status, "
                "ESG assessment, document "
                "details, findings, or "
                "recommended next actions."
            )

        # Build mock sources from available documents
        sources = []
        for i, doc in enumerate(documents[:3]):
            sources.append(
                {
                    "document_name": doc.get("filename", f"Document {i + 1}"),
                    "document_id": doc.get("id", ""),
                    "page": (i + 1) * 3,
                    "excerpt": (
                        "Relevant content from "
                        f"{doc.get('filename', 'document')}"
                        " pertaining to the analyst's "
                        f"question about {company}."
                    ),
                    "relevance": round(0.92 - i * 0.12, 2),
                }
            )

        return {
            "answer": answer,
            "sources": sources,
            "confidence": 0.85,
        }

    async def explain_finding(
        self,
        finding: dict,
        case_data: dict,
        documents: list[dict],
        extractions: list[dict],
    ) -> dict:
        company = case_data.get("company_name", "the company")
        title = finding.get("title", "this issue")
        finding_type = finding.get("finding_type", "general")
        severity = finding.get("severity", "info")
        description = finding.get("description", "")
        agent = finding.get("created_by_agent", "the analysis pipeline")

        # Build type-specific explanations
        explanations = {
            "risk_factor": (
                f"The **{agent.replace('_', ' ')}** identified "
                f'*"{title}"* as a risk factor for {company} '
                f"during the credit-risk assessment. "
                f"{description} "
                f"This factor was flagged at **{severity}** severity "
                f"because it may materially affect the borrower's "
                f"ability to service debt obligations. "
                f"The assessment was derived from financial data "
                f"extracted from the submitted documents, including "
                f"balance sheet figures and income statement trends."
            ),
            "missing_information": (
                f"The **{agent.replace('_', ' ')}** flagged that "
                f"required information is missing from the case "
                f"submission for {company}. Specifically: "
                f'*"{description}"*. '
                f"SEB's internal credit policy and regulatory "
                f"requirements (including Basel III and CRD IV) "
                f"mandate that this information be provided for "
                f"a complete risk assessment. The absence of this "
                f"data limits the pipeline's ability to produce "
                f"a fully confident risk classification."
            ),
            "critical_issue": (
                f"A **critical issue** was detected by the "
                f"**{agent.replace('_', ' ')}** for {company}: "
                f'*"{description}"*. '
                f"This is classified as critical severity because "
                f"it represents a fundamental gap in the submitted "
                f"documentation that prevents a reliable risk "
                f"assessment. Regulatory frameworks require this "
                f"to be resolved before proceeding with credit "
                f"approval."
            ),
            "reconciliation": (
                f"The **reconciliation agent** detected a data "
                f"inconsistency across the documents submitted "
                f'for {company}: *"{description}"*. '
                f"Cross-statement validation compares figures "
                f"reported in different documents (e.g., income "
                f"statement vs. management presentation) to "
                f"ensure consistency. This discrepancy was flagged "
                f"at **{severity}** severity and should be "
                f"clarified with the borrower before finalising "
                f"the risk assessment."
            ),
            "esg": (
                f"The **ESG agent** identified an environmental, "
                f"social, or governance concern for {company}: "
                f'*"{description}"*. '
                f"This flag was raised during the EU Taxonomy "
                f"alignment and climate-risk screening. Under "
                f"current SEB sustainability policies and the "
                f"EU Taxonomy Regulation, this factor must be "
                f"considered in the overall credit decision. "
                f"The severity level of **{severity}** reflects "
                f"the potential impact on the borrower's "
                f"long-term risk profile."
            ),
        }

        explanation = explanations.get(
            finding_type,
            (
                f"The **{agent.replace('_', ' ')}** identified "
                f'*"{title}"* during the analysis of {company}. '
                f"{description} "
                f"This finding was flagged at **{severity}** severity "
                f"based on the agent's assessment of the submitted "
                f"documents and applicable regulatory requirements."
            ),
        )

        # Build mock document references from available documents
        doc_refs = []
        for i, doc in enumerate(documents[:2]):
            doc_refs.append(
                {
                    "document_name": doc.get("filename", f"Document {i + 1}"),
                    "page": (i + 1) * 2 + 1,
                    "excerpt": (
                        f"Section containing data relevant to "
                        f'"{title}" — extracted from '
                        f"{doc.get('filename', 'the submitted document')}."
                    ),
                }
            )

        return {
            "explanation": explanation,
            "document_references": doc_refs,
            "confidence": 0.82,
        }
