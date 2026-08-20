import os
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from app.services.results_loader import PIPELINE_CACHE_DIR, RESULTS_DIR

router = APIRouter(tags=["Literature"])


@router.get("/papers")
async def get_relevant_papers(
    category: str = Query("all", description="Filter by: all | supporting | contradicting | clinical"),
):
    """
    Card 8: Filterable Relevant Research Papers.
    Returns categorized papers with journal, year, DOI, and evidence status.
    """
    cache_path = os.path.join(PIPELINE_CACHE_DIR, "papers.csv")
    evidence_path = os.path.join(RESULTS_DIR, "evidence_mapping.csv")

    if not os.path.isfile(cache_path) and not os.path.isfile(evidence_path):
        raise HTTPException(status_code=404, detail="No papers available. Run pipeline first.")

    import pandas as pd
    papers = []

    if os.path.isfile(evidence_path):
        df_ev = pd.read_csv(evidence_path).fillna("")
        for idx, row in df_ev.iterrows():
            title = row.get("title", "")
            if not title:
                continue

            rel = str(row.get("relation", "")).lower()
            if "inhibits" in rel or "causes" in rel or "adverse" in rel:
                cat = "contradicting"
            elif "clinical" in title.lower() or "trial" in title.lower():
                cat = "clinical"
            else:
                cat = "supporting"

            year = str(row.get("publication_date", "2024"))[:4]
            papers.append({
                "paper_id": row.get("paper_id", f"P_{idx}"),
                "title": title,
                "publication_year": year,
                "journal": row.get("journal", "Biomedical Literature"),
                "doi": row.get("doi", ""),
                "pmid": row.get("pmid", ""),
                "category": cat,
                "evidence_snippet": row.get("evidence_text", ""),
            })

    cat_filter = category.lower().strip()
    if cat_filter != "all":
        papers = [p for p in papers if p["category"] == cat_filter]

    return JSONResponse(content={"papers": papers, "filter": cat_filter, "total": len(papers)})
