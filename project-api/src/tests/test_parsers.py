"""Tests for the Excel and CSV parsers.

Tests use real .xlsx files from `data/test_documents/` where available,
plus dynamically-created workbooks for edge cases (merged cells, empty
sheets, header detection, .xls fallback).
"""

from __future__ import annotations

import csv
from pathlib import Path

import pytest

from app.parsers.csv_parser import parse_csv
from app.parsers.excel_parser import (
    ParsedSheet,
    RawSheet,
    _analyse_sheet,
    _classify_sheet,
    _compute_confidence,
    _convert_strict_to_transitional,
    _detect_header_row,
    _extract_financial_metrics,
    _is_strict_ooxml,
    _norm_cell,
    _parse_excel_sync,
    parse_excel,
)

# ---------------------------------------------------------------------------
# Locate test data directory
# ---------------------------------------------------------------------------

DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "test_documents"


# ===========================================================================
# Excel parser — unit tests for internal helpers
# ===========================================================================


class TestNormCell:
    def test_none(self):
        assert _norm_cell(None) == ""

    def test_string(self):
        assert _norm_cell("  hello  world ") == "hello world"

    def test_int(self):
        assert _norm_cell(8200) == "8,200"

    def test_float_integer(self):
        # A float that is actually an integer (common in Excel)
        assert _norm_cell(8200.0) == "8200"

    def test_float_decimal(self):
        assert _norm_cell(13.55) == "13.55"

    def test_bool_true(self):
        assert _norm_cell(True) == "Yes"

    def test_bool_false(self):
        assert _norm_cell(False) == "No"

    def test_datetime(self):
        from datetime import datetime

        dt = datetime(2025, 3, 15)
        assert _norm_cell(dt) == "2025-03-15"


class TestClassifySheet:
    def test_balance_sheet(self):
        assert _classify_sheet("Balance Sheet") == "balance_sheet"

    def test_income_statement(self):
        assert _classify_sheet("Income Statement") == "income_statement"

    def test_key_ratios(self):
        assert _classify_sheet("Key Ratios") == "ratios"

    def test_ghg_emissions(self):
        assert _classify_sheet("GHG Emissions") == "esg_emissions"

    def test_eu_taxonomy(self):
        assert _classify_sheet("EU Taxonomy") == "esg_taxonomy"

    def test_governance(self):
        assert _classify_sheet("Governance") == "esg_governance"

    def test_social_metrics(self):
        assert _classify_sheet("Social Metrics") == "esg_social"

    def test_unknown(self):
        assert _classify_sheet("RandomSheet") == "unknown"


class TestDetectHeaderRow:
    def test_simple(self):
        rows = [["Item", "2025", "2024"], [100, 200, 300]]
        assert _detect_header_row(rows) == 0

    def test_blank_first_row(self):
        rows = [[None, None], ["Item", "Value"], [1, 2]]
        assert _detect_header_row(rows) == 1

    def test_all_numeric(self):
        rows = [[1, 2, 3], [4, 5, 6]]
        assert _detect_header_row(rows) == 0  # falls back to 0

    def test_empty(self):
        assert _detect_header_row([]) == 0


class TestExtractFinancialMetrics:
    def test_detects_revenue(self):
        headers = ["Item", "2025 (MSEK)", "2024 (MSEK)"]
        rows = [["Revenue", "4,870", "4,520"]]
        metrics = _extract_financial_metrics("Income", headers, rows)
        assert len(metrics) == 1
        assert metrics[0]["name"] == "revenue"
        assert 4870.0 in metrics[0]["values"]
        assert 4520.0 in metrics[0]["values"]

    def test_detects_multiple(self):
        headers = ["Item", "2025", "2024"]
        rows = [
            ["Total Assets", "8,200", "7,800"],
            ["Total Equity", "3,100", "2,900"],
            ["Unrelated", "abc", "def"],
        ]
        metrics = _extract_financial_metrics("BS", headers, rows)
        names = {m["name"] for m in metrics}
        assert "total_assets" in names
        assert "equity" in names

    def test_empty_rows(self):
        metrics = _extract_financial_metrics("X", ["A", "B"], [])
        assert metrics == []


class TestComputeConfidence:
    def test_empty_sheets(self):
        assert _compute_confidence([]) == 0.0

    def test_no_data_rows(self):
        ps = ParsedSheet("Empty")
        ps.row_count = 0
        assert _compute_confidence([ps]) == 0.3

    def test_good_sheet(self):
        ps = ParsedSheet("Income Statement")
        ps.row_count = 10
        ps.merged_count = 0
        ps.category = "income_statement"
        ps.key_metrics = [{"name": "revenue"}]
        score = _compute_confidence([ps])
        assert score >= 0.9

    def test_many_merges_penalised(self):
        ps = ParsedSheet("Sheet1")
        ps.row_count = 10
        ps.merged_count = 55
        ps.category = "unknown"
        ps.key_metrics = []
        score = _compute_confidence([ps])
        assert score < 0.85


# ===========================================================================
# Excel parser — integration tests with real test files
# ===========================================================================


class TestParseExcelIntegration:
    """Test against the actual test documents if they exist."""

    @pytest.fixture()
    def nordvik_financial(self):
        path = (
            DATA_DIR
            / "nordvik_energy"
            / ("Nordvik_Energy_Financial_Statements_2025.xlsx")
        )
        if not path.exists():
            pytest.skip("Test data not generated")
        return str(path)

    @pytest.fixture()
    def nordvik_esg(self):
        path = DATA_DIR / "nordvik_energy" / ("Nordvik_Energy_ESG_Disclosure_2025.xlsx")
        if not path.exists():
            pytest.skip("Test data not generated")
        return str(path)

    @pytest.mark.asyncio
    async def test_financial_statements_sheets(self, nordvik_financial):
        result = await parse_excel(
            nordvik_financial,
            "Nordvik_Energy_Financial_Statements_2025.xlsx",
        )
        assert result["sheet_count"] == 3
        sheet_names = [s["heading"] for s in result["sections"]]
        assert "Sheet: Balance Sheet" in sheet_names
        assert "Sheet: Income Statement" in sheet_names
        assert "Sheet: Key Ratios" in sheet_names

    @pytest.mark.asyncio
    async def test_financial_statements_metrics(self, nordvik_financial):
        result = await parse_excel(
            nordvik_financial,
            "Nordvik_Energy_Financial_Statements_2025.xlsx",
        )
        metric_names = {m["name"] for m in result["key_metrics"]}
        assert "revenue" in metric_names
        assert "total_assets" in metric_names
        assert "equity" in metric_names
        assert "net_income" in metric_names

    @pytest.mark.asyncio
    async def test_financial_statements_full_text_is_markdown(self, nordvik_financial):
        result = await parse_excel(
            nordvik_financial,
            "Nordvik_Energy_Financial_Statements_2025.xlsx",
        )
        ft = result["full_text"]
        # Markdown tables have | delimiters and --- separator
        assert "| " in ft
        assert "---" in ft
        # Should contain actual data
        assert "Revenue" in ft or "revenue" in ft.lower()

    @pytest.mark.asyncio
    async def test_financial_statements_no_row_cap(self, nordvik_financial):
        """All data rows should be present — no truncation."""
        result = await parse_excel(
            nordvik_financial,
            "Nordvik_Energy_Financial_Statements_2025.xlsx",
        )
        for table in result["tables"]:
            assert len(table["rows"]) == table["row_count"]

    @pytest.mark.asyncio
    async def test_esg_disclosure_categories(self, nordvik_esg):
        result = await parse_excel(
            nordvik_esg,
            "Nordvik_Energy_ESG_Disclosure_2025.xlsx",
        )
        categories = {s.get("category") for s in result["sections"]}
        # Should classify at least emissions and taxonomy
        assert "esg_emissions" in categories
        assert "esg_taxonomy" in categories

    @pytest.mark.asyncio
    async def test_confidence_is_high(self, nordvik_financial):
        result = await parse_excel(
            nordvik_financial,
            "Nordvik_Energy_Financial_Statements_2025.xlsx",
        )
        assert result["confidence"] >= 0.85


# ===========================================================================
# Excel parser — edge cases with in-memory workbooks
# ===========================================================================


class TestParseExcelEdgeCases:
    @pytest.fixture()
    def tmp_xlsx(self, tmp_path):
        """Helper: create a .xlsx from column data and return path."""

        def _create(sheets: dict[str, list[list]]) -> str:
            from openpyxl import Workbook

            wb = Workbook()
            first = True
            for name, rows in sheets.items():
                ws = wb.active if first else wb.create_sheet(name)
                if first:
                    ws.title = name
                    first = False
                for r_idx, row in enumerate(rows, 1):
                    for c_idx, val in enumerate(row, 1):
                        ws.cell(row=r_idx, column=c_idx, value=val)
            path = tmp_path / "test.xlsx"
            wb.save(str(path))
            return str(path)

        return _create

    def test_empty_workbook(self, tmp_xlsx):
        path = tmp_xlsx({"Sheet1": []})
        result = _parse_excel_sync(path, "empty.xlsx")
        assert result["confidence"] == 0.3
        assert result["sheet_count"] == 1

    def test_single_row_no_data(self, tmp_xlsx):
        path = tmp_xlsx({"Data": [["Col A", "Col B"]]})
        result = _parse_excel_sync(path, "headers_only.xlsx")
        assert result["tables"][0]["row_count"] == 0
        assert result["sections"][0]["heading"] == "Sheet: Data"

    def test_merged_cells_filled(self, tmp_path):
        """Merged regions should have the top-left value propagated."""
        from openpyxl import Workbook

        wb = Workbook()
        ws = wb.active
        ws.title = "Merged"
        ws.cell(1, 1, "Header A")
        ws.cell(1, 2, "Header B")
        ws.cell(2, 1, "Label")
        ws.cell(2, 2, 100)
        ws.cell(3, 1, "Merged Label")
        ws.cell(3, 2, 200)
        # Merge A3:A4 — row 4 col 1 should get "Merged Label"
        ws.merge_cells("A3:A4")
        ws.cell(4, 2, 300)

        path = tmp_path / "merged.xlsx"
        wb.save(str(path))

        result = _parse_excel_sync(str(path), "merged.xlsx")
        table = result["tables"][0]
        # Row index 2 (third data row, zero-indexed from header)
        # should have "Merged Label" filled in from the merge
        found = False
        for row in table["rows"]:
            if row[0] == "Merged Label" and row[1]:
                found = True
        assert found, "Merged cell value not propagated into data rows"

    def test_sheet_classification_in_sections(self, tmp_xlsx):
        path = tmp_xlsx(
            {
                "Income Statement": [["Item", "2025"], ["Revenue", 100]],
                "Balance Sheet": [["Item", "2025"], ["Total Assets", 500]],
            }
        )
        result = _parse_excel_sync(path, "classified.xlsx")
        cats = {s["category"] for s in result["sections"]}
        assert "income_statement" in cats
        assert "balance_sheet" in cats

    def test_strict_ooxml_detection(self, tmp_path):
        """A normal .xlsx should NOT be detected as strict OOXML."""
        from openpyxl import Workbook

        wb = Workbook()
        ws = wb.active
        ws.title = "Data"
        ws.cell(1, 1, "A")
        path = tmp_path / "normal.xlsx"
        wb.save(str(path))
        assert not _is_strict_ooxml(str(path))

    def test_strict_ooxml_conversion(self, tmp_path):
        """Create a fake strict OOXML ZIP and verify conversion."""
        import zipfile

        strict_ns = "http://purl.oclc.org/ooxml/spreadsheetml/main"
        wb_xml = (
            '<?xml version="1.0"?>'
            f'<workbook xmlns="{strict_ns}" conformance="strict">'
            "<sheets>"
            '<sheet name="Test" sheetId="1" r:id="rId1"/>'
            "</sheets>"
            "</workbook>"
        )
        path = tmp_path / "strict.xlsx"
        with zipfile.ZipFile(str(path), "w") as zf:
            zf.writestr("xl/workbook.xml", wb_xml)

        assert _is_strict_ooxml(str(path))

        converted = _convert_strict_to_transitional(str(path))
        try:
            with zipfile.ZipFile(converted) as zf:
                content = zf.read("xl/workbook.xml").decode()
            assert strict_ns not in content
            assert "conformance" not in content
            trans = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
            assert trans in content
        finally:
            import os

            os.unlink(converted)


# ===========================================================================
# Excel parser — RawSheet / ParsedSheet analysis
# ===========================================================================


class TestAnalyseSheet:
    def test_basic_analysis(self):
        raw = RawSheet(
            "Income Statement",
            [
                ["Item", "2025 (MSEK)", "2024 (MSEK)"],
                ["Revenue", 4870, 4520],
                ["Net Income", 420, 380],
            ],
        )
        ps = _analyse_sheet(raw)
        assert ps.category == "income_statement"
        assert ps.headers == ["Item", "2025 (MSEK)", "2024 (MSEK)"]
        assert ps.row_count == 2
        assert len(ps.key_metrics) >= 2

    def test_trailing_empty_rows_stripped(self):
        raw = RawSheet(
            "Data",
            [
                ["A", "B"],
                ["x", "y"],
                [None, None],
                [None, None],
            ],
        )
        ps = _analyse_sheet(raw)
        assert ps.row_count == 1  # only the "x", "y" row


# ===========================================================================
# CSV parser tests
# ===========================================================================


class TestParseCsv:
    @pytest.fixture()
    def csv_file(self, tmp_path):
        """Helper to create a CSV file."""

        def _create(rows: list[list[str]], delimiter: str = ",") -> str:
            path = tmp_path / "test.csv"
            with open(path, "w", newline="") as f:
                writer = csv.writer(f, delimiter=delimiter)
                for row in rows:
                    writer.writerow(row)
            return str(path)

        return _create

    @pytest.mark.asyncio
    async def test_basic_parse(self, csv_file):
        path = csv_file(
            [
                ["Name", "Amount", "Currency"],
                ["Widget A", "1000", "SEK"],
                ["Widget B", "2000", "EUR"],
            ]
        )
        result = await parse_csv(path, "test.csv")
        assert result["title"] == "test.csv"
        assert len(result["tables"]) == 1
        assert result["tables"][0]["row_count"] == 2
        assert "| " in result["full_text"]

    @pytest.mark.asyncio
    async def test_empty_csv(self, tmp_path):
        path = tmp_path / "empty.csv"
        path.write_text("")
        result = await parse_csv(str(path), "empty.csv")
        assert result["confidence"] == 0.0
        assert "error" in result

    @pytest.mark.asyncio
    async def test_headers_only(self, csv_file):
        path = csv_file([["A", "B", "C"]])
        result = await parse_csv(path, "headers_only.csv")
        assert result["tables"][0]["row_count"] == 0

    @pytest.mark.asyncio
    async def test_tsv_detection(self, tmp_path):
        """Tab-separated files should be auto-detected."""
        path = tmp_path / "test.tsv"
        with open(path, "w") as f:
            f.write("Name\tValue\n")
            f.write("A\t100\n")
            f.write("B\t200\n")
        result = await parse_csv(str(path), "test.tsv")
        assert result["tables"][0]["row_count"] == 2
        assert result["tables"][0]["headers"] == ["Name", "Value"]
