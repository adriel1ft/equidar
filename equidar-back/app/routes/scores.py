from fastapi import APIRouter, Depends, HTTPException
from app.deps import get_municipality_service, get_scoring_service
from app.models import ScoreParams, ScoreOut

router = APIRouter(prefix="/scores", tags=["scores"])

@router.get("/{municipality_id}", response_model=ScoreOut)
def compute_score(
    municipality_id: str,
    params: ScoreParams = Depends(),
    msvc = Depends(get_municipality_service),
    ssvc = Depends(get_scoring_service),
):
    m = msvc.get(municipality_id)
    if not m:
        raise HTTPException(status_code=404, detail="Municipality not found")
    return ssvc.score(m, params)
