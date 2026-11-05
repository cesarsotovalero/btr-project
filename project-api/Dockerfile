FROM python:3.13-slim

# System dependencies for OCR & PDF rendering
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr poppler-utils libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY uv.lock pyproject.toml README.md ./
RUN uv sync --frozen --no-cache

# Alembic config
COPY alembic.ini ./
COPY alembic/ alembic/

# Application code
COPY src/app app/
COPY tools tools/

# Create uploads directory
RUN mkdir -p /app/uploads

# Define a command to run the application
CMD ["/app/.venv/bin/uvicorn", "app.main:app", "--port", "8000", "--host", "0.0.0.0"]
