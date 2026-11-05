"""Main FastAPI application entry point."""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.analysis import router as analysis_router
from app.api.auth import router as auth_router
from app.api.cases import router as cases_router
from app.api.chat import router as chat_router
from app.api.documents import router as documents_router
from app.api.references import router as references_router
from app.api.reviews import router as reviews_router
from app.config import settings
from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize DB tables and uploads dir on startup."""
    await init_db()
    os.makedirs(settings.upload_dir, exist_ok=True)
    yield


app = FastAPI(
    title="BTR Risk Assessment API",
    description="Backend API for the SEB Risk Assessment system (BTR). "
    "Provides case management, document ingestion, AI-powered multi-agent "
    "analysis, and analyst review workflows.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://project-ui:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(cases_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(reviews_router, prefix="/api")
app.include_router(references_router, prefix="/api")
app.include_router(chat_router, prefix="/api")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}
