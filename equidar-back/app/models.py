from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from enum import Enum

# Domain model
class Municipality(BaseModel):
    id: str
    name: str
    state: str
    population: int = Field(ge=0)
    internet_coverage_pct: Optional[float] = Field(ge=0, le=100)
    accessibility_index: Optional[float] = Field(ge=0, le=1)
    school_infrastructure_index: Optional[float] = Field(ge=0, le=1)
    revenue_per_capita: Optional[float] = None
    polygon: Optional[dict] = None

class MunicipalitySchool(BaseModel):
    # SG_UF,CO_MUNICIPIO,NO_MUNICIPIO,ID_ESCOLA,NO_ESCOLA,REDE,ORIGEM,CATEGORY
    sg_uf: str
    co_municipio: str
    no_municipio: str
    id_escola: str
    no_escola: str
    rede: str
    origem: str
    category: str

# IDEB domain models
class SchoolType(str, Enum):
    MUNICIPAL = "Municipal"
    ESTADUAL = "Estadual"
    PARTICULAR = "Particular"

class School(BaseModel):
    id_escola: str
    no_escola: str
    co_municipio: str
    no_municipio: str
    sg_uf: str
    rede: SchoolType
    
class IDEBData(BaseModel):
    id_escola: str
    no_escola: str
    co_municipio: str
    no_municipio: str
    rede: SchoolType
    
    # Indicadores de rendimento (aprovação)
    vl_indicador_rend_2017: Optional[float] = None
    vl_indicador_rend_2019: Optional[float] = None
    vl_indicador_rend_2021: Optional[float] = None
    
    # Notas de Matemática
    vl_nota_matematica_2017: Optional[float] = None
    vl_nota_matematica_2019: Optional[float] = None
    vl_nota_matematica_2021: Optional[float] = None
    
    # Notas de Português
    vl_nota_portugues_2017: Optional[float] = None
    vl_nota_portugues_2019: Optional[float] = None
    vl_nota_portugues_2021: Optional[float] = None
    
    # Notas Médias
    vl_nota_media_2017: Optional[float] = None
    vl_nota_media_2019: Optional[float] = None
    vl_nota_media_2021: Optional[float] = None
    
    # IDEB Observado
    vl_observado_2017: Optional[float] = None
    vl_observado_2019: Optional[float] = None
    vl_observado_2021: Optional[float] = None
    
    # IDEB Projeção
    vl_projecao_2017: Optional[float] = None
    vl_projecao_2019: Optional[float] = None
    vl_projecao_2021: Optional[float] = None
    
    # Resultado (diferença observado - projeção)
    resultado_2017: Optional[float] = None
    resultado_2019: Optional[float] = None
    resultado_2021: Optional[float] = None

class PerformanceAxis(str, Enum):
    RENDIMENTO = "rendimento"  # Aprovação
    MATEMATICA = "matematica"
    PORTUGUES = "portugues"
    IDEB_GERAL = "ideb_geral"

class AxisPerformance(BaseModel):
    axis: PerformanceAxis
    score_2017: Optional[float] = None
    score_2019: Optional[float] = None
    score_2021: Optional[float] = None
    trend: str  # "improving", "declining", "stable"
    normalized_score: Optional[float] = Field(default=None, ge=0, le=100)  # Score normalizado 0-100

class IDEBPerformanceIndex(BaseModel):
    ideb_2017: Optional[float] = None
    ideb_2019: Optional[float] = None
    ideb_2021: Optional[float] = None
    meta_2021: Optional[float] = None
    atingiu_meta: Optional[bool] = None
    distancia_meta: Optional[float] = None
    trend: str  # "improving", "declining", "stable"

class UpgradePriority(str, Enum):
    CRITICO = "crítico"
    ALTO = "alto"
    MEDIO = "médio"
    BAIXO = "baixo"

class UpgradePoint(BaseModel):
    area: str
    description: str
    priority: UpgradePriority
    current_score: Optional[float] = None
    target_score: Optional[float] = None
    impact_estimate: str  # Low, Medium, High

class SchoolPerformanceReport(BaseModel):
    school_id: str
    school_name: str
    municipality: str
    network_type: SchoolType
    
    # Performance por eixo
    axes_performance: List[AxisPerformance]
    
    # Índice geral IDEB
    ideb_index: IDEBPerformanceIndex
    
    # Pontos de melhoria priorizados
    upgrade_points: List[UpgradePoint]
    
    # Score geral consolidado
    overall_score: Optional[float] = Field(ge=0, le=100)
    overall_classification: str  # "Excelente", "Bom", "Regular", "Precisa Melhorar"

class MunicipalityPerformanceReport(BaseModel):
    municipality_id: str
    municipality_name: str
    total_schools: int
    
    # Médias municipais
    avg_ideb_2021: Optional[float] = None
    avg_matematica_2021: Optional[float] = None
    avg_portugues_2021: Optional[float] = None
    avg_rendimento_2021: Optional[float] = None
    
    # Distribuição de classificações
    schools_by_classification: Dict[str, int]
    
    # Top prioridades do município
    municipal_priorities: List[UpgradePoint]
    
    # Score consolidado municipal
    municipal_score: Optional[float] = Field(ge=0, le=100)

# API schemas existentes
class MunicipalityOut(Municipality):
    pass

class ScoreParams(BaseModel):
    w_internet: Optional[float] = Field(0.30, ge=0)
    w_access: Optional[float] = Field(0.25, ge=0)
    w_school: Optional[float] = Field(0.35, ge=0)
    w_equity_boost: Optional[float] = Field(0.10, ge=0)
    normalize: bool = True

class ScoreOut(BaseModel):
    municipality_id: str
    score: Optional[float]
    breakdown: Dict[str, float | dict]

class AgentMessage(BaseModel):
    municipality_id: str
    message: str
    system_goal: Optional[str] = "Assist with policy and planning insights using municipal data."

class AgentResponse(BaseModel):
    reply: str
    used_context_keys: List[str]

class AgentScoreExplanation(BaseModel):
    municipality_id: str
    score: Optional[float]
    explanation: str