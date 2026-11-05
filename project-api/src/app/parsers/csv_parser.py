"""CSV parser — extracts tabular data from CSV/TSV files."""

from __future__ import annotations

import asyncio
import csv
import io
import logging
import re

logger = logging.getLogger(__name__)

# Reuse entity patterns from the Excel parser
_CURRENCY_RE = re.compile(
    r"(?:SEK|EUR|USD|GBP|NOK|DKK)\s*[\d,]+(?:\.\d+)?"
    r"(?:\s*(?:million|billion|mn|bn|MSEK|MEUR|MUSD))?",
    re.IGNORECASE,
)
_PERCENT_RE = re.compile(r"-?\d+(?:\.\d+)?%")


async def parse_csv(file_path: str, filename: str) -> dict:
    """Parse a CSV file and return unified extraction JSON."""
    return await asyncio.to_thread(_parse_csv_sync, file_path, filename)


def _parse_csv_sync(file_path: str, filename: str) -> dict:
    """Synchronous CSV parsing logic."""
    try:
        with open(file_path, newline="", encoding="utf-8-sig") as f:
            raw = f.read()

        # Auto-detect dialect
        try:
            dialect = csv.Sniffer().sniff(raw[:8192])
        except csv.Error:
            dialect = csv.excel

        reader = csv.reader(io.StringIO(raw), dialect)
        all_rows: list[list[str]] = [row for row in reader if any(row)]

        if not all_rows:
            return _error_result(filename, "CSV file is empty")

        headers = all_rows[0]
        data_rows = all_rows[1:]

        # Build Markdown full_text
        md_lines: list[str] = []
        md_lines.append(f"## {filename}")
        md_lines.append("")
        md_lines.append("| " + " | ".join(h if h else "-" for h in headers) + " |")
        md_lines.append("| " + " | ".join("---" for _ in headers) + " |")
        for row in data_rows:
            padded = row + [""] * (len(headers) - len(row))
            cells = [c if c else "-" for c in padded[: len(headers)]]
            md_lines.append("| " + " | ".join(cells) + " |")
        md_lines.append("")
        full_text = "\n".join(md_lines)

        # Basic entity extraction
        entities: list[dict] = []
        amounts = _CURRENCY_RE.findall(full_text)
        if amounts:
            entities.append({"type": "monetary_amounts", "values": amounts[:30]})
        percents = _PERCENT_RE.findall(full_text)
        if percents:
            entities.append({"type": "percentages", "values": percents[:30]})

        return {
            "title": filename,
            "sections": [
                {
                    "heading": filename,
                    "content": (
                        f"Headers: {', '.join(headers)}. {len(data_rows)} data rows."
                    ),
                }
            ],
            "tables": [
                {
                    "sheet": filename,
                    "headers": headers,
                    "rows": data_rows,
                    "row_count": len(data_rows),
                }
            ],
            "entities": entities,
            "key_metrics": [],
            "source_references": [
                {
                    "type": "csv",
                    "filename": filename,
                    "rows": len(data_rows),
                }
            ],
            "ocr_used": False,
            "confidence": 0.90,
            "full_text": full_text,
        }

    except Exception as e:
        logger.error("CSV parsing error for %s: %s", filename, e)
        return _error_result(filename, str(e))


def _error_result(filename: str, error_msg: str) -> dict:
    """Return the standard error extraction dict."""
    return {
        "title": filename,
        "sections": [],
        "tables": [],
        "entities": [],
        "key_metrics": [],
        "source_references": [],
        "ocr_used": False,
        "confidence": 0.0,
        "full_text": f"[Error parsing CSV: {error_msg}]",
        "error": error_msg,
    }
