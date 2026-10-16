import { describe, expect, it } from "vitest";
import { RawExportDataService } from "@/lib/data/raw-data";
import { classifyCampaignUnit } from "@/lib/data/campaign-unit";
import {
  FORBIDDEN_COPY,
  SELECT_COMPRA_LAST_STAGE,
  USER_FACING_LABELS,
} from "@/lib/constants";
import { assertNoForbiddenCopy, isMonotonicFunnel, totalChannelPerformance } from "@/lib/aggregations";
import { parseDashboardFilters, navHref, coerceUnitForScope, unitScopeForPath } from "@/lib/filters";

const service = new RawExportDataService();

const week = parseDashboardFilters({
  start: "2026-08-01",
  end: "2026-08-07",
});

const month = parseDashboardFilters({
  start: "2026-08-01",
  end: "2026-08-31",
  unit: "leilao_compra",
});

describe("nomenclatura", () => {
  it("não usa copy proibida em labels user-facing", () => {
    expect(assertNoForbiddenCopy(USER_FACING_LABELS, FORBIDDEN_COPY)).toEqual([]);
  });
});

describe("origem", () => {
  it("declara extrações reais, não mock", () => {
    expect(service.getDataOrigin()).toBe("weekly_report");
  });
});

describe("classificação de campanha", () => {
  it("separa Leilão, Select/Venda e Select/Compra", () => {
    expect(classifyCampaignUnit("[Binder][Cadastro]Leilão")).toBe("leilao_compra");
    expect(classifyCampaignUnit("[Binder][Whats][Vender]")).toBe("select_venda");
    expect(classifyCampaignUnit("[Binder][Tráfego][Compra]")).toBe("select_compra");
    expect(classifyCampaignUnit("VENDA DIRETA | …", "VENDA")).toBe("select_venda");
    expect(classifyCampaignUnit("VENDA DIRETA | …", "COMPRA")).toBe("select_compra");
    expect(classifyCampaignUnit("VENDA DIRETA | … | COMPRA", "[FRASE]")).toBe("select_compra");
  });
});

describe("funis", () => {
  it("Funil Leilão separa etapas Copart das estimadas", async () => {
    const funnel = await service.getFunnelData("leilao", week);
    expect(funnel.stages.map((s) => s.label)).toEqual([
      "Cadastro GA4 (evento)",
      "Habilitados (estimado)",
    ]);
    expect(funnel.estimatedStages?.map((s) => s.label)).toEqual([
      "Licitantes (estimado)",
      "Arrematantes (estimado)",
    ]);
    expect(isMonotonicFunnel(funnel.stages)).toBe(true);
  });

  it("Funil Leilão com Excel Copart usa etapas oficiais", async () => {
    const copartRange = parseDashboardFilters({
      start: "2026-08-30",
      end: "2026-09-14",
    });
    const funnel = await service.getFunnelData("leilao", copartRange);
    expect(funnel.stages.map((s) => s.label)).toEqual([
      "Entrantes Copart",
      "Habilitados Copart",
    ]);
    expect(isMonotonicFunnel(funnel.stages)).toBe(true);
  });

  it("Select oficial termina em qualificados; captados e vendidos ficam na fonte certa", async () => {
    const venda = await service.getFunnelData("select_venda", week);
    const compra = await service.getFunnelData("select_compra", week);
    expect(venda.stages.at(-1)?.label).toBe("Qualificados");
    expect(venda.estimatedStages?.at(-1)?.label).toContain("Captados");
    expect(compra.stages.at(-1)?.label).toBe(SELECT_COMPRA_LAST_STAGE);
    expect(isMonotonicFunnel(venda.stages)).toBe(true);
    expect(isMonotonicFunnel(compra.stages)).toBe(true);
  });
});

describe("isolamento de investimento", () => {
  it("performance de Leilão/Compra não mistura Select", async () => {
    const rows = await service.getChannelPerformance("leilao", week);
    expect(rows.every((r) => r.unit === "leilao_compra")).toBe(true);
    expect(rows.some((r) => r.channel.includes("Blip"))).toBe(false);
  });

  it("spend Leilão e Select são conjuntos distintos", async () => {
    const leilao = await service.getChannelPerformance("leilao", week);
    const selectVenda = await service.getChannelPerformance("select_venda", week);
    const selectCompra = await service.getChannelPerformance("select_compra", week);
    const spendLeilao = leilao.reduce((s, r) => s + r.gasto, 0);
    const spendSelect = selectVenda.reduce((s, r) => s + r.gasto, 0) + selectCompra.reduce((s, r) => s + r.gasto, 0);
    expect(spendLeilao).toBeGreaterThan(0);
    expect(spendSelect).toBeGreaterThan(0);
    expect(spendLeilao).not.toBe(spendSelect);
  });
});

describe("filtros", () => {
  it("alterar dateRange muda o payload", async () => {
    const weekFunnel = await service.getFunnelData("leilao", week);
    const monthFunnel = await service.getFunnelData("leilao", month);
    expect(weekFunnel.stages[0].value).not.toBe(monthFunnel.stages[0].value);
  });

  it("alterar unidade muda scorecards", async () => {
    const all = await service.getCampaignScorecards(week);
    const leilao = await service.getCampaignScorecards({ ...week, campaignType: "leilao_compra" });
    expect(leilao.length).toBeLessThan(all.length);
    expect(leilao.every((c) => c.campaign_type === "leilao_compra")).toBe(true);
  });
});

describe("totais", () => {
  it("TOTAL da tabela é a soma das linhas", async () => {
    const rows = await service.getChannelPerformance("leilao", week);
    const total = totalChannelPerformance(rows);
    expect(total.entrantes).toBe(rows.reduce((s, r) => s + r.entrantes, 0));
    expect(total.gasto).toBe(rows.reduce((s, r) => s + r.gasto, 0));
    expect(total.custo_por_entrante).toBeCloseTo(total.gasto / total.entrantes);
  });
});

describe("CRM split", () => {
  it("metas expõem RD Station e Blip, sem CRM genérico", async () => {
    const { channels } = await service.getChannelGoals(week);
    const labels = channels.map((c) => c.channelLabel);
    expect(labels).toContain("RD Station");
    expect(labels).toContain("Blip (WhatsApp)");
    expect(labels.some((l) => l === "CRM")).toBe(false);
  });
});

describe("mix e eficiência de mídia", () => {
  const fullMonth = parseDashboardFilters({
    start: "2026-08-01",
    end: "2026-08-31",
  });

  it("Direct + orgânico superam pago nas sessões e os buckets somam 100%", async () => {
    const mix = await service.getTrafficMix(fullMonth);
    const owned = mix.filter((b) => b.id === "direct" || b.id === "organic").reduce((s, b) => s + b.shareSessions, 0);
    const paid = mix.find((b) => b.id === "paid")?.shareSessions ?? 0;
    const total = mix.reduce((s, b) => s + b.shareSessions, 0);
    expect(owned).toBeGreaterThan(paid);
    expect(total).toBeCloseTo(100, 0);
  });

  it("eficiência de Leilão não inclui spend Select", async () => {
    const leilao = await service.getMediaEfficiency({ ...fullMonth, campaignType: "leilao_compra" });
    const selectVenda = await service.getMediaEfficiency({ ...fullMonth, campaignType: "select_venda" });
    expect(leilao.every((row) => row.unit === "leilao_compra")).toBe(true);
    expect(selectVenda.every((row) => row.unit === "select_venda")).toBe(true);
    const spendLeilao = leilao.reduce((s, r) => s + r.spend, 0);
    const spendSelect = selectVenda.reduce((s, r) => s + r.spend, 0);
    expect(spendLeilao).toBeGreaterThan(0);
    expect(spendSelect).toBeGreaterThan(0);
    expect(spendLeilao).not.toBe(spendSelect);
    const funnel = await service.getChannelPerformance("leilao", { ...fullMonth, campaignType: "leilao_compra" });
    expect(spendLeilao).toBeCloseTo(funnel.reduce((s, r) => s + r.gasto, 0), 0);
  });

  it("ranking de volume coloca Direto acima de Meta Ads", async () => {
    const ranking = await service.getVolumeRanking(fullMonth);
    expect(ranking[0]?.channel).toBe("Direto");
    const direto = ranking.find((row) => row.channel === "Direto")?.entrantes ?? 0;
    const socialPago = ranking.find((row) => row.channel === "Social pago")?.entrantes ?? 0;
    expect(direto).toBeGreaterThan(socialPago);
    const funnel = await service.getChannelPerformance("leilao", fullMonth);
    expect(funnel[0]?.channel).toBe("Direto");
    const meta = funnel.find((row) => row.channel === "Meta Ads");
    expect(funnel[0]?.entrantes ?? 0).toBeGreaterThan(meta?.entrantes ?? 0);
  });
});

describe("criativos", () => {
  it("não duplica gasto Meta por indicador de resultado", async () => {
    const ads = await service.getCreatives(month);
    const ad1 = ads.find((row) => row.id === "meta-1");
    expect(ad1?.spend).toBeCloseTo(3188.76);
    expect(ad1?.resultsCadastro).toBeGreaterThan(0);
    expect(ad1?.resultsLanding).toBeGreaterThan(ad1?.resultsCadastro ?? 0);
  });

  it("ignora totais Google sem campanha e não mistura unidades", async () => {
    const ads = await service.getCreatives(month);
    const google = ads.filter((row) => row.source === "google");
    expect(google.length).toBeGreaterThan(0);
    expect(google.every((row) => row.campaign.length > 0 && row.adType.length > 0)).toBe(true);
    const spend = google.reduce((sum, row) => sum + row.spend, 0);
    expect(spend).toBeGreaterThan(10000);
    expect(spend).toBeLessThan(30000);
  });

  it("filtra por canal e unidade", async () => {
    const meta = await service.getCreatives({ ...month, channel: "META" });
    const google = await service.getCreatives({ ...month, channel: "GOOGLE" });
    const leilao = await service.getCreatives({ ...month, campaignType: "leilao_compra" });
    expect(meta.every((row) => row.source === "meta")).toBe(true);
    expect(google.every((row) => row.source === "google")).toBe(true);
    expect(leilao.every((row) => row.unit === "leilao_compra")).toBe(true);
    expect(meta.length).toBeGreaterThan(0);
    expect(google.length).toBeGreaterThan(0);
  });

  it("[FRASE] em campanha de compra não vira Select/Venda", async () => {
    const ads = await service.getCreatives({ ...month, campaignType: "ALL" });
    const google124 = ads.find((row) => row.id === "google-124");
    expect(google124?.adGroup).toBe("[FRASE]");
    expect(google124?.campaign).toMatch(/COMPRA/);
    expect(google124?.unit).toBe("select_compra");
  });
});

describe("jornadas e evolução", () => {
  it("padrões de jornada não repetem canal", async () => {
    const insights = await service.getJourneyInsights(week);
    const patterns = insights.frequent.map((row) => row.pattern);
    const channels = insights.channelShare.map((row) => row.channel);
    expect(new Set(patterns).size).toBe(patterns.length);
    expect(new Set(channels).size).toBe(channels.length);
  });

  it("evolução mensal usa totais reais, sem fatiar por plataforma inventada", async () => {
    const monthly = await service.getKpiEvolution(week, "monthly");
    const set25 = monthly.find((p) => p.period === "Set/25");
    expect(set25?.habilitados).toBe(11000);
    expect(monthly.filter((p) => p.period === "Set/25")).toHaveLength(1);
  });

  it("evolução semanal rotula GA4 e Copart sem misturar plataformas inventadas", async () => {
    const weekly = await service.getKpiEvolution(month, "weekly");
    const platforms = [...new Set(weekly.map((p) => p.platform))];
    expect(platforms).toContain("Cadastro (GA4)");
    expect(platforms).toContain("Cadastro (Copart)");
    expect(weekly.length).toBeGreaterThan(1);
    expect(platforms.every((p) => p.startsWith("Cadastro"))).toBe(true);
  });
});

describe("Excel Copart set/2026", () => {
  const copartWeek = parseDashboardFilters({
    start: "2026-08-30",
    end: "2026-09-05",
  });
  const copartRange = parseDashboardFilters({
    start: "2026-08-30",
    end: "2026-09-14",
  });

  it("soma UF + Outros + Vazias igual ao diário da semana e SC/GO > 0", async () => {
    const rows = await service.getRegionalPerformance(copartWeek);
    const ufs = rows.filter((row) => row.geo !== "OUTROS" && row.geo !== "VAZIAS");
    expect(ufs).toHaveLength(27);
    const sc = rows.find((row) => row.geo === "SC");
    const go = rows.find((row) => row.geo === "GO");
    const ac = rows.find((row) => row.geo === "AC");
    expect(sc?.entrantes).toBe(61);
    expect(go?.entrantes).toBe(113);
    expect(ac?.entrantes).toBe(0);
    expect(rows.find((row) => row.geo === "VAZIAS")?.entrantes).toBeGreaterThan(0);
    const daily = await service.getTrendData("entrantes", 31, copartWeek);
    expect(rows.reduce((sum, row) => sum + row.entrantes, 0)).toBe(daily.reduce((sum, row) => sum + row.value, 0));
  });

  it("GEO_WEIGHTS não altera gasto de mídia nem page views nacionais", async () => {
    const national = parseDashboardFilters({ start: "2026-08-01", end: "2026-08-31" });
    const sp = { ...national, geo: "SP" };
    const spendAll = (await service.getMediaEfficiency(national)).reduce((sum, row) => sum + row.spend, 0);
    const spendSp = (await service.getMediaEfficiency(sp)).reduce((sum, row) => sum + row.spend, 0);
    expect(spendSp).toBe(spendAll);
    const kpisAll = await service.getOverviewKPIs(national);
    const kpisSp = await service.getOverviewKPIs(sp);
    expect(kpisSp.pageViews.value).toBe(kpisAll.pageViews.value);
  });

  it("Leilão e Select isolam spend; Select/Compra usa vendas do Excel", async () => {
    const leilao = await service.getChannelPerformance("leilao", copartRange);
    const selectVenda = await service.getChannelPerformance("select_venda", copartRange);
    const selectCompra = await service.getChannelPerformance("select_compra", copartRange);
    const spendLeilao = leilao.reduce((sum, row) => sum + row.gasto, 0);
    const spendSelect =
      selectVenda.reduce((sum, row) => sum + row.gasto, 0) + selectCompra.reduce((sum, row) => sum + row.gasto, 0);
    expect(spendLeilao).toBeGreaterThan(0);
    expect(spendSelect).toBeGreaterThan(0);
    expect(spendLeilao).not.toBe(spendSelect);
    const compra = await service.getFunnelData("select_compra", copartRange);
    expect(compra.stages[0]?.label).toBe("Impressões (Select/Compra)");
    expect(compra.stages.at(-1)?.value).toBe(148);
    const leilaoFunnel = await service.getFunnelData("leilao", copartRange);
    expect(leilaoFunnel.pageViews).toBeGreaterThan(leilaoFunnel.stages[0].value);
  });

  it("GA4 mídia paga escala por overlap e não substitui cadastro_site de agosto", async () => {
    const august = parseDashboardFilters({ start: "2026-08-01", end: "2026-08-31" });
    const full = parseDashboardFilters({ start: "2026-06-15", end: "2026-09-15" });
    const none = parseDashboardFilters({ start: "2026-01-01", end: "2026-01-31" });
    const paidAug = await service.getPaidMediaEvents(august);
    const paidFull = await service.getPaidMediaEvents(full);
    const paidNone = await service.getPaidMediaEvents(none);
    const cadastro = (report: Awaited<ReturnType<typeof service.getPaidMediaEvents>>) =>
      report.events.find((row) => row.event === "cadastro_site")?.current ?? 0;
    expect(paidAug.overlapDays).toBe(31);
    expect(paidFull.overlapDays).toBe(93);
    expect(paidNone.overlapDays).toBe(0);
    expect(cadastro(paidFull)).toBe(2791);
    expect(cadastro(paidAug)).toBe(Math.round((2791 * 31) / 93));
    expect(cadastro(paidNone)).toBe(0);
    const kpis = await service.getOverviewKPIs(august);
    expect(kpis.pageViews.value).toBeGreaterThan(1_000_000);
  });

  it("Google trimestral escala por overlap e não substitui gasto de agosto", async () => {
    const august = parseDashboardFilters({ start: "2026-08-01", end: "2026-08-31" });
    const full = parseDashboardFilters({ start: "2026-06-15", end: "2026-09-15" });
    const none = parseDashboardFilters({ start: "2026-01-01", end: "2026-01-31" });
    const googleAug = await service.getGoogleQuarterly(august);
    const googleFull = await service.getGoogleQuarterly(full);
    const googleNone = await service.getGoogleQuarterly(none);
    expect(googleAug.overlapDays).toBe(31);
    expect(googleFull.overlapDays).toBe(93);
    expect(googleNone.overlapDays).toBe(0);
    expect(googleFull.totals.spend.current).toBe(73905.51);
    expect(googleAug.totals.spend.current).toBe(Math.round((73905.51 * 31) / 93 * 100) / 100);
    const cards = await service.getCampaignScorecards(august);
    const augustGoogle = cards.filter((row) => row.channel === "GOOGLE").reduce((sum, row) => sum + row.spend, 0);
    expect(augustGoogle).toBeGreaterThan(0);
    expect(augustGoogle).not.toBe(googleAug.totals.spend.current);
    const metaOnly = await service.getGoogleQuarterly({ ...august, channel: "META" });
    expect(metaOnly.campaigns).toHaveLength(0);
  });

  it("recomendações não inventam 8,5% Google vs GA4 e citam vendas Excel", async () => {
    const recs = await service.getRecommendations();
    const blob = recs.map((row) => `${row.title} ${row.reason}`).join(" ");
    expect(blob).not.toMatch(/8[,.]5\s*%/);
    expect(blob).toMatch(/148/);
    const alerts = await service.getAlerts();
    expect(alerts.some((row) => /Paid Search/i.test(row.description))).toBe(false);
  });
});

describe("seletor de unidade vs rota", () => {
  it("páginas de funil/campanha Leilão travam o negócio em Leilão", () => {
    expect(unitScopeForPath("/dashboard/funnel")).toBe("leilao");
    expect(unitScopeForPath("/dashboard/auction-campaigns")).toBe("leilao");
    expect(coerceUnitForScope("leilao", "select_venda")).toBe("leilao_compra");
    expect(coerceUnitForScope("leilao", "ALL")).toBe("leilao_compra");
  });

  it("páginas Select não carregam Leilão e aceitam Venda, Compra ou os dois", () => {
    expect(unitScopeForPath("/dashboard/direct-sales")).toBe("select");
    expect(coerceUnitForScope("select", "leilao_compra")).toBe("ALL");
    expect(coerceUnitForScope("select", "select_compra")).toBe("select_compra");
  });

  it("Visão Geral e Metas continuam livres", () => {
    expect(unitScopeForPath("/dashboard")).toBe("free");
    expect(unitScopeForPath("/dashboard/channel-goals")).toBe("free");
    expect(coerceUnitForScope("free", "select_venda")).toBe("select_venda");
  });

  it("navegar da barra lateral corrige a unit da URL", () => {
    const fromSelect = new URLSearchParams("unit=select_venda&start=2026-08-01");
    expect(navHref("/dashboard/funnel", fromSelect)).toContain("unit=leilao_compra");
    expect(navHref("/dashboard/funnel", fromSelect)).toContain("start=2026-08-01");
    const fromLeilao = new URLSearchParams("unit=leilao_compra&end=2026-08-31");
    expect(navHref("/dashboard/direct-sales", fromLeilao)).not.toContain("unit=");
    expect(navHref("/dashboard", fromLeilao)).toContain("unit=leilao_compra");
  });
});
