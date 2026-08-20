import os
import requests
from typing import Any, Dict
from fastapi import HTTPException

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
GOOGLE_PLACES_URL = "https://places.googleapis.com/v1/places:searchText"


def fetch_nearby_pharmaceutical_companies(
    latitude: float,
    longitude: float,
    radius: float = 10000.0,
) -> Dict[str, Any]:
    """Fetch nearby pharmaceutical companies using Google Places API."""
    api_key = os.getenv("GOOGLE_MAPS_API_KEY") or GOOGLE_MAPS_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_MAPS_API_KEY is not configured",
        )

    payload = {
        "textQuery": "pharmaceutical companies",
        "pageSize": 20,
        "rankPreference": "DISTANCE",
        "locationBias": {
            "circle": {
                "center": {
                    "latitude": latitude,
                    "longitude": longitude,
                },
                "radius": radius,
            }
        },
    }

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": (
            "places.id,"
            "places.displayName,"
            "places.formattedAddress,"
            "places.location,"
            "places.primaryType,"
            "places.types,"
            "places.websiteUri,"
            "places.googleMapsUri"
        ),
    }

    try:
        response = requests.post(
            GOOGLE_PLACES_URL,
            json=payload,
            headers=headers,
            timeout=15,
        )
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Google Places request failed: {exc}",
        )

    if not response.ok:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text,
        )

    data = response.json()
    companies = []

    for place in data.get("places", []):
        location = place.get("location", {})
        display_name = place.get("displayName", {})

        companies.append({
            "id": place.get("id"),
            "name": display_name.get("text", "Unnamed"),
            "address": place.get("formattedAddress"),
            "latitude": location.get("latitude"),
            "longitude": location.get("longitude"),
            "primary_type": place.get("primaryType"),
            "types": place.get("types", []),
            "website": place.get("websiteUri"),
            "google_maps_url": place.get("googleMapsUri"),
        })

    return {
        "count": len(companies),
        "companies": companies,
    }
