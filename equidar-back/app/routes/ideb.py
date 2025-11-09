from fastapi import APIRouter, HTTPException
from app.services.ideb import IDEBService
from app.models import SchoolPerformanceReport, MunicipalityPerformanceReport
from typing import List, Dict

router = APIRouter(prefix="/ideb", tags=["IDEB"])

# Inicializa o serviço (ajuste o caminho conforme necessário)
ideb_service = IDEBService("data/IDEB_ANOS_INICIAIS_PB.csv")

@router.get("/school/{school_id}", response_model=SchoolPerformanceReport)
async def get_school_performance(school_id: str):
    """
    Retorna relatório completo de performance de uma escola
    """
    report = ideb_service.get_school_performance_report(school_id)
    if not report:
        raise HTTPException(status_code=404, detail="Escola não encontrada")
    return report

@router.get("/municipality/{municipality_code}", response_model=MunicipalityPerformanceReport)
async def get_municipality_performance(municipality_code: str):
    """
    Retorna relatório consolidado de performance de um município
    """
    report = ideb_service.get_municipality_performance_report(municipality_code)
    if not report:
        raise HTTPException(status_code=404, detail="Município não encontrado")
    return report

@router.get("/municipality/{municipality_code}/schools", response_model=List[Dict])
async def list_municipality_schools(municipality_code: str):
    """
    Lista todas as escolas de um município
    """
    schools = ideb_service.list_schools_by_municipality(municipality_code)
    if not schools:
        raise HTTPException(status_code=404, detail="Nenhuma escola encontrada para este município")
    return schools