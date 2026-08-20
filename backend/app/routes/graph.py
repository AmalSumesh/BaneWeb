from fastapi import APIRouter
from app.schemas.pipeline import GraphDataResponse, StatsResponse
from app.services.results_loader import load_result_json

router = APIRouter(tags=["Data"])


@router.get("/graph", response_model=GraphDataResponse)
async def get_graph_data():
    """Return graph nodes and edges from the latest pipeline run."""
    data = load_result_json("graph_data.json")
    return GraphDataResponse(
        nodes=data.get("nodes", []),
        edges=data.get("edges", []),
    )


@router.get("/stats", response_model=StatsResponse)
async def get_statistics():
    """Return graph statistics from the latest pipeline run."""
    data = load_result_json("graph_statistics.json")
    return StatsResponse(**data)
