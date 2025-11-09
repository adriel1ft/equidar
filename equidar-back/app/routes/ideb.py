# app/routes/ideb.py
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Optional
from app.services.ideb import IDEBService

router = APIRouter(prefix="/ideb", tags=["IDEB"])

ideb_service = IDEBService(
    "data/IDEB_ANOS_INICIAIS_PB.csv",
    "data/IDEB_ANOS_FINAIS_PB.csv",
    "data/IDEB_ENSINO_MEDIO_PB.csv",
)

@router.get("/municipios/{cidade}/escolas")
def listar_escolas_por_cidade(cidade: str) -> List[Dict]:
    escolas = ideb_service.list_schools_by_city(cidade)
    if not escolas:
        raise HTTPException(status_code=404, detail=f"Nenhuma escola encontrada para '{cidade}'.")
    return escolas

@router.get("/municipios/{cidade}/ideb")
def ideb_por_cidade(
    cidade: str,
    ano: Optional[int] = Query(default=None, description="Filtrar por ano"),
) -> List[Dict]:
    data = ideb_service.ideb_by_city(cidade, ano=ano)
    if not data:
        raise HTTPException(status_code=404, detail=f"Não encontrei IDEB para '{cidade}'.")
    return data
