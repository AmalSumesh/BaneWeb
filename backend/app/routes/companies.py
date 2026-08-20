from fastapi import APIRouter
from app.services.companies_service import fetch_nearby_pharmaceutical_companies

router = APIRouter(tags=["Companies"])


@router.get("/pharmaceutical-companies/nearby")
def pharmaceutical_companies_nearby_endpoint(
    latitude: float,
    longitude: float,
    radius: float = 10000.0,
):
    """Fetch nearby pharmaceutical companies using Google Places."""
    return fetch_nearby_pharmaceutical_companies(
        latitude=latitude,
        longitude=longitude,
        radius=radius,
    )
