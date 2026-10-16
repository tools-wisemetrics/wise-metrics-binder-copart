import type { BusinessUnit } from "@/lib/data/types";

function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase();
}

export function classifyCampaignUnit(name: string, adGroup?: string | null): BusinessUnit {
  const group = fold(adGroup ?? "").trim();
  if (group === "COMPRA") return "select_compra";
  if (group === "VENDA") return "select_venda";
  if (group.includes("LEILAO") || group === "INSTITUCIONAL") return "leilao_compra";

  const n = fold(name);
  const compact = n.replace(/[\s_-]/g, "");
  if (compact.includes("VENDADIRETA") && !n.includes("LEILAO")) {
    if (n.includes("VENDER") || n.includes("WHATS")) return "select_venda";
    return "select_compra";
  }
  if (n.includes("[WHATS]") || (n.includes("WHATS") && n.includes("VENDER"))) return "select_venda";
  if (n.includes("VENDER") && !n.includes("COMPRAR") && !n.includes("COMPRA") && !n.includes("LEILAO")) {
    return "select_venda";
  }
  const compra =
    n.includes("COMPRAR") ||
    n.includes("CATALOGO") ||
    n.includes("COMPRE AGORA") ||
    n.includes("VENHA COMPRAR") ||
    n.includes("VENDAS TESTE") ||
    n.includes("VENDAS |") ||
    n.includes("[COMPRA]") ||
    n.includes("TRAFEGO][COMPRA");
  if (compra && !n.includes("LEILAO")) return "select_compra";
  if (n.includes("COMPRA") && !n.includes("LEILAO") && !(n.includes("VENDA DIRETA") && n.includes("COMPRA E VENDA"))) {
    return "select_compra";
  }
  return "leilao_compra";
}
