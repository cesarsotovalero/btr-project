"""Excel parser — robust extraction from .xlsx and .xls workbooks.

Four-phase pipeline:
  1. Structural analysis  — detect merged cells, header rows, table regions
  2. Table detection       — classify sheets, locate data tables
  3. Cell normalisation    — dates, currencies, percentages, formulae
  4. Output assembly       — Markdown full_text, entities, key_metrics
"""

from __future__ import annotations

import asyncio
import logging
import re
from datetime import datetime
from typing import Any

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Financial label matching
# ---------------------------------------------------------------------------

FINANCIAL_LABELS: dict[str, list[str]] = {
    "revenue": ["revenue", "turnover", "net sales", "total revenue", "sales"],
    "ebitda": ["ebitda"],
    "net_income": [
        "net income",
        "net profit",
        "net result",
        "profit after tax",
        "profit for the period",
    ],
    "gross_profit": ["gross profit", "gross margin"],
    "operating_income": ["operating income", "operating profit", "ebit"],
    "total_assets": ["total assets"],
    "total_liabilities": ["total liabilities"],
    "total_debt": ["total debt", "total borrowings"],
    "equity": [
        "total equity",
        "equity",
        "shareholders equity",
        "shareholders' equity",
    ],
    "cash": [
        "cash and equivalents",
        "cash and cash equivalents",
        "cash",
    ],
    "depreciation": ["depreciation", "depreciation & amortisation"],
    "capex": [
        "capital expenditure",
        "capex",
        "investments in fixed assets",
    ],
}

SHEET_CATEGORIES: dict[str, list[str]] = {
    "balance_sheet": [
        "balance sheet",
        "financial position",
        "assets and liabilities",
    ],
    "income_statement": [
        "income statement",
        "profit and loss",
        "p&l",
        "income",
        "p & l",
    ],
    "cash_flow": ["cash flow", "cashflow"],
    "ratios": ["ratio", "key ratio", "financial ratio", "kpi"],
    "esg_emissions": ["emission", "ghg", "carbon", "scope"],
    "esg_taxonomy": ["taxonomy", "eu taxonomy"],
    "esg_social": ["social", "employee", "workforce"],
    "esg_governance": ["governance", "board", "compliance"],
}

# Pre-compiled patterns for entity extraction
_CURRENCY_RE = re.compile(
    r"(?:SEK|EUR|USD|GBP|NOK|DKK)\s*[\d,]+(?:\.\d+)?"
    r"(?:\s*(?:million|billion|mn|bn|MSEK|MEUR|MUSD))?",
    re.IGNORECASE,
)
_PERCENT_RE = re.compile(r"-?\d+(?:\.\d+)?%")
_DATE_RE = re.compile(
    r"\b\d{4}-\d{2}-\d{2}\b"
    r"|\b\d{1,2}\s+"
    r"(?:January|February|March|April|May|June"
    r"|July|August|September|October|November|December)"
    r"\s+\d{4}\b",
)
_ORG_SUFFIX_RE = re.compile(r"\b(?:AB|Ltd|Inc|GmbH|Corp|Plc|S\.A\.|AS|Oy|SIA)\b")


# ===================================================================
# Public async entry point
# ===================================================================


async def parse_excel(file_path: str, filename: str) -> dict:
    """Parse an Excel file (.xlsx or .xls) and return unified extraction."""
    return await asyncio.to_thread(_parse_excel_sync, file_path, filename)


# ===================================================================
# Synchronous implementation
# ===================================================================


def _parse_excel_sync(file_path: str, filename: str) -> dict:
    """Route to the correct engine based on extension, then run pipeline."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    try:
        if ext == "xls":
            raw_sheets = _load_xls(file_path)
        else:
            raw_sheets = _load_xlsx(file_path)

        if not raw_sheets:
            return _error_result(filename, "Workbook contains no sheets")

        # Phase 1+2: structural analysis & table detection per sheet
        parsed_sheets = [_analyse_sheet(s) for s in raw_sheets]

        # Phase 3+4: normalise & assemble
        return _assemble_output(filename, parsed_sheets)

    except Exception as e:
        logger.error("Excel parsing error for %s: %s", filename, e)
        return _error_result(filename, str(e))


# -------------------------------------------------------------------
# Loaders — return list[RawSheet]
# -------------------------------------------------------------------


class RawSheet:
    """Intermediate representation of one worksheet."""

    __slots__ = ("name", "rows", "merged_ranges")

    def __init__(
        self,
        name: str,
        rows: list[list[Any]],
        merged_ranges: list[tuple[int, int, int, int]] | None = None,
    ):
        self.name = name
        self.rows = rows  # list of rows; each row is list of cell values
        self.merged_ranges = merged_ranges or []


def _load_xlsx(file_path: str) -> list[RawSheet]:
    """Load .xlsx with openpyxl in *normal* mode (merged-cell aware).

    Detects Strict Open XML conformance and converts to Transitional
    format before loading, since openpyxl only supports Transitional.
    """
    from openpyxl import load_workbook

    actual_path = file_path
    tmp_file = None

    # Check if this is a Strict OOXML file and convert if needed
    if _is_strict_ooxml(file_path):
        logger.info("Strict OOXML detected for %s — converting", file_path)
        tmp_file = _convert_strict_to_transitional(file_path)
        actual_path = tmp_file

    try:
        wb = load_workbook(actual_path, data_only=True, read_only=False)
    finally:
        # Clean up temp file if we created one
        if tmp_file is not None:
            import os

            try:
                os.unlink(tmp_file)
            except OSError:
                pass

    sheets: list[RawSheet] = []

    for ws in wb.worksheets:
        # Collect merged ranges before unmerging
        merged = []
        for rng in list(ws.merged_cells.ranges):
            merged.append((rng.min_row, rng.min_col, rng.max_row, rng.max_col))

        # Fill merged cells: unmerge first, then propagate top-left value
        for min_r, min_c, max_r, max_c in merged:
            top_left = ws.cell(row=min_r, column=min_c).value
            ws.unmerge_cells(
                start_row=min_r,
                start_column=min_c,
                end_row=max_r,
                end_column=max_c,
            )
            for r in range(min_r, max_r + 1):
                for c in range(min_c, max_c + 1):
                    if r == min_r and c == min_c:
                        continue
                    ws.cell(row=r, column=c).value = top_left

        # Read all rows
        rows: list[list[Any]] = []
        for row in ws.iter_rows(values_only=True):
            rows.append(list(row))

        sheets.append(RawSheet(ws.title, rows, merged))

    wb.close()
    return sheets


# Namespace mapping: Strict OOXML → Transitional OOXML
_STRICT_TO_TRANSITIONAL: list[tuple[str, str]] = [
    (
        "http://purl.oclc.org/ooxml/spreadsheetml/main",
        "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    ),
    (
        "http://purl.oclc.org/ooxml/officeDocument/relationships",
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    ),
    (
        "http://purl.oclc.org/ooxml/drawingml/main",
        "http://schemas.openxmlformats.org/drawingml/2006/main",
    ),
    (
        "http://purl.oclc.org/ooxml/drawingml/chart",
        "http://schemas.openxmlformats.org/drawingml/2006/chart",
    ),
    (
        "http://purl.oclc.org/ooxml/drawingml/chartDrawing",
        "http://schemas.openxmlformats.org/drawingml/2006/chartDrawing",
    ),
    (
        "http://purl.oclc.org/ooxml/drawingml/spreadsheetDrawing",
        "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing",
    ),
    (
        "http://purl.oclc.org/ooxml/officeDocument/relationships/chart",
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart",
    ),
    (
        "http://purl.oclc.org/ooxml/officeDocument/relationships/chartsheet",
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chartsheet",
    ),
    (
        "http://purl.oclc.org/ooxml/officeDocument/relationships/drawing",
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing",
    ),
    (
        "http://purl.oclc.org/ooxml/officeDocument/relationships/externalLink",
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/"
        "externalLink",
    ),
    (
        "http://purl.oclc.org/ooxml/officeDocument/relationships/sharedStrings",
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/"
        "sharedStrings",
    ),
    (
        "http://purl.oclc.org/ooxml/officeDocument/relationships/styles",
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles",
    ),
    (
        "http://purl.oclc.org/ooxml/officeDocument/relationships/theme",
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme",
    ),
    (
        "http://purl.oclc.org/ooxml/officeDocument/relationships/worksheet",
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet",
    ),
]

# Detect strict namespace quickly
_STRICT_NS_MARKER = b"http://purl.oclc.org/ooxml/"


def _is_strict_ooxml(file_path: str) -> bool:
    """Check whether an .xlsx is in Strict Open XML format."""
    import zipfile

    try:
        with zipfile.ZipFile(file_path) as zf:
            if "xl/workbook.xml" not in zf.namelist():
                return False
            head = zf.read("xl/workbook.xml")[:2000]
            return _STRICT_NS_MARKER in head
    except Exception:
        return False


def _convert_strict_to_transitional(file_path: str) -> str:
    """Rewrite Strict OOXML namespaces to Transitional in a temp copy.

    Returns the path to a temporary .xlsx file the caller must delete.
    """
    import tempfile
    import zipfile

    tmp_fd, tmp_path = tempfile.mkstemp(suffix=".xlsx")
    try:
        with (
            zipfile.ZipFile(file_path, "r") as zin,
            zipfile.ZipFile(tmp_path, "w", compression=zipfile.ZIP_DEFLATED) as zout,
        ):
            for item in zin.infolist():
                data = zin.read(item.filename)
                # Only rewrite XML/rels text files
                if item.filename.endswith((".xml", ".rels")):
                    text = data.decode("utf-8")
                    for strict_ns, trans_ns in _STRICT_TO_TRANSITIONAL:
                        text = text.replace(strict_ns, trans_ns)
                    # Also strip conformance="strict"
                    text = text.replace(' conformance="strict"', "")
                    data = text.encode("utf-8")
                zout.writestr(item, data)
    except Exception:
        # If conversion fails, clean up and re-raise
        import os

        os.close(tmp_fd)
        os.unlink(tmp_path)
        raise
    else:
        import os

        os.close(tmp_fd)

    return tmp_path


def _load_xls(file_path: str) -> list[RawSheet]:
    """Load .xls with xlrd."""
    import xlrd

    wb = xlrd.open_workbook(file_path)
    sheets: list[RawSheet] = []

    for idx in range(wb.nsheets):
        ws = wb.sheet_by_index(idx)
        rows: list[list[Any]] = []
        for r in range(ws.nrows):
            row_vals: list[Any] = []
            for c in range(ws.ncols):
                cell = ws.cell(r, c)
                val = cell.value
                # xlrd encodes dates as floats; convert them
                if cell.ctype == xlrd.XL_CELL_DATE:
                    try:
                        dt = xlrd.xldate_as_datetime(val, wb.datemode)
                        val = dt.isoformat()
                    except Exception:
                        pass
                row_vals.append(val)
            rows.append(row_vals)
        # xlrd merged-cell ranges are 0-indexed; convert to 1-indexed
        merged = [(r1 + 1, c1 + 1, r2, c2) for r1, r2, c1, c2 in ws.merged_cells]
        sheets.append(RawSheet(ws.name, rows, merged))

    return sheets


# -------------------------------------------------------------------
# Phase 1+2: Structural analysis & table detection
# -------------------------------------------------------------------


class ParsedSheet:
    """Result of analysing one worksheet."""

    __slots__ = (
        "name",
        "category",
        "header_row_idx",
        "headers",
        "data_rows",
        "row_count",
        "merged_count",
        "key_metrics",
    )

    def __init__(self, name: str):
        self.name = name
        self.category: str = "unknown"
        self.header_row_idx: int = 0
        self.headers: list[str] = []
        self.data_rows: list[list[str]] = []
        self.row_count: int = 0
        self.merged_count: int = 0
        self.key_metrics: list[dict] = []


def _analyse_sheet(raw: RawSheet) -> ParsedSheet:
    """Detect header row, classify sheet, normalise cells, extract metrics."""
    ps = ParsedSheet(raw.name)
    ps.merged_count = len(raw.merged_ranges)

    # Classify sheet by name
    ps.category = _classify_sheet(raw.name)

    # Find the header row (first row with >= 2 non-empty text cells)
    header_idx = _detect_header_row(raw.rows)
    ps.header_row_idx = header_idx

    if header_idx < len(raw.rows):
        ps.headers = [_norm_cell(c) for c in raw.rows[header_idx]]
        data = raw.rows[header_idx + 1 :]
    else:
        # No header detected — treat row 0 as header if sheet has rows
        if raw.rows:
            ps.headers = [_norm_cell(c) for c in raw.rows[0]]
            data = raw.rows[1:]
        else:
            data = []

    # Normalise every data cell
    ps.data_rows = [[_norm_cell(c) for c in row] for row in data]
    ps.row_count = len(ps.data_rows)

    # Strip fully empty trailing rows
    while ps.data_rows and all(v == "" for v in ps.data_rows[-1]):
        ps.data_rows.pop()
        ps.row_count = len(ps.data_rows)

    # Extract financial key metrics
    ps.key_metrics = _extract_financial_metrics(ps.name, ps.headers, ps.data_rows)

    return ps


def _detect_header_row(rows: list[list[Any]], max_scan: int = 10) -> int:
    """Return index of the most likely header row.

    Heuristic: first row where >= 2 cells are non-empty strings that are
    NOT purely numeric.
    """
    for idx, row in enumerate(rows[:max_scan]):
        text_count = 0
        for cell in row:
            if cell is None:
                continue
            s = str(cell).strip()
            if s and not _is_numeric_string(s):
                text_count += 1
        if text_count >= 2:
            return idx
    return 0


def _classify_sheet(sheet_name: str) -> str:
    """Return a category string based on sheet name."""
    lower = sheet_name.lower().strip()
    for category, keywords in SHEET_CATEGORIES.items():
        for kw in keywords:
            if kw in lower:
                return category
    return "unknown"


# -------------------------------------------------------------------
# Phase 3: Cell normalisation
# -------------------------------------------------------------------


def _norm_cell(value: Any) -> str:
    """Convert a cell value to a clean string."""
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d")
    if isinstance(value, bool):
        return "Yes" if value else "No"
    if isinstance(value, float):
        # Preserve integers stored as float
        if value == int(value) and abs(value) < 1e15:
            return str(int(value))
        return f"{value:,.2f}"
    if isinstance(value, int):
        return f"{value:,}"
    s = str(value).strip()
    # Collapse internal whitespace
    s = re.sub(r"\s+", " ", s)
    return s


def _is_numeric_string(s: str) -> bool:
    """Return True if s looks like a plain number."""
    cleaned = s.replace(",", "").replace(" ", "").replace("%", "")
    try:
        float(cleaned)
        return True
    except ValueError:
        return False


# -------------------------------------------------------------------
# Phase 3 continued: Financial metric extraction
# -------------------------------------------------------------------


def _extract_financial_metrics(
    sheet_name: str,
    headers: list[str],
    rows: list[list[str]],
) -> list[dict]:
    """Extract financial key metrics from a sheet's data rows."""
    metrics: list[dict] = []

    for row in rows:
        if not row:
            continue
        label = row[0].lower().strip()
        if not label:
            continue

        for metric_name, keywords in FINANCIAL_LABELS.items():
            if any(kw in label for kw in keywords):
                values = _parse_numeric_cells(row[1:])
                if values:
                    value_headers = headers[1 : len(values) + 1]
                    metrics.append(
                        {
                            "name": metric_name,
                            "label": row[0],
                            "values": values,
                            "sheet": sheet_name,
                            "headers": value_headers,
                        }
                    )
                break

    return metrics


def _parse_numeric_cells(cells: list[str]) -> list[float]:
    """Extract numeric values from a list of cell strings."""
    values: list[float] = []
    for cell in cells:
        if not cell:
            continue
        cleaned = cell.replace(",", "").replace(" ", "").replace("%", "")
        try:
            values.append(float(cleaned))
        except ValueError:
            continue
    return values


# -------------------------------------------------------------------
# Phase 4: Output assembly
# -------------------------------------------------------------------


def _assemble_output(filename: str, sheets: list[ParsedSheet]) -> dict:
    """Build the unified extraction dict with Markdown full_text."""
    sections: list[dict] = []
    tables: list[dict] = []
    all_metrics: list[dict] = []
    full_text_parts: list[str] = []

    sheet_names = [s.name for s in sheets]

    for ps in sheets:
        # Section metadata
        category_label = ps.category.replace("_", " ").title()
        sections.append(
            {
                "heading": f"Sheet: {ps.name}",
                "content": (
                    f"Category: {category_label}. "
                    f"Headers: {', '.join(h for h in ps.headers if h)}. "
                    f"{ps.row_count} data rows."
                    + (f" {ps.merged_count} merged regions." if ps.merged_count else "")
                ),
                "sheet": ps.name,
                "category": ps.category,
            }
        )

        # Table
        tables.append(
            {
                "sheet": ps.name,
                "category": ps.category,
                "headers": ps.headers,
                "rows": ps.data_rows,
                "row_count": ps.row_count,
            }
        )

        # Key metrics
        all_metrics.extend(ps.key_metrics)

        # Markdown for full_text (no row cap — LLM needs complete data)
        full_text_parts.append(_sheet_to_markdown(ps))

    # Entity extraction from full text
    full_text = "\n\n".join(full_text_parts)
    entities = _extract_entities(full_text)

    # Confidence scoring
    confidence = _compute_confidence(sheets)

    return {
        "title": filename,
        "sections": sections,
        "tables": tables,
        "entities": entities,
        "key_metrics": all_metrics,
        "source_references": [
            {
                "type": "excel",
                "filename": filename,
                "sheets": sheet_names,
            }
        ],
        "ocr_used": False,
        "confidence": confidence,
        "full_text": full_text,
        "sheet_count": len(sheets),
    }


def _sheet_to_markdown(ps: ParsedSheet) -> str:
    """Render a parsed sheet as a Markdown table for LLM consumption."""
    lines: list[str] = []
    category_label = ps.category.replace("_", " ").title()
    lines.append(f"## {ps.name}  ({category_label})")
    lines.append("")

    non_empty = ps.headers[:]
    header_line = "| " + " | ".join(h if h else "-" for h in non_empty) + " |"
    sep_line = "| " + " | ".join("---" for _ in non_empty) + " |"
    lines.append(header_line)
    lines.append(sep_line)

    for row in ps.data_rows:
        # Pad row to match header count
        padded = row + [""] * (len(non_empty) - len(row))
        cells = [c if c else "-" for c in padded[: len(non_empty)]]
        lines.append("| " + " | ".join(cells) + " |")

    lines.append("")
    return "\n".join(lines)


def _extract_entities(text: str) -> list[dict]:
    """Extract entities from the assembled full text."""
    entities: list[dict] = []

    orgs = _ORG_SUFFIX_RE.findall(text)
    if orgs:
        entities.append({"type": "organization_suffix", "values": list(set(orgs))})

    amounts = _CURRENCY_RE.findall(text)
    if amounts:
        entities.append({"type": "monetary_amounts", "values": amounts[:30]})

    dates = _DATE_RE.findall(text)
    if dates:
        entities.append({"type": "dates", "values": dates[:30]})

    percents = _PERCENT_RE.findall(text)
    if percents:
        entities.append({"type": "percentages", "values": percents[:30]})

    return entities


def _compute_confidence(sheets: list[ParsedSheet]) -> float:
    """Heuristic confidence based on data quality signals."""
    if not sheets:
        return 0.0

    score = 0.95  # start high for Excel (structured data)

    total_rows = sum(s.row_count for s in sheets)
    total_merged = sum(s.merged_count for s in sheets)

    # Penalise if no data rows at all
    if total_rows == 0:
        return 0.3

    # Many merged cells suggest complex layout — slight penalty
    if total_merged > 50:
        score -= 0.10
    elif total_merged > 20:
        score -= 0.05

    # Penalise if many sheets are unclassified
    unknown_ratio = sum(1 for s in sheets if s.category == "unknown") / len(sheets)
    if unknown_ratio > 0.5:
        score -= 0.05

    # Bonus for having detected financial metrics
    has_metrics = any(s.key_metrics for s in sheets)
    if not has_metrics:
        score -= 0.05

    return round(max(score, 0.3), 2)


# -------------------------------------------------------------------
# Error helper
# -------------------------------------------------------------------


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
        "full_text": f"[Error parsing Excel: {error_msg}]",
        "error": error_msg,
    }
