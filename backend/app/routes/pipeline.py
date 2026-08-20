import os
import asyncio
from fastapi import APIRouter, BackgroundTasks, HTTPException, Query
from fastapi.responses import FileResponse, HTMLResponse

from app.schemas.pipeline import PipelineRequest, PipelineStatusResponse
from app.services.pipeline_service import (
    get_pipeline_state,
    is_pipeline_running,
    set_pipeline_running,
    run_pipeline_sync,
)
from app.services.results_loader import (
    RESULTS_DIR,
    get_result_filepath,
    load_result_json,
)

router = APIRouter(tags=["Pipeline"])


@router.post("/pipeline/run", response_model=PipelineStatusResponse)
async def run_pipeline_endpoint(req: PipelineRequest, background_tasks: BackgroundTasks):
    """
    Trigger a new pipeline run.
    Runs in the background. Poll `/api/pipeline/status` or `/api/v1/pipeline/status` to check progress.
    """
    if is_pipeline_running():
        raise HTTPException(
            status_code=409,
            detail="A pipeline run is already in progress. Wait for it to finish.",
        )

    set_pipeline_running(req.query)

    # Run in thread so the API stays responsive
    background_tasks.add_task(
        asyncio.to_thread, run_pipeline_sync, req.query, req.max_results
    )

    return PipelineStatusResponse(**get_pipeline_state())


@router.get("/pipeline/status", response_model=PipelineStatusResponse)
async def pipeline_status_endpoint():
    """Check the current status of the pipeline."""
    return PipelineStatusResponse(**get_pipeline_state())


@router.get("/visualization/regenerate", response_class=HTMLResponse, tags=["Visualization"])
async def regenerate_visualization(
    query: str = Query(None, description="Override the query label in the visualization"),
):
    """
    Re-generate the HTML visualization from current results data without re-running the entire pipeline.
    """
    try:
        graph_data = load_result_json("graph_data.json")
        stats_data = load_result_json("graph_statistics.json")
    except HTTPException:
        raise HTTPException(
            status_code=404,
            detail="Graph data or statistics not found. Run the pipeline first.",
        )

    # Read evidence
    csv_path = os.path.join(RESULTS_DIR, "evidence_mapping.csv")
    evidence_list = []
    if os.path.isfile(csv_path):
        import pandas as pd
        evidence_list = pd.read_csv(csv_path).fillna("").to_dict(orient="records")

    query_label = query or stats_data.get("query", "Biomedical Knowledge Exploration")

    from knowledge_graph.html_generator import generate_knowledge_graph_html

    html = generate_knowledge_graph_html(
        nodes=graph_data.get("nodes", []),
        edges=graph_data.get("edges", []),
        evidence=evidence_list,
        stats=stats_data,
        query=query_label,
        title=f"BioGraph AI | {query_label}",
    )

    # Persist so `/` serves latest version
    html_path = os.path.join(RESULTS_DIR, "knowledge_graph.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)

    return HTMLResponse(content=html)


@router.get("/download/{filename}", tags=["Data"])
async def download_result_file(filename: str):
    """Download any result file directly (CSV, JSON, HTML, TXT)."""
    path = get_result_filepath(filename)
    safe_name = os.path.basename(path)
    return FileResponse(path, filename=safe_name)
