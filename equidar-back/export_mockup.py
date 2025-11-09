#!/usr/bin/env python
# -*- coding: utf-8 -*-
import argparse
import sys
import requests
import pandas as pd
import numpy as np
from urllib.parse import quote

def fetch_json(url):
    try:
        r = requests.get(url, timeout=60)
        if r.status_code == 200:
            return r.json()
        else:
            return {"__error__": f"HTTP {r.status_code}: {r.text[:200]}"}
    except Exception as e:
        return {"__error__": str(e)}

def try_integrated(base_url, city):
    url = f"{base_url}/municipios/{quote(city)}/indicadores"
    data = fetch_json(url)
    if isinstance(data, dict) and "__error__" in data:
        return None, data["__error__"]
    if isinstance(data, dict) and "detail" in data:
        return None, data["detail"]
    if not isinstance(data, list):
        return None, f"Unexpected response for {url}: {data}"
    rows = []
    for item in data:
        rows.append({
            "cidade": city,
            "id_escola": item.get("id_escola"),
            "escola": item.get("escola"),
            "score_infraestrutura": item.get("score_infraestrutura"),
            "nota_ideb_media": item.get("nota_ideb_media"),
            "indice_geral": item.get("indice_geral")
        })
    df_escolas = pd.DataFrame(rows)
    return df_escolas, None

def try_separate(base_url, city):
    url_infra = f"{base_url}/infra/municipios/{quote(city)}"
    url_ideb  = f"{base_url}/ideb/municipios/{quote(city)}/ideb"
    infra = fetch_json(url_infra)
    ideb  = fetch_json(url_ideb)

    if isinstance(infra, dict) and "__error__" in infra:
        return None, f"[infra] {infra['__error__']}"
    if isinstance(infra, dict) and "detail" in infra:
        return None, f"[infra] {infra['detail']}"
    if isinstance(ideb, dict) and "__error__" in ideb:
        return None, f"[ideb] {ideb['__error__']}"
    if isinstance(ideb, dict) and "detail" in ideb:
        return None, f"[ideb] {ideb['detail']}"

    df_infra = pd.DataFrame(infra)
    if "id_escola" in df_infra.columns:
        df_infra["id_escola"] = df_infra["id_escola"].astype(str)

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

    df_ideb = pd.DataFrame(ideb)
    if "id_escola" in df_ideb.columns:
        df_ideb["id_escola"] = df_ideb["id_escola"].astype(str)
    if "ideb" in df_ideb.columns:
        df_ideb["nota_ideb_media"] = df_ideb["ideb"].apply(media_ideb)
    else:
        df_ideb["nota_ideb_media"] = np.nan

    df = pd.merge(
        df_ideb[["id_escola", "escola", "nota_ideb_media"]],
        df_infra[["id_escola", "score_infraestrutura"]],
        on="id_escola", how="outer"
    )
    df["cidade"] = city
    df["indice_geral"] = df[["nota_ideb_media", "score_infraestrutura"]].mean(axis=1, skipna=True)
    return df[["cidade", "id_escola", "escola", "score_infraestrutura", "nota_ideb_media", "indice_geral"]], None

def main():
    ap = argparse.ArgumentParser(
        description="Exporta mockup (escolas por cidade, média infra e média ideb) para Excel."
    )
    ap.add_argument("--base-url", required=True,
                    help="Base URL do seu backend (ex.: http://127.0.0.1:8000)")
    ap.add_argument("--cities", nargs="+", required=True,
                    help='Lista de cidades (use aspas se houver espaço). Ex.: --cities "João Pessoa" "Campina Grande"')
    ap.add_argument("--out", default="indicadores_mockup.xlsx",
                    help="Nome do arquivo Excel de saída")
    args = ap.parse_args()

    all_rows, errors = [], []

    for city in args.cities:
        df, err = try_integrated(args.base_url, city)
        if df is None:
            df, err2 = try_separate(args.base_url, city)
            if df is None:
                errors.append(f"{city}: {err} | {err2}")
                continue
        all_rows.append(df)

    if not all_rows:
        print("Nenhum dado exportado.")
        if errors:
            print("Erros:")
            for e in errors:
                print(" -", e)
        sys.exit(2)

    df_escolas = pd.concat(all_rows, ignore_index=True)
    resumo = (
        df_escolas.groupby("cidade", dropna=False)
        .agg(
            media_score_infraestrutura=("score_infraestrutura", "mean"),
            media_nota_ideb=("nota_ideb_media", "mean"),
            n_escolas=("id_escola", "nunique")
        )
        .reset_index()
    )

    for c in ["score_infraestrutura", "nota_ideb_media", "indice_geral"]:
        if c in df_escolas.columns:
            df_escolas[c] = df_escolas[c].astype(float).round(2)
    for c in ["media_score_infraestrutura", "media_nota_ideb"]:
        if c in resumo.columns:
            resumo[c] = resumo[c].astype(float).round(2)

    out_path = args.out
    with pd.ExcelWriter(out_path, engine="xlsxwriter") as xw:
        df_escolas.to_excel(xw, sheet_name="escolas_por_cidade", index=False)
        resumo.to_excel(xw, sheet_name="resumo_cidades", index=False)

    print(f"✅ OK! Arquivo salvo: {out_path}")
    if errors:
        print("\n⚠️ Algumas cidades tiveram erros:")
        for e in errors:
            print(" -", e)

if __name__ == "__main__":
    main()