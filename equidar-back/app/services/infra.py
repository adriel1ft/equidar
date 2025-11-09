# app/services/infra.py
import pandas as pd
import numpy as np

class InfraService:
    """
    Lê infra FUND e MED por ID de escola e calcula um score combinado.
    Saída: df_merged com colunas:
      - ID_ESCOLA (str)
      - score_fund (float, opcional)
      - score_med (float, opcional)
      - score_infraestrutura (float, média entre fund/med se ambos existirem; senão o que houver)
    """
    def __init__(self, csv_fund: str, csv_med: str):
        self.df_fund = self._load_one(csv_fund, nivel="FUND")
        self.df_med  = self._load_one(csv_med,  nivel="MED")
        self.df_merged = self._merge_levels(self.df_fund, self.df_med)

    def _load_one(self, path: str, nivel: str) -> pd.DataFrame:
        df = pd.read_csv(path, dtype=str, low_memory=False)
        # padroniza nomes e remove coluna inútil
        cols = [c.strip() for c in df.columns]
        df.columns = cols
        if "Unnamed: 0" in df.columns:
            df = df.drop(columns=["Unnamed: 0"])

        # exige ID e tenta achar a coluna de score (nome já existe nos seus CSVs)
        if "ID_ESCOLA" not in df.columns:
            # tenta alternativas
            for alt in ["id_escola", "CO_ENTIDADE", "co_entidade"]:
                if alt in df.columns:
                    df["ID_ESCOLA"] = df[alt].astype(str)
                    break
        if "ID_ESCOLA" not in df.columns:
            raise ValueError(f"[{nivel}] coluna ID_ESCOLA não encontrada em {path}. Colunas: {list(df.columns)}")

        score_col = None
        for cand in ["score_infraestrutura", "score", "score_total"]:
            if cand in df.columns:
                score_col = cand
                break
        if score_col is None:
            # se não houver score pronto, cria vazio (ou calcule aqui caso queira)
            df["score_infraestrutura"] = np.nan
            score_col = "score_infraestrutura"

        out = df[["ID_ESCOLA", score_col]].copy()
        out.columns = ["ID_ESCOLA", f"score_{nivel.lower()}"]
        # força numérico
        out[f"score_{nivel.lower()}"] = pd.to_numeric(out[f"score_{nivel.lower()}"], errors="coerce")
        # garante string
        out["ID_ESCOLA"] = out["ID_ESCOLA"].astype(str)
        # 1 linha por escola (caso venham duplicadas)
        out = out.groupby("ID_ESCOLA", as_index=False).agg({f"score_{nivel.lower()}": "mean"})
        return out

    def _merge_levels(self, fund: pd.DataFrame, med: pd.DataFrame) -> pd.DataFrame:
        m = pd.merge(fund, med, on="ID_ESCOLA", how="outer")
        m["score_infraestrutura"] = m[["score_fund", "score_med"]].mean(axis=1, skipna=True)
        return m
