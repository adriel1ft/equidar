from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.deps import load_data, init_services
from app.routes import municipalities, scores, agents, ideb

@asynccontextmanager
async def lifespan(app: FastAPI):
    items = load_data()
    init_services(items)
    yield
    # teardown (if needed)

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
    openapi_tags=[
        {"name": "municipalities", "description": "Read municipality data"},
        {"name": "scores", "description": "Compute composite scores from municipality data"},
        {"name": "agents", "description": "LLM agent backed by municipality context"},
        {"name": "IDEB", "description": "IDEB school and municipality performance reports"},
    ],
)

if settings.cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(municipalities.router)
app.include_router(scores.router)
app.include_router(agents.router)
app.include_router(ideb.router)

@app.get("/healthz", tags=["misc"])
def healthz():
    return {"status": "ok"}
