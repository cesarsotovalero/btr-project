FROM python:3.13-slim

# Install system dependencies for OCR and PDF processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Use the same dependencies as project-api
COPY project-api/uv.lock project-api/pyproject.toml project-api/README.md ./
RUN uv sync --frozen --no-cache

# Copy API source (shared models, agents, etc.)
COPY project-api/src/app app/

# Copy worker script
COPY project-worker/worker.py .

CMD ["/app/.venv/bin/python", "worker.py"]
