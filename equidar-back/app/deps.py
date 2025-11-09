from pathlib import Path
import json
import geopandas as gpd
from fastapi import Depends
from app.config import settings
from app.models import Municipality
from app.services.municipalities import MunicipalityService
from app.services.scoring import ScoringService
from app.services.agent import AgentService
from app.llm.echo import EchoProvider

# Load data once at startup; keep it simple (in-memory).
def load_data() -> list[Municipality]:
    data_path = Path(settings.data_file)
    polygon_path = Path(settings.polygon_file)
    items = json.loads(data_path.read_text(encoding="utf-8"))
    gdf = gpd.read_file(polygon_path)
    polygons = {row["id"]: row["geometry"] for _, row in gdf.iterrows()}
    municipalities = [Municipality(**it) for it in items]
    for m in municipalities:
        m.polygon = polygons.get(m.id)
    return municipalities

# Singletons (created in main.py and injected here)
_municipality_service: MunicipalityService | None = None
_scoring_service: ScoringService | None = None
_agent_service: AgentService | None = None

def init_services(data_items: list[Municipality]) -> None:
    global _municipality_service, _scoring_service, _agent_service
    _municipality_service = MunicipalityService(data_items)
    _scoring_service = ScoringService()
    provider = EchoProvider()  # swap when you add another provider
    _agent_service = AgentService(provider)

def get_municipality_service() -> MunicipalityService:
    return _municipality_service  # type: ignore

def get_scoring_service() -> ScoringService:
    return _scoring_service  # type: ignore

def get_agent_service() -> AgentService:
    return _agent_service  # type: ignore
