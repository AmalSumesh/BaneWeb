import os
import json
from pathlib import Path
from typing import Any, Dict
from fastapi import HTTPException

# Base directories
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
RESULTS_DIR = str(BACKEND_DIR / "app" / "results")
PIPELINE_CACHE_DIR = str(BACKEND_DIR / "pipeline_cache")


def load_result_json(filename: str) -> Dict[str, Any]:
    """Load a JSON file from the results directory."""
    path = os.path.join(RESULTS_DIR, filename)
    if not os.path.isfile(path):
        raise HTTPException(
            status_code=404,
            detail=f"Result file '{filename}' not found. Run the pipeline first.",
        )
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_result_filepath(filename: str) -> str:
    """Get validated absolute path to a file in results directory."""
    safe_name = os.path.basename(filename)
    path = os.path.join(RESULTS_DIR, safe_name)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail=f"File '{safe_name}' not found.")
    return path
