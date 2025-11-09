import pandas as pd
import numpy as np
from typing import Optional, Tuple

def _normalize(s: str) -> str:
    import unicodedata, re
    s = (s or "").strip().lower()
    s = unicodedata.normalize("NFKD", s)
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = re.sub(r"\s+", " ", s)
    return s

def _pick(df: pd.DataFrame, candidates) -> Optional[str]:
    lower = {c.lower(): c for c in df.columns}
    for c in candidates:
        if c in df.columns:
            return c
        if c.lower() in lower:
            return lower[c.lower()]
    return None

class InfraService:
    """
    Carrega infraestrutura FUND e MED e expõe tabela unificada por escola:
      [ID_ESCOLA, escola, municipio, municipio_norm, score_fund, score_med, score_infraestrutura]
    """
    def __init__(self, csv_fund: str, csv_med: str):
        self.df_fund = self._load_one(csv_fund, nivel="FUND")
        self.df_med  = self._load_one(csv_med,  nivel="MED")
        self.df_merged = self._merge_levels(self.df_fund, self.df_med)

    def _load_one(self, path: str, nivel: str) -> pd.DataFrame:
        df = pd.read_csv(path, dtype={"ID_ESCOLA": str}, low_memory=False)
        # tenta achar nomes comuns
        id_col   = _pick(df, ["ID_ESCOLA", "CO_ENTIDADE"]) or "ID_ESCOLA"
        esc_col  = _pick(df, ["NO_ESCOLA", "NO_ENTIDADE", "NO_ESCOLA"]) or "NO_ENTIDADE"
        mun_col  = _pick(df, ["NO_MUNICIPIO", "MUNICIPIO", "NO_MUNIC"]) or "NO_MUNICIPIO"
        scorecol = _pick(df, ["score_infraestrutura", "SCORE_INFRA", "SCORE"]) or "score_infraestrutura"

        # se não existir score, deixe NaN (ou calcule aqui com sua função de métricas)
        if scorecol not in df.columns:
            df[scorecol] = np.nan

        out = df[[id_col, esc_col, mun_col, scorecol]].copy()
        out.columns = ["ID_ESCOLA", "escola", "municipio", f"score_{nivel.lower()}"]
        out["municipio_norm"] = out["municipio"].map(_normalize)
        out["ID_ESCOLA"] = out["ID_ESCOLA"].astype(str)
        return out

    def _merge_levels(self, fund: pd.DataFrame, med: pd.DataFrame) -> pd.DataFrame:
        # junta por ID_ESCOLA (preferindo nomes não nulos)
        m = pd.merge(
            fund.drop_duplicates("ID_ESCOLA"),
            med.drop_duplicates("ID_ESCOLA"),
            on="ID_ESCOLA",
            how="outer",
            suffixes=("_fund", "_med"),
        )
        # escolhe nome da escola/municipio
        m["escola"] = m["escola_fund"].combine_first(m["escola_med"])
        m["municipio"] = m["municipio_fund"].combine_first(m["municipio_med"])
        m["municipio_norm"] = m["municipio_norm_fund"].combine_first(m["municipio_norm_med"])
        m["score_fund"] = m["score_fund"]
        m["score_med"]  = m["score_med"]

        # score combinado (preferir FUND se existir, senão MED; ou média dos dois se ambos existirem)
        m["score_infraestrutura"] = np.where(
            m["score_fund"].notna() & m["score_med"].notna(),
            (m["score_fund"] + m["score_med"]) / 2.0,
            m["score_fund"].combine_first(m["score_med"])
        )
        cols = ["ID_ESCOLA", "escola", "municipio", "municipio_norm", "score_fund", "score_med", "score_infraestrutura"]
        return m[cols]
