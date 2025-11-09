from typing import List, Optional
from app.models import School

class SchoolsService:
    def __init__(self, items: List[School]):
        self.items = items

    def list(self, q: Optional[str], limit: int, offset: int) -> List[School]:
        data = self.items
        if q:
            ql = q.lower()
            data = [s for s in data if ql in s.name.lower() or ql in s.id.lower()]
        return data[offset: offset + limit]

    def get(self, school_id: str) -> School | None:
        return next((s for s in self.items if s.id == school_id), None)
    
    async def get_additional_info(self, school_id: int) -> dict | None:
        school = self.get(school_id)
        if school:
            # Simulate an async operation, e.g., fetching from a database
            return school.additional_info
        return None