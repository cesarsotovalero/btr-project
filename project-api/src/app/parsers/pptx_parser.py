"""PowerPoint parser — extracts slide content, notes, and structured text."""

import asyncio
import logging

logger = logging.getLogger(__name__)


async def parse_pptx(file_path: str, filename: str) -> dict:
    """Parse a PowerPoint file and return unified extraction JSON."""
    return await asyncio.to_thread(_parse_pptx_sync, file_path, filename)


def _parse_pptx_sync(file_path: str, filename: str) -> dict:
    """Synchronous PowerPoint parsing logic."""
    from pptx import Presentation

    sections = []
    tables = []
    full_text_parts = []
    entities = []

    try:
        prs = Presentation(file_path)

        for i, slide in enumerate(prs.slides):
            slide_texts = []
            slide_tables = []

            for shape in slide.shapes:
                if shape.has_text_frame:
                    for paragraph in shape.text_frame.paragraphs:
                        text = paragraph.text.strip()
                        if text:
                            slide_texts.append(text)
                            full_text_parts.append(text)

                if shape.has_table:
                    table = shape.table
                    headers = [cell.text.strip() for cell in table.rows[0].cells]
                    rows = []
                    for row in table.rows[1:]:
                        rows.append([cell.text.strip() for cell in row.cells])
                    slide_tables.append(
                        {
                            "slide": i + 1,
                            "headers": headers,
                            "rows": rows,
                        }
                    )
                    tables.extend(slide_tables)

            # Slide notes
            notes_text = ""
            if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
                notes_text = slide.notes_slide.notes_text_frame.text.strip()
                if notes_text:
                    full_text_parts.append(f"[Notes] {notes_text}")

            title = ""
            if slide.shapes.title:
                title = slide.shapes.title.text

            sections.append(
                {
                    "slide": i + 1,
                    "heading": title or f"Slide {i + 1}",
                    "content": "\n".join(slide_texts),
                    "notes": notes_text,
                    "table_count": len(slide_tables),
                }
            )

        return {
            "title": filename,
            "sections": sections,
            "tables": tables,
            "entities": entities,
            "key_metrics": [],
            "source_references": [
                {
                    "type": "pptx",
                    "filename": filename,
                    "slides": len(prs.slides),
                }
            ],
            "ocr_used": False,
            "confidence": 0.85,
            "full_text": "\n".join(full_text_parts),
            "slide_count": len(prs.slides),
        }

    except Exception as e:
        logger.error(f"PPTX parsing error for {filename}: {e}")
        return {
            "title": filename,
            "sections": [],
            "tables": [],
            "entities": [],
            "key_metrics": [],
            "source_references": [],
            "ocr_used": False,
            "confidence": 0.0,
            "full_text": f"[Error parsing PPTX: {str(e)}]",
            "error": str(e),
        }
