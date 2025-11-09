# app/services/ideb.py
import pandas as pd
import numpy as np
from typing import List, Dict, Optional

def _normalize(s: str) -> str:
    import unicodedata, re
    s = (s or "").strip().lower()
    s = unicodedata.normalize("NFKD", s)
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = re.sub(r"\s+", " ", s)
    return s

class IDEBService:
    """
    Novo serviço: carrega EF1, EF2 e EM; unifica em formato longo:
      [ID_ESCOLA, NO_ESCOLA, NO_MUNICIPIO, municipio_norm, ensino, ano, nota_ideb]
    """
    def __init__(self,
                 csv_ef1: str,
                 csv_ef2: str,
                 csv_em: str):
        self.df_long = self._load_three(csv_ef1, csv_ef2, csv_em)
        # tabela de escolas única (ajuda no endpoint /municipios/{cidade}/escolas)
        self.df_escolas = (
            self.df_long[["ID_ESCOLA", "NO_ESCOLA", "NO_MUNICIPIO", "municipio_norm"]]
            .drop_duplicates()
            .rename(columns={"NO_ESCOLA": "escola", "NO_MUNICIPIO": "municipio"})
        )

    def _read_and_melt(self, path: str, ensino_label: str) -> pd.DataFrame:
        df = pd.read_csv(path, dtype={"ID_ESCOLA": str}, low_memory=False)
        df.replace(["-", ""], np.nan, inplace=True)

        # 2 formatos possíveis:
        # (A) largo: VL_OBSERVADO_2017, VL_OBSERVADO_2019, VL_OBSERVADO_2021
        wide_cols = [c for c in df.columns if str(c).startswith("VL_OBSERVADO_")]
        if wide_cols:
            melted = df.melt(
                id_vars=["ID_ESCOLA", "NO_ESCOLA", "NO_MUNICIPIO"],
                value_vars=wide_cols,
                var_name="metric",
                value_name="nota_ideb",
            )
            # extrai o ano do sufixo
            melted["ano"] = pd.to_numeric(
                melted["metric"].str.replace("VL_OBSERVADO_", "", regex=False),
                errors="coerce"
            ).astype("Int64")
            melted.drop(columns=["metric"], inplace=True)
        else:
            # (B) longo: VL_OBSERVADO + coluna de ano (AN_REFERENCIA/ANO/NU_ANO)
            ano_col = next((c for c in ["AN_REFERENCIA", "ANO", "NU_ANO"] if c in df.columns), None)
            if not ano_col:
                raise ValueError(f"Não encontrei coluna de ano em {path}")
            melted = df[["ID_ESCOLA", "NO_ESCOLA", "NO_MUNICIPIO", ano_col, "VL_OBSERVADO"]].copy()
            melted.rename(columns={ano_col: "ano", "VL_OBSERVADO": "nota_ideb"}, inplace=True)

        melted["ensino"] = ensino_label
        melted["municipio_norm"] = melted["NO_MUNICIPIO"].map(_normalize)
        # normalizações numéricas
        melted["ano"] = pd.to_numeric(melted["ano"], errors="coerce").astype("Int64")
        melted["nota_ideb"] = pd.to_numeric(melted["nota_ideb"], errors="coerce")
        return melted[["ID_ESCOLA", "NO_ESCOLA", "NO_MUNICIPIO", "municipio_norm", "ensino", "ano", "nota_ideb"]]

    def _load_three(self, ef1: str, ef2: str, em: str) -> pd.DataFrame:
        parts = [
            self._read_and_melt(ef1, "EF1"),
            self._read_and_melt(ef2, "EF2"),
            self._read_and_melt(em,  "EM"),
        ]
        return pd.concat(parts, ignore_index=True)

    # ---------- NOVOS MÉTODOS para endpoints por nome da cidade ----------

    def list_schools_by_city(self, city_name: str) -> List[Dict]:
        c = _normalize(city_name)
        sub = self.df_escolas[self.df_escolas["municipio_norm"] == c]
        return [
            {"id_escola": r.ID_ESCOLA, "escola": r.escola}
            for r in sub.sort_values("escola").itertuples(index=False)
        ]

    def ideb_by_city(self, city_name: str, ano: Optional[int] = None) -> List[Dict]:
        c = _normalize(city_name)
        df = self.df_long[self.df_long["municipio_norm"] == c].copy()
        if ano is not None:
            df = df[df["ano"] == ano]

        if df.empty:
            return []

        # Empacota {ensino: {ano: nota}}
        out = []
        for (id_escola, escola), g in df.groupby(["ID_ESCOLA", "NO_ESCOLA"]):
            ideb = {}
            for ens, gg in g.groupby("ensino"):
                ser = gg.dropna(subset=["ano"]).set_index("ano")["nota_ideb"].sort_index()
                ideb[ens] = {int(a): (None if pd.isna(v) else float(v)) for a, v in ser.items()}
            out.append({
                "id_escola": id_escola,
                "escola": escola,
                "ideb": ideb
            })
        return out