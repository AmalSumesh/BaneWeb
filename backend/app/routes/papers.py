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

    # Pre-load paper metadata from papers.csv for rich abstract snippets and journal names
    paper_meta = {}
    if os.path.isfile(cache_path) and os.path.getsize(cache_path) > 5:
        try:
            df_cache = pd.read_csv(cache_path).fillna("")
            for _, p_row in df_cache.iterrows():
                pid = str(p_row.get("paper_id", "")).strip()
                if pid:
                    paper_meta[pid] = p_row.to_dict()
        except Exception:
            pass

    if os.path.isfile(evidence_path) and os.path.getsize(evidence_path) > 5:
        try:
            df_ev = pd.read_csv(evidence_path).fillna("")
            seen_paper_keys = set()
            if not df_ev.empty:
                for idx, row in df_ev.iterrows():
                    title = str(row.get("title", "")).strip()
                    pid = str(row.get("paper_id", f"P_{idx}")).strip()
                    meta = paper_meta.get(pid, {})
                    
                    if not title:
                        title = meta.get("title", f"Biomedical Research Document #{idx + 1}")

                    # Deduplicate papers by paper_id or title
                    dedup_key = pid if (pid and not pid.startswith("P_")) else title.lower().strip()
                    if dedup_key in seen_paper_keys:
                        continue
                    seen_paper_keys.add(dedup_key)

                    title_lower = title.lower()
                    rel = str(row.get("relation", "")).lower()
                    snippet = str(row.get("evidence_text", "")).strip()
                    if not snippet:
                        abstract = str(meta.get("abstract", "")).strip()
                        snippet = abstract[:280] + "..." if len(abstract) > 280 else abstract
                    if not snippet:
                        snippet = f"Documented biomedical association with {title}."

                    snippet_lower = snippet.lower()

                    # Smart categorization:
                    # 1. Clinical trial keywords in title or snippet
                    # 2. Adverse / toxic / causative disease relations -> contradicting / safety
                    # 3. Therapeutic / efficacy / biological target modulation -> supporting
                    if any(k in title_lower or k in snippet_lower for k in ["clinical trial", "trial", "randomised", "randomized", "placebo-controlled", "phase 1", "phase 2", "phase 3", "phase i", "phase ii", "phase iii"]):
                        cat = "clinical"
                    elif any(k in rel or k in title_lower for k in ["causes", "toxicity", "adverse", "injury", "poisoning", "anaphylaxis", "damage", "death"]):
                        cat = "contradicting"
                    else:
                        cat = "supporting"

                    # Determine publication date / year
                    raw_date = str(row.get("publication_date") or meta.get("publication_date") or "2024")
                    year = raw_date[:4] if len(raw_date) >= 4 and raw_date[:4].isdigit() else "2024"

                    # Determine journal
                    journal = str(row.get("journal") or meta.get("journal") or "Biomedical Literature")

                    doi = str(row.get("doi") or meta.get("doi") or "")
                    pmid = str(row.get("pmid") or meta.get("pmid") or "")

                    papers.append({
                        # CamelCase for TypeScript PipelinePaper interface
                        "paperId": pid,
                        "title": str(title),
                        "publicationYear": year,
                        "journal": journal,
                        "doi": doi,
                        "pmid": pmid,
                        "category": cat,
                        "evidenceSnippet": snippet,

                        # Snake_case for backwards compatibility
                        "paper_id": pid,
                        "publication_date": raw_date,
                        "publication_year": year,
                        "evidence_snippet": snippet,
                        "evidence_text": snippet,
                    })
        except Exception:
            papers = []

    # Fallback to papers.csv in cache if evidence_mapping has no records
    if not papers and paper_meta:
        for idx, (pid, p_row) in enumerate(paper_meta.items()):
            title = p_row.get("title", "")
            if not title:
                continue
            abstract = str(p_row.get("abstract", "")).strip()
            cat = "clinical" if ("clinical" in str(title).lower() or "trial" in str(title).lower()) else "supporting"
            raw_date = str(p_row.get("publication_date", "2024"))
            year = raw_date[:4] if len(raw_date) >= 4 and raw_date[:4].isdigit() else "2024"
            snippet = abstract[:280] + "..." if len(abstract) > 280 else (abstract or str(title))

            papers.append({
                "paperId": pid or f"P_{idx}",
                "title": str(title),
                "publicationYear": year,
                "journal": str(p_row.get("journal", "Biomedical Literature")),
                "doi": str(p_row.get("doi", "")),
                "pmid": str(p_row.get("pmid", "")),
                "category": cat,
                "evidenceSnippet": snippet,

                "paper_id": pid or f"P_{idx}",
                "publication_date": raw_date,
                "publication_year": year,
                "evidence_snippet": snippet,
                "evidence_text": snippet,
            })

    cat_filter = category.lower().strip()
    if cat_filter != "all":
        papers = [p for p in papers if p["category"] == cat_filter]

    return JSONResponse(content={"papers": papers, "filter": cat_filter, "total": len(papers)})
