import os
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.services.results_loader import RESULTS_DIR, load_result_json

router = APIRouter(tags=["Repurposing", "Signals"])

_DEFAULT_SIGNALS = [
    {
        "id": "sig-metformin-alzheimers",
        "title": "Metformin -> Alzheimer's Disease",
        "drugId": "drug-metformin",
        "diseaseId": "disease-alzheimers",
        "drug": {"id": "drug-metformin", "name": "Metformin", "genericName": "Metformin Hydrochloride"},
        "disease": {"id": "disease-alzheimers", "name": "Alzheimer's Disease"},
        "signalScore": 89,
        "signal_score": 89,
        "novelty": "High",
        "connectionType": "inferred",
        "connection_type": "inferred",
        "explanation": "Metformin modulates mitochondrial respiratory chain Complex I, activating AMPK pathways that attenuate tau hyperphosphorylation and neuroinflammation.",
        "mechanisms": ["AMPK Activation", "mTOR Downregulation", "Mitochondrial Complex I Inhibition"],
    },
    {
        "id": "sig-atorvastatin-pulmonary-fibrosis",
        "title": "Atorvastatin -> Pulmonary Fibrosis",
        "drugId": "drug-atorvastatin",
        "diseaseId": "disease-pulmonary-fibrosis",
        "drug": {"id": "drug-atorvastatin", "name": "Atorvastatin", "genericName": "Atorvastatin Calcium"},
        "disease": {"id": "disease-pulmonary-fibrosis", "name": "Pulmonary Fibrosis"},
        "signalScore": 84,
        "signal_score": 84,
        "novelty": "High",
        "connectionType": "inferred",
        "connection_type": "inferred",
        "explanation": "HMG-CoA reductase inhibition decreases RhoA/ROCK signaling and downregulates TGF-beta-mediated fibroblastic differentiation in lung parenchyma.",
        "mechanisms": ["RhoA/ROCK Inhibition", "TGF-beta Suppression", "Antioxidant Signaling"],
    },
    {
        "id": "sig-losartan-heart-failure",
        "title": "Losartan -> Heart Failure with PEF",
        "drugId": "drug-losartan",
        "diseaseId": "disease-heart-failure",
        "drug": {"id": "drug-losartan", "name": "Losartan", "genericName": "Losartan Potassium"},
        "disease": {"id": "disease-heart-failure", "name": "Heart Failure with Preserved Ejection Fraction"},
        "signalScore": 82,
        "signal_score": 82,
        "novelty": "Medium",
        "connectionType": "inferred",
        "connection_type": "inferred",
        "explanation": "Angiotensin II receptor antagonism attenuates myocardial interstitial fibrosis and preserves left ventricular diastolic compliance.",
        "mechanisms": ["AT1 Receptor Blockade", "Antifibrotic Remodeling", "Hemodynamic Optimization"],
    },
    {
        "id": "sig-propranolol-hemangioma",
        "title": "Propranolol -> Infantile Hemangioma",
        "drugId": "drug-propranolol",
        "diseaseId": "disease-hemangioma",
        "drug": {"id": "drug-propranolol", "name": "Propranolol", "genericName": "Propranolol Hydrochloride"},
        "disease": {"id": "disease-hemangioma", "name": "Infantile Hemangioma"},
        "signalScore": 98,
        "signal_score": 98,
        "novelty": "Known",
        "connectionType": "established",
        "connection_type": "established",
        "explanation": "Non-selective beta-blockade induces endothelial vasoconstriction, downregulates VEGF and bFGF angiogenic cascades, and promotes pericyte apoptosis.",
        "mechanisms": ["Beta-2 Receptor Downregulation", "VEGF/bFGF Suppression", "Apoptotic Triggering"],
    },
]


@router.get("/signals/recent")
async def get_recent_signals():
    """Card 1: Newly detected research signals banner."""
    try:
        opp_path = os.path.join(RESULTS_DIR, "repurposing_opportunities.json")
        if os.path.isfile(opp_path):
            opps = load_result_json("repurposing_opportunities.json")
            signals = []
            for item in opps[:4]:
                signals.append({
                    "title": f"{item['drug']} -> {item['disease']}",
                    "drug": item["drug"],
                    "disease": item["disease"],
                    "signal_score": item["signal_score"],
                    "novelty": item["novelty"],
                    "connection_type": item["connection_type"],
                })
            return JSONResponse(content={"signals": signals})
    except Exception:
        pass

    return JSONResponse(content={"signals": [
        {"title": s["title"], "drug": s["drug"]["name"], "disease": s["disease"]["name"], "signal_score": s["signal_score"], "novelty": s["novelty"]}
        for s in _DEFAULT_SIGNALS
    ]})


@router.get("/signals")
async def list_signals():
    """List repurposing signals."""
    return JSONResponse(content={
        "items": _DEFAULT_SIGNALS,
        "total": len(_DEFAULT_SIGNALS),
        "page": 1,
        "pageSize": 20,
        "totalPages": 1,
    })


@router.get("/signals/{signal_id}")
async def get_signal_by_id(signal_id: str):
    """Retrieve detailed signal by ID."""
    for s in _DEFAULT_SIGNALS:
        if s["id"] == signal_id or signal_id.lower() in s["id"].lower():
            return JSONResponse(content=s)
    # Return first or formatted fallback
    fallback = dict(_DEFAULT_SIGNALS[0])
    fallback["id"] = signal_id
    return JSONResponse(content=fallback)
