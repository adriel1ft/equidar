from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Optional
import pandas as pd
import numpy as np

from app.services.ideb import IDEBService
from app.services.infra import InfraService

router = APIRouter(prefix="/municipios", tags=["Indicadores"])

ideb_service = IDEBService(
    "data/IDEB_ANOS_INICIAIS_PB.csv",
    "data/IDEB_ANOS_FINAIS_PB.csv",
    "data/IDEB_ENSINO_MEDIO_PB.csv",
)
infra_service = InfraService(
    "data/PB_INFRAESTRUTURA_FUND_SCORE_2023.csv",
    "data/PB_INFRAESTRUTURA_MED_SCORE_2023.csv",
)

@router.get("/{cidade}/indicadores")
def indicadores_por_cidade(
    cidade: str,
    ano: Optional[int] = Query(default=None, description="Filtrar IDEB por ano (opcional)")
) -> List[Dict]:
    # --- 1) IDEB: filtra por cidade e estrutura por escola (tem nome e município)
    ideb_list = ideb_service.ideb_by_city(cidade, ano=ano)
    if not ideb_list:
        raise HTTPException(status_code=404, detail=f"Não encontrei IDEB para '{cidade}'.")
    df_ideb = pd.DataFrame(ideb_list)
    df_ideb["id_escola"] = df_ideb["id_escola"].astype(str)

    # média do IDEB entre EF1, EF2, EM (considera os anos disponíveis)
    def media_ideb(ideb_dict):
        if not isinstance(ideb_dict, dict):
            return np.nan
        by_level = []
        for anos in ideb_dict.values():
            if isinstance(anos, dict):
                vals = [v for v in anos.values() if v is not None]
                if vals:
                    by_level.append(np.mean(vals))
        return float(np.mean(by_level)) if by_level else np.nan

    df_ideb["nota_ideb_media"] = df_ideb["ideb"].apply(media_ideb)

    # --- 2) INFRA: pega os scores por ID (sem nome/municipio) e junta
    df_infra = infra_service.df_merged.copy()
    df_infra["ID_ESCOLA"] = df_infra["ID_ESCOLA"].astype(str)

    merged = pd.merge(
        df_ideb,
        df_infra[["ID_ESCOLA", "score_fund", "score_med", "score_infraestrutura"]],
        left_on="id_escola",
        right_on="ID_ESCOLA",
        how="left"
    ).drop(columns=["ID_ESCOLA"])

    # --- 3) monta resposta
    out: List[Dict] = []
    for r in merged.itertuples(index=False):
        nota_media = None if pd.isna(r.nota_ideb_media) else float(r.nota_ideb_media)
        score_infra = None if pd.isna(r.score_infraestrutura) else float(r.score_infraestrutura)
        indice_geral = None
        if (nota_media is not None) and (score_infra is not None):
            indice_geral = float(np.mean([nota_media, score_infra]))

        out.append({
            "id_escola": r.id_escola,
            "escola": r.escola,
            "nota_ideb_media": None if nota_media is None else round(nota_media, 2),
            "score_infraestrutura": None if score_infra is None else round(score_infra, 2),
            "indice_geral": None if indice_geral is None else round(indice_geral, 2),
            "scores_infra": {
                "FUND": None if pd.isna(getattr(r, "score_fund", np.nan)) else round(float(getattr(r, "score_fund")), 2),
                "MED":  None if pd.isna(getattr(r, "score_med", np.nan)) else round(float(getattr(r, "score_med")), 2),
            },
            "ideb": r.ideb
        })

    # ordena pelo índice geral quando existir
    out.sort(key=lambda x: (-(x["indice_geral"] or -1e9), x["escola"] or ""))
    return out
