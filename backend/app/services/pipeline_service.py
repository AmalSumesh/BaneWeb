import os
import sys
import logging
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Dict, Optional

# Ensure backend root is in sys.path so modules like pipeline, ingestion, nlp, repurposing can be imported
BACKEND_DIR = str(Path(__file__).resolve().parent.parent.parent)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

logger = logging.getLogger(__name__)


class RunStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


_pipeline = None

_run_state: Dict[str, Any] = {
    "status": RunStatus.IDLE,
    "query": None,
    "started_at": None,
    "finished_at": None,
    "error": None,
    "output_files": {},
}


def get_pipeline_state() -> Dict[str, Any]:
    """Return the current pipeline state."""
    return _run_state


def is_pipeline_running() -> bool:
    """Check if a pipeline run is in progress."""
    return _run_state.get("status") == RunStatus.RUNNING


def set_pipeline_running(query: str) -> None:
    """Set the pipeline state to running for a query."""
    global _run_state
    _run_state = {
        "status": RunStatus.RUNNING,
        "query": query,
        "started_at": datetime.now().isoformat(),
        "finished_at": None,
        "error": None,
        "output_files": {},
    }


def get_pipeline_instance():
    """Lazily initialise the pipeline (heavy – loads ML models)."""
    global _pipeline
    if _pipeline is None:
        from pipeline import DrugRepurposingPipeline  # heavy import
        from app.services.results_loader import RESULTS_DIR
        _pipeline = DrugRepurposingPipeline(output_dir=RESULTS_DIR)
        logger.info("DrugRepurposingPipeline initialised successfully")
    return _pipeline


def run_pipeline_sync(query: str, max_results: int) -> None:
    """
    Synchronous pipeline execution executed inside a background thread.
    Updates the global _run_state dict.
    """
    global _run_state
    try:
        pipe = get_pipeline_instance()
        output_files = pipe.run(query=query, max_results=max_results)
        _run_state.update(
            {
                "status": RunStatus.COMPLETED,
                "finished_at": datetime.now().isoformat(),
                "output_files": output_files or {},
                "error": None,
            }
        )
        logger.info("Pipeline run completed successfully")
    except Exception as exc:
        _run_state.update(
            {
                "status": RunStatus.FAILED,
                "finished_at": datetime.now().isoformat(),
                "error": str(exc),
            }
        )
        logger.error(f"Pipeline run failed: {exc}")
