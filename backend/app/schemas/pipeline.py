from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class PipelineRequest(BaseModel):
    query: str = Field(
        ...,
        description="Biomedical search query (e.g. 'propranolol hemangioma drug repurposing')",
        min_length=2,
        max_length=500,
    )
    max_results: int = Field(
        50,
        description="Maximum number of papers to retrieve from Europe PMC",
        ge=1,
        le=1000,
    )


class PipelineStatusResponse(BaseModel):
    status: str
    query: Optional[str] = None
    started_at: Optional[str] = None
    finished_at: Optional[str] = None
    error: Optional[str] = None
    output_files: Dict[str, str] = Field(default_factory=dict)


class GraphDataResponse(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]


class StatsResponse(BaseModel):
    query: str
    timestamp: Optional[str] = None
    total_nodes: int
    total_edges: int
    unique_relations: int
    nodes_by_type: Dict[str, int]
    relations_distribution: Dict[str, int]
