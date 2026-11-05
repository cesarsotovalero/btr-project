"""Gemini LLM provider — calls Vertex AI Gemini via the google-genai SDK."""

from __future__ import annotations

import json
import logging

from google import genai
from google.genai import types

from app.config import settings
from app.llm.base import LLMProvider

logger = logging.getLogger(__name__)

_MODEL = "gemini-2.5-flash"


class GeminiLLMProvider(LLMProvider):
    """Provider that uses Google Gemini on Vertex AI (google-genai SDK)."""

    def __init__(self) -> None:
        self.client = genai.Client(
            vertexai=True,
            project=settings.vertex_ai_project,
            location=settings.vertex_ai_location,
        )

    async def _invoke(self, prompt: str) -> str:
        """Invoke the model and return the text response."""
        response = await self.client.aio.models.generate_content(
            model=_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                max_output_tokens=4096,
            ),
        )
        return response.text

    async def _invoke_json(self, prompt: str) -> dict:
        """Invoke the model expecting a JSON response."""
        response = await self.client.aio.models.generate_content(
            model=_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                max_output_tokens=4096,
                response_mime_type="application/json",
            ),
        )
        text = response.text.strip()
        return json.loads(text)

    async def analyze_document(self, text: str, doc_type: str) -> dict:
        prompt = f"""Analyze the following {doc_type} document
content for an SEB credit-risk assessment.

Provide:
- summary: a concise summary (2-3 sentences)
- document_quality: good/fair/poor
- language: detected language
- key_topics: list of main topics covered
- confidence: your confidence in the analysis (0.0-1.0)

Document text (first 8000 chars):
{text[:8000]}"""
        try:
            return await self._invoke_json(prompt)
        except Exception as e:
            logger.error(f"Gemini analyze_document error: {e}")
            return {
                "summary": "Analysis failed",
                "document_quality": "unknown",
                "language": "unknown",
                "key_topics": [],
                "confidence": 0.0,
                "error": str(e),
            }

    async def extract_entities(self, text: str) -> dict:
        prompt = f"""Extract structured entities from the
following document text for SEB credit-risk assessment.

Return JSON with:
- organizations: list of organization names
- financial_figures: list of objects with label, value, period
- dates: list of important dates
- regulatory_references: list of mentioned regulations/standards
- confidence: your confidence (0.0-1.0)

Text (first 8000 chars):
{text[:8000]}"""
        try:
            return await self._invoke_json(prompt)
        except Exception as e:
            logger.error(f"Gemini extract_entities error: {e}")
            return {
                "organizations": [],
                "financial_figures": [],
                "dates": [],
                "regulatory_references": [],
                "confidence": 0.0,
                "error": str(e),
            }

    async def assess_compliance(self, case_data: dict, regulations: list[dict]) -> dict:
        reg_text = "\n".join(
            f"- {r.get('source_name', 'Unknown')}: {r.get('content_text', '')[:500]}"
            for r in regulations
        )
        prompt = f"""Assess compliance of the following case
against regulations for an SEB risk review.

Case data:
{json.dumps(case_data, indent=2, default=str)[:4000]}

Applicable regulations:
{reg_text[:4000]}

Return JSON with:
- overall_status: compliant / partially_compliant / non_compliant
- checks: list of objects with regulation, requirement,
  status (compliant/non_compliant/unknown), evidence, severity
- compliant_count: number
- non_compliant_count: number
- unknown_count: number
- confidence: 0.0-1.0"""
        try:
            return await self._invoke_json(prompt)
        except Exception as e:
            logger.error(f"Gemini assess_compliance error: {e}")
            return {
                "overall_status": "unknown",
                "checks": [],
                "confidence": 0.0,
                "error": str(e),
            }

    async def assess_risk_process(
        self, case_data: dict, process_steps: list[dict]
    ) -> dict:
        prompt = f"""Assess whether the following case follows
SEB's internal risk assessment process.

Case data:
{json.dumps(case_data, indent=2, default=str)[:4000]}

Expected process steps:
1. Initial Screening
2. Document Collection
3. Financial Analysis
4. Regulatory Check
5. Management Assessment
6. Committee Review

Return JSON with:
- process_compliance: complete / partial / non_compliant
- steps: list of objects with step,
  status (completed/partially_completed/not_started), notes
- completed: count of completed steps
- total: total steps
- blocking_items: list of blocking issues
- confidence: 0.0-1.0"""
        try:
            return await self._invoke_json(prompt)
        except Exception as e:
            logger.error(f"Gemini assess_risk_process error: {e}")
            return {
                "process_compliance": "unknown",
                "steps": [],
                "completed": 0,
                "total": 6,
                "blocking_items": [],
                "confidence": 0.0,
                "error": str(e),
            }

    async def find_similar_cases(
        self, case_data: dict, historical_cases: list[dict]
    ) -> dict:
        hist_text = json.dumps(historical_cases[:10], indent=2, default=str)
        prompt = f"""Given the following case and historical
cases, identify the most similar ones.

Current case:
{json.dumps(case_data, indent=2, default=str)[:3000]}

Historical cases:
{hist_text[:4000]}

Return JSON with:
- similar_cases: list of objects with company, sector,
  outcome, risk_class, similarity_score (0-1),
  similarity_reason
- precedent_strength: strong / moderate / weak
- caution_notes: list of warnings
- confidence: 0.0-1.0"""
        try:
            return await self._invoke_json(prompt)
        except Exception as e:
            logger.error(f"Gemini find_similar_cases error: {e}")
            return {
                "similar_cases": [],
                "precedent_strength": "unknown",
                "caution_notes": [],
                "confidence": 0.0,
                "error": str(e),
            }

    async def synthesize_risk(
        self,
        case_data: dict,
        extractions: list[dict],
        compliance: dict,
        process_check: dict,
        similar_cases: list[dict],
    ) -> dict:
        prompt = f"""You are a senior SEB risk analyst.
Synthesize the following analysis into a risk
recommendation.

Case: {json.dumps(case_data, indent=2, default=str)[:2000]}

Document extractions ({len(extractions)} documents analyzed):
{json.dumps(extractions[:3], indent=2, default=str)[:3000]}

Compliance assessment:
{json.dumps(compliance, indent=2, default=str)[:2000]}

Process assessment:
{json.dumps(process_check, indent=2, default=str)[:2000]}

Similar cases:
{json.dumps(similar_cases, indent=2, default=str)[:2000]}

Return JSON with:
- proposed_risk_class: A / B+ / B / B- / C+ / C / D (standard risk classes)
- compliance_status: compliant / partially_compliant / non_compliant
- recommendation: concise recommendation text
- reasoning: detailed reasoning with strengths, concerns, missing info
- confidence: 0.0-1.0
- risk_factors: list of objects with factor, level (low/moderate/elevated/high), detail
- missing_items: list of missing information
- next_actions: list of recommended next steps"""
        try:
            return await self._invoke_json(prompt)
        except Exception as e:
            logger.error(f"Gemini synthesize_risk error: {e}")
            return {
                "proposed_risk_class": "Unknown",
                "compliance_status": "unknown",
                "recommendation": f"Analysis failed: {str(e)}",
                "reasoning": "",
                "confidence": 0.0,
                "risk_factors": [],
                "missing_items": [],
                "next_actions": ["Retry analysis"],
                "error": str(e),
            }

    async def assess_esg_risk(
        self, case_data: dict, extractions: list[dict], regulations: list[dict]
    ) -> dict:
        reg_text = "\n".join(
            f"- {r.get('source_name', '')}: {r.get('content_text', '')[:300]}"
            for r in regulations
        )
        ext_text = json.dumps(extractions[:5], indent=2, default=str)[:4000]
        prompt = f"""You are a senior ESG risk analyst at SEB.
Assess the ESG and climate risk for the following case
under EU regulatory requirements.

Case: {json.dumps(case_data, indent=2, default=str)[:2000]}

Document extractions:
{ext_text}

Applicable ESG regulations:
{reg_text[:3000]}

Assess against the EU Taxonomy's six environmental objectives:
1. Climate change mitigation
2. Climate change adaptation
3. Sustainable use and protection of water and marine resources
4. Transition to a circular economy
5. Pollution prevention and control
6. Protection and restoration of biodiversity and ecosystems

Return JSON with:
- climate_risk_rating: low / moderate / high / critical
- environmental_flags: list of objects with flag,
  severity (info/warning/high/critical), detail
- social_flags: list of objects with flag, severity, detail
- governance_flags: list of objects with flag, severity, detail
- taxonomy_alignment: object with keys climate_mitigation, climate_adaptation,
  water_and_marine_resources, circular_economy, pollution_prevention,
  biodiversity_and_ecosystems — each valued as aligned /
  partial / not_aligned / not_assessed / unknown
- missing_esg_data: list of specific missing data items
- esg_risk_horizon: short / medium / long
- risk_horizon_assessment: text describing short/medium/long term risk outlook
- confidence: 0.0-1.0"""
        try:
            return await self._invoke_json(prompt)
        except Exception as e:
            logger.error(f"Gemini assess_esg_risk error: {e}")
            return {
                "climate_risk_rating": "unknown",
                "environmental_flags": [],
                "social_flags": [],
                "governance_flags": [],
                "taxonomy_alignment": {},
                "missing_esg_data": [],
                "esg_risk_horizon": "unknown",
                "confidence": 0.0,
                "error": str(e),
            }

    async def detect_anomalies(
        self, extractions: list[dict], metrics: list[dict]
    ) -> dict:
        ext_text = json.dumps(extractions[:5], indent=2, default=str)[:4000]
        met_text = json.dumps(metrics[:20], indent=2, default=str)[:2000]
        prompt = f"""You are a financial data quality analyst.
Review the following extracted financial data from
multiple documents and identify any numeric anomalies,
inconsistencies, or reconciliation failures.

Document extractions:
{ext_text}

Extracted metrics:
{met_text}

Perform these checks:
1. Balance sheet equation: Total Assets =
   Total Liabilities + Equity (within 1% tolerance)
2. Revenue/income consistency across documents
3. Cross-period ratio sanity (sudden jumps > 50% without explanation)
4. Duplicate or contradictory figures across documents
5. Missing expected line items for the document type

Return JSON with:
- anomalies: list of objects with type, description,
  severity (info/warning/high/critical),
  affected_fields (list), suggested_resolution
- cross_statement_checks: list of objects with check,
  status (pass/fail/inconclusive), detail
- confidence: 0.0-1.0"""
        try:
            return await self._invoke_json(prompt)
        except Exception as e:
            logger.error(f"Gemini detect_anomalies error: {e}")
            return {
                "anomalies": [],
                "cross_statement_checks": [],
                "confidence": 0.0,
                "error": str(e),
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
        docs_text = json.dumps(documents[:10], indent=2, default=str)[:3000]
        ext_text = json.dumps(extractions[:5], indent=2, default=str)[:4000]
        findings_text = json.dumps(findings[:10], indent=2, default=str)[:3000]
        risk_text = (
            json.dumps(risk_assessment, indent=2, default=str)[:2000]
            if risk_assessment
            else "No risk assessment available yet."
        )

        prompt = f"""You are a senior risk analyst at SEB
(Skandinaviska Enskilda Banken).
An analyst is reviewing a credit-risk case and has asked you a question.
Answer professionally, precisely, and thoroughly. Always cite specific documents
and page numbers when referencing data. Use markdown formatting for clarity.

Case information:
{json.dumps(case_data, indent=2, default=str)[:2000]}

Submitted documents:
{docs_text}

Document extractions:
{ext_text}

Analysis findings:
{findings_text}

Risk assessment:
{risk_text}

Analyst question: {question}

Return JSON with:
- answer: string (detailed professional answer in
  markdown, citing specific documents and pages)
- sources: list of objects with document_name,
  document_id, page (number), excerpt (relevant
  text), relevance (0.0-1.0)
- confidence: 0.0-1.0 (your confidence in the answer accuracy)"""
        try:
            return await self._invoke_json(prompt)
        except Exception as e:
            logger.error(f"Gemini answer_case_question error: {e}")
            return {
                "answer": (
                    "I apologise, but I was unable to "
                    "process your question at this "
                    f"time. Error: {str(e)}"
                ),
                "sources": [],
                "confidence": 0.0,
                "error": str(e),
            }

    async def explain_finding(
        self,
        finding: dict,
        case_data: dict,
        documents: list[dict],
        extractions: list[dict],
    ) -> dict:
        finding_text = json.dumps(finding, indent=2, default=str)[:2000]
        case_text = json.dumps(case_data, indent=2, default=str)[:1500]
        docs_text = json.dumps(documents[:10], indent=2, default=str)[:2000]
        ext_text = json.dumps(extractions[:5], indent=2, default=str)[:3000]

        prompt = f"""You are a senior risk analyst at SEB
(Skandinaviska Enskilda Banken).
Explain the following finding from a credit-risk assessment in clear,
professional language. The explanation should help a human analyst understand
**why** the agent flagged this issue and what evidence supports it.
Cite specific documents and page numbers where applicable.

Finding:
{finding_text}

Case information:
{case_text}

Submitted documents:
{docs_text}

Document extractions:
{ext_text}

Return JSON with:
- explanation: string (2-4 sentence natural-language explanation
  of why this was flagged, using markdown for emphasis)
- document_references: list of objects with document_name,
  page (number), excerpt (relevant text snippet)
- confidence: 0.0-1.0"""
        try:
            return await self._invoke_json(prompt)
        except Exception as e:
            logger.error(f"Gemini explain_finding error: {e}")
            return {
                "explanation": (f"Unable to generate explanation. Error: {str(e)}"),
                "document_references": [],
                "confidence": 0.0,
                "error": str(e),
            }
