from typing import Optional
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

router = APIRouter(tags=["Clinical Trials"])

_DEFAULT_TRIALS = [
    {
        "id": "trial-metformin-1",
        "drugId": "drug-metformin",
        "diseaseId": "disease-alzheimers",
        "title": "Phase II Study of Metformin in Amnestic Mild Cognitive Impairment",
        "phase": "phase-2",
        "status": "active",
        "sampleSize": 120,
        "startDate": "2023-01-15",
        "createdAt": "2024-01-01T00:00:00Z",
    },
    {
        "id": "trial-metformin-2",
        "drugId": "drug-metformin",
        "diseaseId": "disease-pcos",
        "title": "Metformin Extended-Release in Insulin Resistance and Anovulatory Syndromes",
        "phase": "phase-3",
        "status": "completed",
        "sampleSize": 350,
        "startDate": "2021-08-10",
        "createdAt": "2024-01-01T00:00:00Z",
    },
    {
        "id": "trial-propranolol-1",
        "drugId": "drug-propranolol",
        "diseaseId": "disease-hemangioma",
        "title": "Oral Propranolol Treatment for Proliferating Infantile Hemangiomas",
        "phase": "phase-3",
        "status": "completed",
        "sampleSize": 460,
        "startDate": "2020-03-01",
        "createdAt": "2024-01-01T00:00:00Z",
    },
    {
        "id": "trial-atorvastatin-1",
        "drugId": "drug-atorvastatin",
        "diseaseId": "disease-pulmonary-fibrosis",
        "title": "Atorvastatin Attenuation of Fibrotic Markers in Interstitial Lung Pathology",
        "phase": "phase-2",
        "status": "recruiting",
        "sampleSize": 85,
        "startDate": "2023-09-01",
        "createdAt": "2024-01-01T00:00:00Z",
    },
]


@router.get("/trials")
async def get_trials(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    drug_id: Optional[str] = Query(None, alias="drugId"),
):
    """Retrieve clinical trials, optionally filtered by drugId."""
    items = _DEFAULT_TRIALS
    if drug_id:
        clean_drug = drug_id.lower()
        items = [t for t in items if clean_drug in t["drugId"].lower() or clean_drug in t["id"].lower()]

    start = (page - 1) * page_size
    paginated = items[start : start + page_size]

    return JSONResponse(content={
        "items": paginated,
        "total": len(items),
        "page": page,
        "pageSize": page_size,
        "totalPages": max(1, (len(items) + page_size - 1) // page_size),
    })
