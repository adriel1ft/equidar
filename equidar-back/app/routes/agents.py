from fastapi import APIRouter, Depends, HTTPException
from app.deps import get_municipality_service, get_agent_service
from app.models import AgentMessage, AgentResponse

router = APIRouter(prefix="/agents", tags=["agents"])

@router.post("/chat", response_model=AgentResponse)
async def chat(payload: AgentMessage, msvc = Depends(get_municipality_service), asvc = Depends(get_agent_service)):
    m = msvc.get(payload.municipality_id)
    if not m:
        raise HTTPException(status_code=404, detail="Municipality not found")
    return await asvc.chat(m, payload.message, payload.system_goal or "")
