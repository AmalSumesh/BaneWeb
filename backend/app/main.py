#!/usr/bin/env python3
"""
FastAPI Backend Application for Drug Repurposing Engine.
Clean, modularized routing and services.
"""

import os
import sys
from pathlib import Path
from uuid import uuid4
from datetime import datetime

from fastapi import APIRouter, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from dotenv import load_dotenv

# Ensure backend root is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

load_dotenv()

from app.config import settings
from app.schemas.error import ApiErrorDetail
from app.services.results_loader import RESULTS_DIR
from app.routes import (
    alerts,
    companies,
    diseases,
    drugs,
    evidence,
    graph,
    papers,
    patents,
    pipeline,
    projects,
    research,
    search,
    signals,
    trials,
)

app = FastAPI(
    title="Drug Repurposing Engine API",
    version="1.0.0",
    description="Biomedical Research Intelligence & Drug Repurposing API.",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
cors_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins != ["*"] else ["*"],
    allow_credentials=True if cors_origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Exception Handlers ────────────────────────────────────────────────────────
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    request_id = request.headers.get("X-Request-ID") or f"req-{uuid4().hex[:8]}"
    error = ApiErrorDetail(
        code=f"HTTP_{exc.status_code}",
        message=str(exc.detail),
        request_id=request_id,
    )
    return JSONResponse(status_code=exc.status_code, content=error.model_dump(by_alias=True))


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = request.headers.get("X-Request-ID") or f"req-{uuid4().hex[:8]}"
    error = ApiErrorDetail(
        code="INTERNAL_SERVICE_ERROR",
        message="An unexpected error occurred while processing research intelligence.",
        details=str(exc) if getattr(settings, "data_service", "") == "mock" else None,
        request_id=request_id,
    )
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=error.model_dump(by_alias=True))


# ── Interactive Visualization HTML Serve ─────────────────────────────────────
@app.get("/", tags=["Visualization"], response_class=HTMLResponse)
async def serve_visualization():
    """
    Serve the interactive knowledge-graph HTML visualization.
    """
    html_path = os.path.join(RESULTS_DIR, "knowledge_graph.html")
    if not os.path.isfile(html_path):
        return HTMLResponse(
            content="""
            <html>
                <body style="font-family: sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc;">
                    <h2>Knowledge Graph Visualization</h2>
                    <p>No knowledge graph HTML found yet. Run the pipeline first via <code>POST /api/pipeline/run</code>.</p>
                </body>
            </html>
            """,
            status_code=200,
        )
    with open(html_path, "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())


# ── Health Probes ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
async def health_check():
    """Basic liveness probe."""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


# ── Routers (Mounted under /api for legacy & /api/v1 for versioned) ───────────
api_router = APIRouter(prefix="/api")
api_v1_router = APIRouter(prefix="/api/v1")

for r in [
    pipeline.router,
    graph.router,
    evidence.router,
    papers.router,
    drugs.router,
    signals.router,
    search.router,
    companies.router,
    diseases.router,
    trials.router,
    patents.router,
    research.router,
    projects.projects_router,
    projects.saved_router,
    alerts.router,
]:
    api_router.include_router(r)
    api_v1_router.include_router(r)

app.include_router(api_router)
app.include_router(api_v1_router)


if __name__ == "__main__":
    import uvicorn

    api_host = os.getenv("API_HOST", "0.0.0.0")
    api_port = int(os.getenv("API_PORT", "8000"))

    uvicorn.run(
        "app.main:app",
        host=api_host,
        port=api_port,
        reload=True,
    )
