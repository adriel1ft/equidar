# app/routes/indicadores.py
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Optional
import pandas as pd
import numpy as np

from app.services.ideb import IDEBService
from app.services.infra import InfraService

router = APIRouter(prefix="/municipios", tags=["Indicadores"])

# Caminhos reais
ideb_service = IDEBService(
    "data/IDEB_ANOS_INICIAIS_PB.csv",
    "data/IDEB_ANOS_FINAIS_PB.csv",
    "data/IDEB_ENSINO_MEDIO_PB.csv",
)
infra_service = InfraService(
    "data/PB_INFRAESTRUTURA_FUND_SCORE_2023.csv",
    "data/PB_INFRAESTRUTURA_MED_SCORE_2023.csv",
)

def _normalize(s: str) -> str:
    import unicodedata, re
    s = (s or "").strip().lower()
    s = unicodedata.normalize("NFKD", s)
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = re.sub(r"\s+", " ", s)
    return s

@router.get("/{cidade}/indicadores")
def indicadores_por_cidade(
    cidade: str,
    ano: Optional[int] = Query(default=None, description="Filtrar IDEB por ano (opcional)")
) -> List[Dict]:
    cidade_norm = _normalize(cidade)

    # --- IDEB por escola ---
    ideb_list = ideb_service.ideb_by_city(cidade, ano=ano)
    if not ideb_list:
        raise HTTPException(status_code=404, detail=f"Não encontrei IDEB para '{cidade}'.")

    df_ideb = pd.DataFrame(ideb_list)

    # Média do IDEB entre EF1, EF2, EM (usando anos disponíveis)
    def media_ideb(ideb_dict):
        by_level = []
        for _, anos in ideb_dict.items():  # EF1/EF2/EM
            vals = [v for v in anos.values() if v is not None]
            if vals:
                by_level.append(np.mean(vals))
        return float(np.mean(by_level)) if by_level else None

    df_ideb["nota_ideb_media"] = df_ideb["ideb"].apply(media_ideb)

    # --- Infra por escola ---
    df_infra = infra_service.df_merged
    df_infra_city = df_infra[df_infra["municipio_norm"] == cidade_norm].copy()

    # Merge IDEB + Infra (por ID da escola)
    merged = df_ideb.merge(
        df_infra_city[["ID_ESCOLA", "score_fund", "score_med", "score_infraestrutura"]],
        left_on="id_escola",
        right_on="ID_ESCOLA",
        how="left"
    ).drop(columns=["ID_ESCOLA"])

    # Monta resposta: inclui índice geral (média de infra + ideb)
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
                "FUND": None if pd.isna(r.score_fund) else round(float(r.score_fund), 2),
                "MED":  None if pd.isna(r.score_med) else round(float(r.score_med), 2),
            },
            "ideb": r.ideb  # detalhes por ensino/ano
        })

    # Ordena por índice_geral (quando existir), senão por escola
    out.sort(key=lambda x: (-(x["indice_geral"] or -1e9), x["escola"]))
    return out