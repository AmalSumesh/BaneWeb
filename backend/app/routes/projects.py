from fastapi import APIRouter
from fastapi.responses import JSONResponse

projects_router = APIRouter(prefix="/projects", tags=["Projects"])
saved_router = APIRouter(prefix="/saved", tags=["Saved"])
router = APIRouter(tags=["Projects"])


@projects_router.get("")
@projects_router.get("/")
async def list_projects():
    """List research projects."""
    return JSONResponse(content={
        "items": [
            {
                "id": "proj-1",
                "title": "Metformin Repurposing for Neurodegenerative Pathology",
                "description": "Exploration of AMPK signaling modulation and tau hyperphosphorylation inhibition in preclinical models.",
                "status": "active",
                "hypothesesCount": 3,
                "createdAt": "2024-01-10T00:00:00Z",
                "updatedAt": "2024-02-15T00:00:00Z",
            },
            {
                "id": "proj-2",
                "title": "Propranolol Vascular Remodeling Exploration",
                "description": "Mechanistic analysis of beta-2 receptor downregulation in infantile hemangioma endothelial cells.",
                "status": "active",
                "hypothesesCount": 2,
                "createdAt": "2024-01-12T00:00:00Z",
                "updatedAt": "2024-02-20T00:00:00Z",
            },
        ],
        "total": 2,
        "page": 1,
        "pageSize": 20,
        "totalPages": 1,
    })


@saved_router.get("")
@saved_router.get("/")
async def list_saved_items():
    """List bookmarked signals, papers, and compounds."""
    return JSONResponse(content={
        "items": [],
        "total": 0,
        "page": 1,
        "pageSize": 20,
        "totalPages": 1,
    })
