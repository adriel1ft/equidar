# app/routes/infra.py
from fastapi import APIRouter, HTTPException
from typing import List, Dict
import pandas as pd

from app.services.infra import InfraService
from app.services.ideb import IDEBService

routes = APIRouter(prefix="/infra", tags=["infra"])

infra_service = InfraService(
    "data/PB_INFRAESTRUTURA_FUND_SCORE_2023.csv",
    "data/PB_INFRAESTRUTURA_MED_SCORE_2023.csv",
)
ideb_service = IDEBService(
    "data/IDEB_ANOS_INICIAIS_PB.csv",
    "data/IDEB_ANOS_FINAIS_PB.csv",
    "data/IDEB_ENSINO_MEDIO_PB.csv",
)

@routes.get("/municipios/{cidade}")
def infra_por_cidade(cidade: str) -> List[Dict]:
    # 1) IDEB: traz as escolas da cidade (tem nome/municipio/id)
    escolas = ideb_service.ideb_by_city(cidade)  # [{id_escola, escola, ideb:{...}}, ...]
    if not escolas:
        raise HTTPException(status_code=404, detail=f"Não encontrei escolas IDEB para '{cidade}'.")
    df_escolas = pd.DataFrame(escolas)
    df_escolas["id_escola"] = df_escolas["id_escola"].astype(str)

    # 2) INFRA: só tem ID e scores; junta por ID
    df_infra = infra_service.df_merged.copy()
    df_infra["ID_ESCOLA"] = df_infra["ID_ESCOLA"].astype(str)

    merged = pd.merge(
        df_escolas[["id_escola", "escola"]],
        df_infra[["ID_ESCOLA", "score_fund", "score_med", "score_infraestrutura"]],
        left_on="id_escola", right_on="ID_ESCOLA", how="left"
    ).drop(columns=["ID_ESCOLA"])

    # 3) resposta
    out: List[Dict] = []
    for r in merged.itertuples(index=False):
        out.append({
            "id_escola": r.id_escola,
            "escola": r.escola,
            "score_infraestrutura": None if pd.isna(getattr(r, "score_infraestrutura")) else float(getattr(r, "score_infraestrutura")),
            "scores_infra": {
                "FUND": None if pd.isna(getattr(r, "score_fund")) else float(getattr(r, "score_fund")),
                "MED":  None if pd.isna(getattr(r, "score_med")) else float(getattr(r, "score_med")),
            },
        })
    return out
