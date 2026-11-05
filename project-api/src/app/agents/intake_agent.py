"""Intake Agent — validates uploads, classifies document types, creates parsing plan."""

import logging

logger = logging.getLogger(__name__)


async def run_intake_agent(case_data: dict, documents: list[dict]) -> dict:
    """Validate the upload set and create a document inventory.

    Mostly deterministic — checks file types, sizes, completeness.
    """
    inventory = []
    issues = []
    parsing_plan = []

    expected_types = {"pdf", "excel", "pptx"}
    found_types = set()

    for doc in documents:
        file_type = doc.get("file_type", "unknown")
        filename = doc.get("filename", "unknown")
        file_size = doc.get("file_size", 0)
        found_types.add(file_type)

        item = {
            "document_id": doc.get("id"),
            "filename": filename,
            "file_type": file_type,
            "file_size": file_size,
            "status": "ready",
        }

        # Basic validation
        if file_size == 0:
            item["status"] = "warning"
            issues.append(f"File '{filename}' appears to be empty")
        elif file_size and file_size > 50_000_000:  # 50MB limit
            item["status"] = "warning"
            issues.append(f"File '{filename}' is very large ({file_size} bytes)")

        inventory.append(item)

        parsing_plan.append(
            {
                "document_id": doc.get("id"),
                "parser": file_type,
                "priority": 1 if file_type == "pdf" else 2,
            }
        )

    # Check for missing document types
    missing_types = expected_types - found_types
    if missing_types:
        missing = ", ".join(missing_types)
        issues.append(f"Missing document types that are commonly expected: {missing}")

    # Sort parsing plan by priority
    parsing_plan.sort(key=lambda x: x["priority"])

    return {
        "status": "completed",
        "document_count": len(documents),
        "inventory": inventory,
        "found_types": list(found_types),
        "missing_types": list(missing_types),
        "issues": issues,
        "parsing_plan": parsing_plan,
        "case_bundle_ready": len(issues) == 0,
    }
