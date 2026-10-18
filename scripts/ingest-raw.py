#!/usr/bin/env python3
"""Parse raw/ Meta, Google Ads, GA4 and Copart CSVs into src/lib/data/raw-snapshot.json."""

from __future__ import annotations

import csv
import json
import unicodedata
import pandas as pd
from pathlib import Path

import os
from dotenv import load_dotenv
from supabase import create_client, Client

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "raw"
OUT = ROOT / "src" / "lib" / "data" / "raw-snapshot.json"

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("Aviso: Variáveis do Supabase não encontradas!")


def find_raw(*needles: str) -> Path:
    folded = [strip_accents(n).lower() for n in needles]
    for path in RAW.iterdir():
        name = strip_accents(path.name).lower()
        if all(needle in name for needle in folded):
            return path
    raise FileNotFoundError(needles)


def blank(value: str | None) -> bool:
    return str(value or "").strip() in {"", "--", "—", "-"}


def collect_indexed(row: dict, prefix: str, count: int) -> list[str]:
    values: list[str] = []
    for index in range(1, count + 1):
        text = str(row.get(f"{prefix} {index}") or "").strip()
        if not blank(text):
            values.append(text)
    return values


def google_format(ad_type: str) -> str:
    t = strip_accents(ad_type).lower()
    if "video" in t:
        return "Vídeo"
    if "pesquisa" in t:
        return "Texto (RSA)"
    if "grafico" in t or "display" in t:
        return "Estático"
    return ad_type or "n/d"


def strip_accents(text: str) -> str:
    n = unicodedata.normalize("NFD", text)
    return "".join(c for c in n if unicodedata.category(c) != "Mn")


def classify_unit(name: str, ad_group: str | None = None) -> str:
    g = strip_accents(ad_group or "").upper().strip()
    if g == "COMPRA":
        return "select_compra"
    if g == "VENDA":
        return "select_venda"
    if "LEILAO" in g or g == "INSTITUCIONAL":
        return "leilao_compra"

    n = strip_accents(name).upper()
    compact = n.replace(" ", "").replace("_", "").replace("-", "")
    if "VENDADIRETA" in compact and "LEILAO" not in n:
        if "VENDER" in n or "WHATS" in n:
            return "select_venda"
        return "select_compra"
    if "[WHATS]" in n or ("WHATSAPP" in n and "VENDER" in n) or ("WHATS" in n and "VENDER" in n):
        return "select_venda"
    if "VENDER" in n and "COMPRAR" not in n and "COMPRA" not in n and "LEILAO" not in n:
        return "select_venda"
    compra_tokens = (
        "COMPRAR",
        "CATALOGO",
        "COMPRE AGORA",
        "VENHA COMPRAR",
        "VENDAS TESTE",
        "VENDAS |",
        "[COMPRA]",
        "TRAFEGO][COMPRA",
        "TRÁFEGO][COMPRA",
    )
    if any(tok in n for tok in compra_tokens) and "LEILAO" not in n:
        return "select_compra"
    if "COMPRA" in n and "LEILAO" not in n and "VENDA DIRETA" in n and "COMPRA E VENDA" not in n:
        return "select_compra"
    if "COMPRA" in n and "LEILAO" not in n and not ("VENDA DIRETA" in n and "COMPRA E VENDA" in n):
        return "select_compra"
    return "leilao_compra"


def br_number(value: str | None) -> float:
    if value is None:
        return 0.0
    s = str(value).strip().replace("%", "")
    if s in {"", "--", "—", "-"}:
        return 0.0
    if "," in s:
        s = s.replace(".", "").replace(",", ".")
    elif s.count(".") > 1:
        s = s.replace(".", "")
    elif s.count(".") == 1:
        left, right = s.split(".")
        if len(right) == 3 and left.lstrip("-").isdigit():
            s = left + right
    try:
        return float(s)
    except ValueError:
        return 0.0


def result_type(indicator: str) -> str:
    i = (indicator or "").lower()
    if "cadastro" in i or "fb_pixel_custom.cadastro" in i:
        return "cadastro"
    if "messaging" in i or "conversation" in i:
        return "messaging"
    if "landing_page" in i:
        return "landing"
    if "link_click" in i:
        return "link"
    if i == "reach":
        return "reach"
    if "conversion" in i:
        return "conversion"
    return "other"

# ==========================================
# 1. PARSE META CAMPANHAS (Direto da View 3)
# ==========================================
def parse_meta() -> list[dict]:
    if not supabase:
        print("Aviso: Supabase não configurado. Pulando Meta.")
        return []

    # Lê da View 3 criada no Supabase
    response = supabase.from_("meta_ads_campanhas").select("*").execute()
    rows = response.data or []

    campaigns = []
    for row in rows:
        spend = float(row.get("Amount spent (BRL)") or 0.0)
        impressions = int(row.get("Impressions") or 0)
        ctr = float(row.get("Unique CTR (link click-through rate)") or 0.0)
        clicks = int(round(impressions * ctr / 100)) if impressions and ctr else 0
        purchases = float(row.get("Purchases") or 0.0)
        name = row.get("Campaign name") or ""

        if spend <= 0 and purchases <= 0 and impressions <= 0:
            continue

        campaigns.append({
            "source": "meta",
            "name": name,
            "adGroup": None,
            "unit": classify_unit(name),
            "delivery": row.get("Campaign delivery") or "",
            "spend": round(spend, 2),
            "impressions": impressions,
            "reach": int(row.get("Reach") or 0),
            "clicks": clicks,
            "ctr": round(ctr, 4),
            "results": purchases,
            "resultType": "conversion",
            "conversas": int(row.get("Total messaging contacts") or 0),
            "newConversas": int(row.get("New messaging contacts") or 0),
        })
    return campaigns


# def parse_meta() -> list[dict]:
#     path = find_raw("meta-ads_campanhas")
#     campaigns = []
#     with path.open(encoding="utf-8", newline="") as handle:
#         for row in csv.DictReader(handle):
#             spend = br_number(row.get("Amount spent (BRL)"))
#             impressions = int(br_number(row.get("Impressions")))
#             ctr = br_number(row.get("Unique CTR (link click-through rate)"))
#             clicks = int(round(impressions * ctr / 100)) if impressions and ctr else 0
#             results = br_number(row.get("Results"))
#             rtype = result_type(row.get("Result indicator") or "")
#             name = row.get("Campaign name") or ""
#             if spend <= 0 and results <= 0 and impressions <= 0:
#                 continue
#             campaigns.append(
#                 {
#                     "source": "meta",
#                     "name": name,
#                     "adGroup": None,
#                     "unit": classify_unit(name),
#                     "delivery": row.get("Campaign delivery") or "",
#                     "spend": round(spend, 2),
#                     "impressions": impressions,
#                     "reach": int(br_number(row.get("Reach"))),
#                     "clicks": clicks,
#                     "ctr": round(ctr, 4),
#                     "results": results,
#                     "resultType": rtype,
#                     "conversas": int(br_number(row.get("Total messaging contacts"))),
#                     "newConversas": int(br_number(row.get("New messaging contacts"))),
#                 }
#             )
#     return campaigns


# ==========================================
# 1. VISAO GERAL MIDIA PAGA  (Direto da View)
# ==========================================
def parse_visao_geral_midia() -> list[dict]:
    if not supabase:
        return []

    # Consulta todos os registros da tabela no Supabase
    response = supabase.from_("vw_dashboard_eventos_midia_paga").select("*").execute()
    rows = response.data or []

    visao_geral_midia: list[dict] = []
    for idx, row in enumerate(rows, start=1):
        # 1. Identificadores, dimensões e datas
        plataforma = str(row.get("plataforma") or "").strip()
        date_start = str(row.get("date_start") or "").strip()
        date_end = str(row.get("date_end") or "").strip()
        evento = str(row.get("evento") or "").strip()

        # 2. Métricas base
        investimento = float(row.get("investimento") or 0.0)
        impressoes = int(row.get("impressoes") or 0)
        cliques = int(row.get("cliques") or 0)
        conversoes = float(row.get("conversoes") or 0.0)
        alcance = int(row.get("alcance") or 0)

        # 3. Métricas derivadas (extraídas diretamente da coluna)
        ctr = float(row.get("ctr") or 0.0)
        cpc = float(row.get("cpc") or 0.0)
        cpm = float(row.get("cpm") or 0.0)
        cpp = float(row.get("cpp") or 0.0)

        # 4. Filtro: ignora linhas sem nenhuma atividade real
        if investimento <= 0 and impressoes <= 0 and conversoes <= 0:
            continue

        # 5. Adiciona o registro individual com todas as colunas
        visao_geral_midia.append(
            {
                "id": f"visao_geral-{idx}",
                "plataforma": plataforma,
                "date_start": date_start,
                "date_end": date_end,
                "evento": evento,
                "investimento": round(investimento, 2),
                "conversoes": conversoes,
                "cliques": cliques,
                "impressoes": impressoes,
                "alcance": alcance,
                "cpc": round(cpc, 2),
                "cpm": round(cpm, 2),
                "ctr": round(ctr, 4),
                "cpp": round(cpp, 2),
            }
        )

    # Ordena cronologicamente por date_start
    visao_geral_midia.sort(key=lambda r: r["date_start"], reverse=True)
    return visao_geral_midia



def parse_google() -> list[dict]:
    path = find_raw("google-ads_grupos")
    lines = path.read_text(encoding="utf-8").splitlines()
    reader = csv.DictReader(lines[2:])
    campaigns = []
    for row in reader:
        spend = br_number(row.get("Custo"))
        clicks = int(br_number(row.get("Cliques")))
        impressions = int(br_number(row.get("Impr.")))
        if spend <= 0 and clicks <= 0:
            continue
        name = row.get("Campanha") or ""
        ad_group = row.get("Grupo de anúncios") or ""
        conversions = br_number(row.get("Conversões"))
        ctr = br_number(row.get("CTR"))
        campaigns.append(
            {
                "source": "google",
                "name": name,
                "adGroup": ad_group,
                "unit": classify_unit(name, ad_group),
                "delivery": row.get("Status do grupo de anúncios") or "",
                "spend": round(spend, 2),
                "impressions": impressions,
                "reach": 0,
                "clicks": clicks,
                "ctr": round(ctr, 4),
                "results": conversions,
                "resultType": "conversion",
                "conversas": 0,
                "newConversas": 0,
            }
        )
    return campaigns


def classify_google_campaign(name: str) -> str:
    folded = strip_accents(name).upper()
    parts = [part.strip() for part in folded.split("|")]
    if any("LEILAO" in part for part in parts):
        return "leilao_compra"
    for part in parts:
        if part == "COMPRA E VENDA":
            return "select_mix"
        if part == "VENDA":
            return "select_venda"
        if part == "COMPRA":
            return "select_compra"
    return classify_unit(name)


def parse_google_quarterly() -> dict | None:
    try:
        path = find_raw("google-ads_campanhas-trimestral")
    except FileNotFoundError:
        return None
    lines = path.read_text(encoding="utf-8-sig").splitlines()
    reader = csv.DictReader(lines[2:])
    campaigns: list[dict] = []
    by_type: dict[str, dict] = {}
    totals = None

    def metrics(row: dict) -> dict:
        return {
            "spend": round(br_number(row.get("Custo")), 2),
            "spendPrev": round(br_number(row.get("Custo (comparativo)")), 2),
            "conversions": round(br_number(row.get("Conversões")), 2),
            "conversionsPrev": round(br_number(row.get("Conversões (comparativo)")), 2),
            "clicks": int(br_number(row.get("Cliques"))),
            "clicksPrev": int(br_number(row.get("Cliques (comparativo)"))),
            "impressions": int(br_number(row.get("Impr."))),
            "impressionsPrev": int(br_number(row.get("Impr. (comparativo)"))),
        }

    for row in reader:
        status = (row.get("Status da campanha") or "").strip()
        name = (row.get("Campanha") or "").strip()
        campaign_type = (row.get("Tipo de campanha") or "").strip()
        label = status if status.startswith("Total:") else name
        if label.startswith("Total:"):
            rec = {"label": label.replace("Total:", "").strip() or campaign_type, "campaignType": campaign_type, **metrics(row)}
            if "Conta" in label or "Campanhas" in label:
                totals = rec
            elif rec["label"] and rec["label"] not in {"Padrão", "--"}:
                by_type[rec["label"]] = rec
            continue
        rec = metrics(row)
        if (
            rec["spend"] <= 0
            and rec["spendPrev"] <= 0
            and rec["conversions"] <= 0
            and rec["conversionsPrev"] <= 0
            and rec["clicks"] <= 0
            and rec["clicksPrev"] <= 0
        ):
            continue
        campaigns.append(
            {
                "name": name,
                "status": status,
                "campaignType": campaign_type,
                "unit": classify_google_campaign(name),
                **rec,
            }
        )
    campaigns.sort(key=lambda row: row["spend"], reverse=True)
    if totals is None:
        totals = {
            "spend": round(sum(row["spend"] for row in campaigns), 2),
            "spendPrev": round(sum(row["spendPrev"] for row in campaigns), 2),
            "conversions": round(sum(row["conversions"] for row in campaigns), 2),
            "conversionsPrev": round(sum(row["conversionsPrev"] for row in campaigns), 2),
            "clicks": sum(row["clicks"] for row in campaigns),
            "clicksPrev": sum(row["clicksPrev"] for row in campaigns),
            "impressions": sum(row["impressions"] for row in campaigns),
            "impressionsPrev": sum(row["impressionsPrev"] for row in campaigns),
        }
    return {
        "sourceFile": path.name,
        "start": "2026-06-15",
        "end": "2026-09-15",
        "compareStart": "2026-03-14",
        "compareEnd": "2026-06-14",
        "days": 93,
        "compareDays": 93,
        "totals": {
            "spend": {"current": totals["spend"], "previous": totals["spendPrev"]},
            "conversions": {"current": totals["conversions"], "previous": totals["conversionsPrev"]},
            "clicks": {"current": totals["clicks"], "previous": totals["clicksPrev"]},
            "impressions": {"current": totals["impressions"], "previous": totals["impressionsPrev"]},
        },
        "byType": [
            {
                "label": row["label"],
                "spend": {"current": row["spend"], "previous": row["spendPrev"]},
                "conversions": {"current": row["conversions"], "previous": row["conversionsPrev"]},
                "clicks": {"current": row["clicks"], "previous": row["clicksPrev"]},
            }
            for row in sorted(by_type.values(), key=lambda item: item["spend"], reverse=True)
            if row["spend"] > 0 or row["spendPrev"] > 0
        ],
        "campaigns": campaigns,
    }


def parse_copart() -> list[dict]:
    path = find_raw("copart_resultados-mensais")
    rows = []
    with path.open(encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            rows.append(
                {
                    "year": int(row["ano"]),
                    "month": row["mes"],
                    "period": row["periodo"],
                    "entrantes": int(br_number(row["entrantes"])),
                    "habilitados": int(br_number(row["habilitados"])),
                    "metaEntrantes": int(br_number(row.get("meta_entrantes"))) or None,
                    "metaHabilitados": int(br_number(row.get("meta_habilitados"))) or None,
                    "atingimentoEntrantesPct": br_number(row.get("atingimento_entrantes_pct")) or None,
                    "atingimentoHabilitadosPct": br_number(row.get("atingimento_habilitados_pct")) or None,
                }
            )
    return rows

# ====================================================
# 2. PARSE META ANÚNCIOS / CRIATIVOS (Direto da View 2)
# ====================================================
def parse_meta_ads() -> list[dict]:
    if not supabase:
        return []

    # Lê da View 2 criada no Supabase
    response = supabase.from_("meta_ads_anuncios").select("*").execute()
    rows = response.data or []

    merged: dict[tuple[str, str], dict] = {}
    for row in rows:
        name = (row.get("Ad name") or "").strip()
        ad_set = (row.get("Ad set name") or "").strip()
        if not name:
            continue

        spend = float(row.get("Amount spent (BRL)") or 0.0)
        impressions = int(row.get("Impressions") or 0)
        purchases = float(row.get("Purchases") or 0.0)
        key = (name, ad_set)
        
        rec = merged.get(key)
        if rec is None:
            rec = {
                "id": f"meta-{len(merged) + 1}",
                "source": "meta",
                "name": name,
                "campaign": name.rsplit(" AD", 1)[0] if " AD" in name else name,
                "adGroup": ad_set,
                "unit": classify_unit(name, ad_set),
                "delivery": row.get("Ad delivery") or "",
                "adType": "Anúncio Meta",
                "format": "n/d",
                "quality": row.get("Quality ranking"),
                "qualityHint": None,
                "finalUrl": None,
                "headlines": [],
                "descriptions": [],
                "hasImageIds": False,
                "spend": 0.0,
                "impressions": 0,
                "reach": 0,
                "clicks": 0,
                "ctr": 0.0,
                "resultsCadastro": 0.0,
                "resultsLanding": 0.0,
                "conversas": 0,
                "conversions": 0.0,
            }
            merged[key] = rec

        rec["spend"] = max(rec["spend"], round(spend, 2))
        rec["impressions"] = max(rec["impressions"], impressions)
        rec["reach"] = max(rec["reach"], int(row.get("Reach") or 0))
        rec["conversas"] = max(rec["conversas"], int(row.get("Total messaging contacts") or 0))
        rec["conversions"] += purchases

    out = [r for r in merged.values() if r["spend"] > 0 or r["impressions"] > 0 or r["conversions"] > 0]
    out.sort(key=lambda r: r["spend"], reverse=True)
    return out



# def parse_meta_ads() -> list[dict]:
#     path = find_raw("meta-ads_anuncios_")
#     merged: dict[tuple[str, str], dict] = {}
#     with path.open(encoding="utf-8", newline="") as handle:
#         for index, row in enumerate(csv.DictReader(handle)):
#             name = (row.get("Ad name") or "").strip()
#             ad_set = (row.get("Ad set name") or "").strip()
#             if not name:
#                 continue
#             spend = br_number(row.get("Amount spent (BRL)"))
#             impressions = int(br_number(row.get("Impressions")))
#             results = br_number(row.get("Results"))
#             rtype = result_type(row.get("Result indicator") or "")
#             key = (name, ad_set)
#             rec = merged.get(key)
#             if rec is None:
#                 rec = {
#                     "id": f"meta-{len(merged) + 1}",
#                     "source": "meta",
#                     "name": name,
#                     "campaign": name.rsplit(" AD", 1)[0] if " AD" in name else name,
#                     "adGroup": ad_set,
#                     "unit": classify_unit(name, ad_set),
#                     "delivery": row.get("Ad delivery") or "",
#                     "adType": "Anúncio Meta",
#                     "format": "n/d",
#                     "quality": None,
#                     "qualityHint": None,
#                     "finalUrl": None,
#                     "headlines": [],
#                     "descriptions": [],
#                     "hasImageIds": False,
#                     "spend": 0.0,
#                     "impressions": 0,
#                     "reach": 0,
#                     "clicks": 0,
#                     "ctr": 0.0,
#                     "resultsCadastro": 0.0,
#                     "resultsLanding": 0.0,
#                     "conversas": 0,
#                     "conversions": 0.0,
#                 }
#                 merged[key] = rec
#             rec["spend"] = max(rec["spend"], round(spend, 2))
#             rec["impressions"] = max(rec["impressions"], impressions)
#             rec["reach"] = max(rec["reach"], int(br_number(row.get("Reach"))))
#             rec["conversas"] = max(rec["conversas"], int(br_number(row.get("Total messaging contacts"))))
#             if (row.get("Ad delivery") or "") == "active":
#                 rec["delivery"] = "active"
#             if rtype == "cadastro":
#                 rec["resultsCadastro"] += results
#             elif rtype == "landing":
#                 rec["resultsLanding"] += results
#             rec["conversions"] = rec["resultsCadastro"]
#     out = []
#     for rec in merged.values():
#         if rec["spend"] <= 0 and rec["impressions"] <= 0 and rec["resultsCadastro"] <= 0 and rec["resultsLanding"] <= 0:
#             continue
#         rec["resultsCadastro"] = round(rec["resultsCadastro"], 2)
#         rec["resultsLanding"] = round(rec["resultsLanding"], 2)
#         rec["conversions"] = round(rec["conversions"], 2)
#         out.append(rec)
#     out.sort(key=lambda row: row["spend"], reverse=True)
#     return out


def parse_google_ads() -> list[dict]:
    path = find_raw("google-ads_anuncios")
    lines = path.read_text(encoding="utf-8").splitlines()
    reader = csv.DictReader(lines[2:])
    ads = []
    for index, row in enumerate(reader):
        campaign = (row.get("Campanha") or "").strip()
        ad_type = (row.get("Tipo de anúncio") or "").strip()
        if blank(campaign) or blank(ad_type):
            continue
        ad_group = (row.get("Grupo de anúncios") or "").strip()
        name = (row.get("Nome do anúncio") or "").strip()
        headlines = collect_indexed(row, "Título", 15)
        descriptions = collect_indexed(row, "Descrição", 5)
        if blank(name):
            name = headlines[0] if headlines else f"{ad_type} — {campaign[:40]}"
        spend = br_number(row.get("Custo"))
        impressions = int(br_number(row.get("Impr.")))
        clicks = int(br_number(row.get("Interações")))
        conversions = br_number(row.get("Conversões"))
        ads.append(
            {
                "id": f"google-{index + 1}",
                "source": "google",
                "name": name,
                "campaign": campaign,
                "adGroup": ad_group,
                "unit": classify_unit(campaign, ad_group),
                "delivery": (row.get("Status") or "").strip(),
                "adType": ad_type,
                "format": google_format(ad_type),
                "quality": None if blank(row.get("Qualidade do anúncio")) else row.get("Qualidade do anúncio"),
                "qualityHint": None if blank(row.get("Melhorias na qualidade do anúncio")) else row.get("Melhorias na qualidade do anúncio"),
                "finalUrl": None if blank(row.get("URL final")) else row.get("URL final"),
                "headlines": headlines,
                "descriptions": descriptions,
                "hasImageIds": not blank(row.get("ID da imagem")),
                "spend": round(spend, 2),
                "impressions": impressions,
                "reach": 0,
                "clicks": clicks,
                "ctr": round(br_number(row.get("Taxa de interação")), 4),
                "resultsCadastro": 0.0,
                "resultsLanding": 0.0,
                "conversas": 0,
                "conversions": round(conversions, 2),
            }
        )
    ads.sort(key=lambda row: row["spend"], reverse=True)
    return ads


def parse_ga4_paid_download() -> dict | None:
    try:
        path = find_raw("ga4_eventos-midia-paga")
    except FileNotFoundError:
        return None
    lines = [line.strip() for line in path.read_text(encoding="utf-8-sig").splitlines() if line.strip()]
    rows: list[dict] = []
    current_channel = ""
    current_event = ""
    current_val: int | None = None
    previous_val: int | None = None
    total_current = 0
    total_previous = 0
    started_events = False

    def flush() -> None:
        nonlocal current_val, previous_val
        if current_channel and current_event and current_val is not None:
            rows.append(
                {
                    "channel": current_channel,
                    "event": current_event,
                    "current": current_val,
                    "previous": previous_val or 0,
                }
            )
        current_val = None
        previous_val = None

    for line in lines:
        if line.startswith("#") or line.startswith("Grupo principal"):
            continue
        parts = next(csv.reader([line]))
        while len(parts) < 4:
            parts.append("")
        channel, event, label, value = (parts[0].strip(), parts[1].strip(), parts[2].strip(), parts[3].strip())
        if channel and event:
            flush()
            started_events = True
            current_channel, current_event = channel, event
            current_val = None
            previous_val = None
            continue
        if "15 de jun" in label.lower():
            amount = int(br_number(value))
            if started_events:
                current_val = amount
            else:
                total_current = amount
            continue
        if "14 de mar" in label.lower():
            amount = int(br_number(value))
            if started_events:
                previous_val = amount
            else:
                total_previous = amount
    flush()

    return {
        "sourceFile": path.name,
        "metric": "total_users",
        "start": "2026-06-15",
        "end": "2026-09-15",
        "compareStart": "2026-03-14",
        "compareEnd": "2026-06-14",
        "days": 93,
        "compareDays": 93,
        "totalUsers": {"current": total_current, "previous": total_previous},
        "rows": rows,
    }


def parse_ga4() -> dict:
    path = find_raw("ga4_resumo")
    lines = path.read_text(encoding="utf-8").splitlines()
    sections: list[dict] = []
    current = None
    for line in lines:
        if line.startswith("# Data de início"):
            current = {"header": None, "rows": []}
            sections.append(current)
        elif current is None:
            continue
        elif line.startswith("#"):
            continue
        elif current["header"] is None and line.strip():
            current["header"] = line
        elif current["header"] and line.strip():
            current["rows"].append(line)
        elif not line.strip():
            current = None

    def by_header(prefix: str) -> dict | None:
        for section in sections:
            if section["header"] and section["header"].startswith(prefix):
                return section
        return None

    def daily(prefix: str, metric_index: int = 1) -> list[dict]:
        section = by_header(prefix)
        out = []
        if not section:
            return out
        for row in section["rows"]:
            parts = row.split(",")
            day = int(parts[0])
            out.append({"date": f"2026-08-{day + 1:02d}", "value": float(parts[metric_index])})
        return out

    def kv(prefix: str) -> dict[str, float]:
        section = by_header(prefix)
        out: dict[str, float] = {}
        if not section:
            return out
        for row in section["rows"]:
            key, _, rest = row.partition(",")
            out[key] = br_number(rest)
        return out

    return {
        "dailyActiveUsers": daily("Nº dia,Usuários ativos"),
        "dailyNewUsers": daily("Nº dia,Novos usuários"),
        "dailyEngagementSec": daily("Nº dia,Tempo médio de engajamento"),
        "firstUserChannels": kv("Grupo principal de canais do primeiro usuário"),
        "sessionChannels": kv("Grupo principal de canais da sessão"),
        "countryActiveUsers": kv("País,Usuários ativos"),
        "events": {k: int(v) for k, v in kv("Nome do evento,Contagem de eventos").items()},
        "keyEvents": {k: int(v) for k, v in kv("Nome do evento,Eventos principais").items()},
    }


def iso_date(value) -> str | None:
    from datetime import datetime, date

    if hasattr(value, "strftime"):
        return value.strftime("%Y-%m-%d")
    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d")
    if isinstance(value, date):
        return value.isoformat()
    return None


def parse_copart_xlsx() -> dict:
    path = find_raw("copart_dashboard-leiloes")
    daily_df = pd.read_excel(path, sheet_name="Entrantes e Habilitados", header=None)
    daily: list[dict] = []
    for _, row in daily_df.iterrows():
        dated = iso_date(row[0])
        if not dated:
            continue
        if pd.isna(row[1]) and pd.isna(row[2]):
            continue
        daily.append(
            {
                "date": dated,
                "entrantes": int(row[1] or 0),
                "habilitados": int(row[2] or 0),
            }
        )

    week_ranges = [
        {"week": "30/08–05/09", "start": "2026-08-30", "end": "2026-09-05"},
        {"week": "06/09–12/09", "start": "2026-09-06", "end": "2026-09-12"},
    ]
    by_uf: list[dict] = []
    week_index = -1
    for _, row in daily_df.iterrows():
        label = str(row[11] or "").strip()
        if label == "Estado":
            week_index += 1
            continue
        if week_index < 0 or week_index >= len(week_ranges):
            continue
        geo = label.upper().replace("TOTAL", "TOTAL").replace(" ", "")
        if geo in {"", "NAN"}:
            continue
        if geo == "TOTAL":
            continue
        mapped = "OUTROS" if geo == "OUTROS" else "VAZIAS" if geo == "VAZIAS" else geo
        if mapped not in {"SP", "RJ", "MG", "PR", "SC", "RS", "GO", "BA", "OUTROS", "VAZIAS"}:
            continue
        wr = week_ranges[week_index]
        hab = row[16]
        by_uf.append(
            {
                **wr,
                "geo": mapped,
                "entrantes": int(row[12] or 0) if pd.notna(row[12]) else 0,
                "habilitados": int(hab or 0) if pd.notna(hab) else 0,
            }
        )

    vd = pd.read_excel(path, sheet_name="Venda Direta", header=None)
    select_weeks = [
        {
            "week": "30/08–05/09",
            "start": "2026-08-30",
            "end": "2026-09-05",
            "leads": int(vd.iloc[4, 1] or 0),
            "vendas": int(vd.iloc[5, 1] or 0),
            "entradas": int(vd.iloc[6, 1] or 0),
        },
        {
            "week": "06/09–12/09",
            "start": "2026-09-06",
            "end": "2026-09-12",
            "leads": int(vd.iloc[4, 2] or 0),
            "vendas": int(vd.iloc[5, 2] or 0),
            "entradas": int(vd.iloc[6, 2] or 0),
        },
    ]

    def day_to_date(day: int) -> str:
        if day >= 30:
            return f"2026-08-{day:02d}"
        return f"2026-09-{day:02d}"

    select_page_views: list[dict] = []
    blocks = [
        ("comprar", 17, 23, 0, 1),
        ("comprar", 17, 23, 5, 6),
        ("vender", 28, 34, 0, 1),
        ("vender", 28, 34, 5, 6),
    ]
    for journey, r0, r1, day_col, val_col in blocks:
        for r in range(r0, r1 + 1):
            day = vd.iloc[r, day_col]
            val = vd.iloc[r, val_col]
            if pd.isna(day) or pd.isna(val):
                continue
            try:
                d = int(day)
            except (TypeError, ValueError):
                continue
            select_page_views.append(
                {"date": day_to_date(d), "journey": journey, "pageViews": int(val)}
            )

    return {
        "copartDaily": daily,
        "copartByUf": by_uf,
        "selectWeekly": select_weeks,
        "selectPageViews": select_page_views,
    }


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)

    # 1. Puxa do Supabase os dados da Meta
    meta_campaigns = parse_meta() + parse_google()
    meta_creatives = parse_meta_ads() + parse_google_ads()

    campaigns = parse_meta() + parse_google()
    creatives = parse_meta_ads() + parse_google_ads()
    excel = parse_copart_xlsx()
    daily = excel["copartDaily"]
    snapshot = {
        "origin": "weekly_report",
        "originLabel": "Meta + GA4 ago/2026 · GA4/Google 15/06–15/09 · Copart set/2026",
        "mediaStart": "2026-08-01",
        "mediaEnd": "2026-08-31",
        "copartStart": daily[0]["date"] if daily else "2026-09-01",
        "copartEnd": daily[-1]["date"] if daily else "2026-09-13",
        "files": sorted(
            p.name for p in RAW.iterdir() if p.suffix.lower() in {".csv", ".xlsx"}
        ),
        "copartMonthly": parse_copart(),
        "copartDaily": excel["copartDaily"],
        "copartByUf": excel["copartByUf"],
        "selectWeekly": excel["selectWeekly"],
        "selectPageViews": excel["selectPageViews"],
        "ga4": parse_ga4(),
        "ga4PaidKeyEvents": parse_ga4_paid_download(),
        "googleQuarterly": parse_google_quarterly(),
        "campaigns": meta_campaigns,
        "creatives": meta_creatives,
        "new_campaigns": meta_campaigns,
        "new_creatives": meta_creatives,
        "new_visao_geral_midias": parse_visao_geral_midia(),
    }
    OUT.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8")
    spend = sum(c["spend"] for c in campaigns)
    creative_spend = sum(c["spend"] for c in creatives)
    print(
        f"wrote {OUT} campaigns={len(campaigns)} spend={spend:.2f} "
        f"creatives={len(creatives)} creative_spend={creative_spend:.2f}"
    )


if __name__ == "__main__":
    main()
