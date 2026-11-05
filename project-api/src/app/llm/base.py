"""Base LLM provider interface."""

from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    async def analyze_document(self, text: str, doc_type: str) -> dict:
        """Analyze a document and extract structured information."""
        ...

    @abstractmethod
    async def extract_entities(self, text: str) -> dict:
        """Extract named entities and key-value pairs from text."""
        ...

    @abstractmethod
    async def assess_compliance(self, case_data: dict, regulations: list[dict]) -> dict:
        """Assess compliance of a case against regulations."""
        ...

    @abstractmethod
    async def assess_risk_process(
        self, case_data: dict, process_steps: list[dict]
    ) -> dict:
        """Assess adherence to internal risk process steps."""
        ...

    @abstractmethod
    async def find_similar_cases(
        self, case_data: dict, historical_cases: list[dict]
    ) -> dict:
        """Find and explain similar historical cases."""
        ...

    @abstractmethod
    async def synthesize_risk(
        self,
        case_data: dict,
        extractions: list[dict],
        compliance: dict,
        process_check: dict,
        similar_cases: list[dict],
    ) -> dict:
        """Synthesize a final risk assessment from all inputs."""
        ...

    @abstractmethod
    async def assess_esg_risk(
        self, case_data: dict, extractions: list[dict], regulations: list[dict]
    ) -> dict:
        """Assess ESG and climate risk for a case.

        Returns climate_risk_rating, environmental/social/governance flags,
        taxonomy_alignment (EU 6 objectives), missing_esg_data, confidence.
        """
        ...

    @abstractmethod
    async def detect_anomalies(
        self, extractions: list[dict], metrics: list[dict]
    ) -> dict:
        """Detect numeric anomalies and cross-statement inconsistencies.

        Returns anomalies list, cross_statement_checks, confidence.
        """
        ...

    @abstractmethod
    async def answer_case_question(
        self,
        question: str,
        case_data: dict,
        documents: list[dict],
        extractions: list[dict],
        findings: list[dict],
        risk_assessment: dict | None,
    ) -> dict:
        """Answer an analyst question about a case using all available context.

        Returns answer text with source citations:
        - answer: str (professional risk-analyst response)
        - sources: list[dict] with document_name, page, excerpt, relevance
        - confidence: float
        """
        ...

    @abstractmethod
    async def explain_finding(
        self,
        finding: dict,
        case_data: dict,
        documents: list[dict],
        extractions: list[dict],
    ) -> dict:
        """Generate a natural-language explanation for a specific finding.

        Explains *why* the agent flagged this finding, citing specific
        documents and pages where appropriate.

        Returns:
        - explanation: str (2-4 sentence human-readable paragraph)
        - document_references: list[dict] with document_name, page, excerpt
        - confidence: float
        """
        ...
