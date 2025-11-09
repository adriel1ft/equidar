from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from app.deps import get_municipality_service
from app.models import MunicipalityOut

router = APIRouter(prefix="/municipalities", tags=["municipalities"])

@router.get("", response_model=List[MunicipalityOut])
def list_municipalities(
    state: Optional[str] = Query(None, description="UF code (e.g., PB)"),
    q: Optional[str] = Query(None, description="Search by name or id"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    svc = Depends(get_municipality_service),
):
    return [m.model_dump() for m in svc.list(state, q, limit, offset)]

@router.get("/{municipality_id}", response_model=MunicipalityOut)
def get_municipality(municipality_id: str, svc = Depends(get_municipality_service)):
    m = svc.get(municipality_id)
    if not m:
        raise HTTPException(status_code=404, detail="Municipality not found")
    return m

@router.get("/polygons/{municipality_id}")
def get_municipality_polygon(municipality_id: str, svc = Depends(get_municipality_service)):
    polygon = svc.get_polygon(municipality_id)
    if not polygon:
        raise HTTPException(status_code=404, detail="Municipality polygon not found")
    return polygon