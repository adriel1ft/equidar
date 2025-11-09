# app/routers/infra.py
from fastapi import APIRouter, HTTPException
from typing import List, Dict
import pandas as pd

from app.services.infra import InfraService

routes = APIRouter(prefix="/infra", tags=["infra"])

# Ajuste os caminhos/EXTENSÕES dos seus arquivos de infra:
infra_service = InfraService(
    "data/PB_INFRAESTRUTURA_FUND_SCORE_2023.csv",  # coloque a extensão correta
    "data/PB_INFRAESTRUTURA_MED_SCORE_2023.csv",
)

def _normalize(s: str) -> str:
    import unicodedata, re
    s = (s or "").strip().lower()
    s = unicodedata.normalize("NFKD", s)
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = re.sub(r"\s+", " ", s)
    return s

@routes.get("/municipios/{cidade}")
def infra_por_cidade(cidade: str) -> List[Dict]:
    cidade_norm = _normalize(cidade)
    df = infra_service.df_merged
    sub = df[df["municipio_norm"] == cidade_norm].copy()
    if sub.empty:
        raise HTTPException(status_code=404, detail=f"Não encontrei infraestrutura para '{cidade}'.")

    sub = sub.sort_values(["score_infraestrutura", "escola"], ascending=[False, True])
    out: List[Dict] = []
    for r in sub.itertuples(index=False):
        out.append({
            "id_escola": r.ID_ESCOLA,
            "escola": r.escola,
            "municipio": r.municipio,
            "score_infraestrutura": None if pd.isna(r.score_infraestrutura) else float(r.score_infraestrutura),
            "scores_infra": {
                "FUND": None if pd.isna(r.score_fund) else float(r.score_fund),
                "MED":  None if pd.isna(r.score_med) else float(r.score_med),
            },
        })
    return out