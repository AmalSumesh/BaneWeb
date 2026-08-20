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

    if os.path.isfile(evidence_path) and os.path.getsize(evidence_path) > 5:
        try:
            df_ev = pd.read_csv(evidence_path).fillna("")
            if not df_ev.empty:
                for idx, row in df_ev.iterrows():
                    title = row.get("title", "")
                    if not title:
                        continue

                    rel = str(row.get("relation", "")).lower()
                    if "inhibits" in rel or "causes" in rel or "adverse" in rel:
                        cat = "contradicting"
                    elif "clinical" in str(title).lower() or "trial" in str(title).lower():
                        cat = "clinical"
                    else:
                        cat = "supporting"

                    year = str(row.get("publication_date", "2024"))[:4]
                    papers.append({
                        "paper_id": str(row.get("paper_id", f"P_{idx}")),
                        "title": str(title),
                        "publication_year": year,
                        "journal": str(row.get("journal", "Biomedical Literature")),
                        "doi": str(row.get("doi", "")),
                        "pmid": str(row.get("pmid", "")),
                        "category": cat,
                        "evidence_snippet": str(row.get("evidence_text", "")),
                    })
        except Exception:
            papers = []

    # Fallback to papers.csv in cache if evidence_mapping has no records
    if not papers and os.path.isfile(cache_path) and os.path.getsize(cache_path) > 5:
        try:
            df_papers = pd.read_csv(cache_path).fillna("")
            if not df_papers.empty:
                for idx, row in df_papers.iterrows():
                    title = row.get("title", "")
                    if not title:
                        continue
                    abstract = str(row.get("abstract", ""))
                    cat = "clinical" if ("clinical" in str(title).lower() or "trial" in str(title).lower()) else "supporting"
                    year = str(row.get("publication_date", "2024"))[:4]
                    papers.append({
                        "paper_id": str(row.get("paper_id", f"P_{idx}")),
                        "title": str(title),
                        "publication_year": year,
                        "journal": str(row.get("journal", "Biomedical Literature")),
                        "doi": str(row.get("doi", "")),
                        "pmid": str(row.get("pmid", "")),
                        "category": cat,
                        "evidence_snippet": abstract[:250] + "..." if len(abstract) > 250 else abstract,
                    })
        except Exception:
            pass

    cat_filter = category.lower().strip()
    if cat_filter != "all":
        papers = [p for p in papers if p["category"] == cat_filter]

    return JSONResponse(content={"papers": papers, "filter": cat_filter, "total": len(papers)})
