from typing import Optional, List
from app.models import Municipality

class MunicipalityService:
    def __init__(self, items: List[Municipality]):
        self.items = items

    def list(self, state: Optional[str], q: Optional[str], limit: int, offset: int) -> List[Municipality]:
        data = self.items
        if state:
            data = [m for m in data if m.state.lower() == state.lower()]
        if q:
            ql = q.lower()
            data = [m for m in data if ql in m.name.lower() or ql in m.id.lower()]
        return data[offset: offset + limit]

    def get(self, municipality_id: str) -> Municipality | None:
        return next((m for m in self.items if m.id == municipality_id), None)
    
    def get_polygon(self, municipality_id: str) -> dict | None:
        municipality = self.get(municipality_id)
        if municipality:
            return municipality.polygon
        return None
    
    def list_all(self) -> List[Municipality]:
        return self.items
