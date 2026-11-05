"""LLM provider abstraction layer — switchable between mock and Gemini."""

from app.config import LLMBackend, settings
from app.llm.base import LLMProvider
from app.llm.mock_provider import MockLLMProvider


def get_llm_provider() -> LLMProvider:
    """Factory: return the configured LLM provider instance."""
    if settings.llm_backend == LLMBackend.GEMINI:
        from app.llm.gemini_provider import GeminiLLMProvider

        return GeminiLLMProvider()
    return MockLLMProvider()
