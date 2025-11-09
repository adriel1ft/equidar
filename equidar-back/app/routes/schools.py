from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from app.deps import get_schools_service
from app.models import SchoolsOut

router = APIRouter(prefix="/schools", tags=["schools"])

# / schools/school_id/additional_info
@router.get("/{school_id}/additional_info", response_model=SchoolsOut)
async def get_school_additional_info(
    school_id: int,
    schools_service=Depends(get_schools_service)
):
    school_info = await schools_service.get_additional_info(school_id)
    if not school_info:
        raise HTTPException(status_code=404, detail="School not found")
    return school_info
    