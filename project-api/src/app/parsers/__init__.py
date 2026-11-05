"""Document parsing pipeline — routes files to the appropriate parser."""

from app.models.document import Document
from app.parsers.csv_parser import parse_csv
from app.parsers.excel_parser import parse_excel
from app.parsers.pdf_parser import parse_pdf
from app.parsers.pptx_parser import parse_pptx

PARSER_MAP = {
    "pdf": parse_pdf,
    "excel": parse_excel,
    "pptx": parse_pptx,
    "csv": parse_csv,
}


async def parse_document(doc: Document) -> dict:
    """Parse a document and return unified extraction JSON.

    Routes to the correct parser based on doc.file_type.
    Returns the spec-defined unified representation.
    """
    parser = PARSER_MAP.get(doc.file_type)
    if not parser:
        # Unsupported type — return minimal extraction
        return {
            "document_id": str(doc.id),
            "document_type": doc.file_type,
            "title": doc.filename,
            "sections": [],
            "tables": [],
            "entities": [],
            "key_metrics": [],
            "source_references": [],
            "ocr_used": False,
            "confidence": 0.3,
            "full_text": f"[Unsupported file type: {doc.file_type}]",
        }

    result = await parser(doc.storage_path, doc.filename)
    result["document_id"] = str(doc.id)
    result["document_type"] = doc.file_type
    return result
