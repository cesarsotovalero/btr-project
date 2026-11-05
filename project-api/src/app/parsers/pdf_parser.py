"""PDF parser — extracts text, tables, and metadata from PDFs."""

import asyncio
import logging

logger = logging.getLogger(__name__)


async def parse_pdf(file_path: str, filename: str) -> dict:
    """Parse a PDF file and return unified extraction JSON."""
    return await asyncio.to_thread(_parse_pdf_sync, file_path, filename)


def _parse_pdf_sync(file_path: str, filename: str) -> dict:
    """Synchronous PDF parsing logic."""
    from pypdf import PdfReader

    sections = []
    tables = []
    full_text_parts = []
    ocr_used = False
    confidence = 0.85

    try:
        reader = PdfReader(file_path)
        metadata = reader.metadata

        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if text.strip():
                full_text_parts.append(text)
                sections.append(
                    {
                        "page": i + 1,
                        "heading": f"Page {i + 1}",
                        "content": text[:2000],  # Truncate for prototype
                    }
                )
            else:
                # Page has no extractable text — attempt OCR
                ocr_text = _ocr_page(file_path, i)
                if ocr_text:
                    ocr_used = True
                    confidence = min(confidence, 0.65)
                    full_text_parts.append(ocr_text)
                    sections.append(
                        {
                            "page": i + 1,
                            "heading": f"Page {i + 1} (OCR)",
                            "content": ocr_text[:2000],
                        }
                    )

        # Extract basic key-value fields
        entities = _extract_entities("\n".join(full_text_parts))

        title = filename
        if metadata and metadata.title:
            title = metadata.title

        return {
            "title": title,
            "sections": sections,
            "tables": tables,
            "entities": entities,
            "key_metrics": _extract_key_metrics("\n".join(full_text_parts)),
            "source_references": [
                {"type": "pdf", "filename": filename, "pages": len(reader.pages)}
            ],
            "ocr_used": ocr_used,
            "confidence": confidence,
            "full_text": "\n".join(full_text_parts),
            "page_count": len(reader.pages),
        }

    except Exception as e:
        logger.error(f"PDF parsing error for {filename}: {e}")
        return {
            "title": filename,
            "sections": [],
            "tables": [],
            "entities": [],
            "key_metrics": [],
            "source_references": [],
            "ocr_used": False,
            "confidence": 0.0,
            "full_text": f"[Error parsing PDF: {str(e)}]",
            "error": str(e),
        }


def _ocr_page(file_path: str, page_index: int) -> str:
    """Attempt OCR on a single page using pdf2image + pytesseract."""
    try:
        from pdf2image import convert_from_path

        images = convert_from_path(
            file_path,
            first_page=page_index + 1,
            last_page=page_index + 1,
            dpi=200,
        )
        if images:
            import pytesseract

            return pytesseract.image_to_string(images[0])
    except Exception as e:
        logger.warning(f"OCR failed for page {page_index}: {e}")
    return ""


def _extract_entities(text: str) -> list[dict]:
    """Extract basic entities from text using simple heuristics."""
    import re

    entities = []

    # Company name patterns (simplified)
    org_patterns = re.findall(
        r"(?:AB|Ltd|Inc|GmbH|Corp|Plc|S\.A\.|AS|Oy)\b",
        text,
    )
    if org_patterns:
        entities.append(
            {"type": "organization_suffix", "values": list(set(org_patterns))}
        )

    # Currency amounts
    amounts = re.findall(
        r"(?:SEK|EUR|USD|GBP)\s*[\d,]+(?:\.\d+)?(?:\s*(?:million|billion|mn|bn|MSEK|MEUR))?",
        text,
        re.IGNORECASE,
    )
    if amounts:
        entities.append({"type": "monetary_amounts", "values": amounts[:20]})

    # Dates
    dates = re.findall(
        r"\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b",
        text,
    )
    if dates:
        entities.append({"type": "dates", "values": dates[:20]})

    # Percentages
    percents = re.findall(r"\d+(?:\.\d+)?%", text)
    if percents:
        entities.append({"type": "percentages", "values": percents[:20]})

    return entities


def _extract_key_metrics(text: str) -> list[dict]:
    """Extract potential financial key metrics from text."""
    import re

    metrics = []
    _suffix = (
        r"[:\s]*(?:SEK|EUR|USD)?\s*([\d,.]+)"
        r"\s*(?:million|billion|mn|bn|MSEK)?"
    )
    patterns = {
        "revenue": r"(?:revenue|turnover|net\s+sales)" + _suffix,
        "ebitda": r"(?:EBITDA)" + _suffix,
        "net_income": (r"(?:net\s+(?:income|profit|result))" + _suffix),
        "total_assets": r"(?:total\s+assets)" + _suffix,
        "total_debt": (r"(?:total\s+(?:debt|liabilities))" + _suffix),
        "equity": r"(?:(?:total\s+)?equity)" + _suffix,
    }

    for metric_name, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            metrics.append(
                {
                    "name": metric_name,
                    "value": match.group(1),
                    "raw_match": match.group(0),
                }
            )

    return metrics
