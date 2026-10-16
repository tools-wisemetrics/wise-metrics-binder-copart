import snapshotJson from "./raw-snapshot.json";
import { MockDataService } from "./mock-data";
import type {
  Alert,
  ActionRecommendation,
  AttributionComparison,
  CampaignScorecard,
  Channel,
  ChannelGoal,
  ChannelPerformance,
  ConversionPath,
  ConversionPathFilters,
  CreativePiece,
  DashboardFilters,
  DataDiscrepancy,
  DataOrigin,
  FunnelData,
  FunnelStage,
  FunnelStageAttribution,
  GoalProgress,
  JourneyInsights,
  KpiEvolutionPoint,
  MarketingChannel,
  MetricValue,
  OverviewKPIs,
  OverallGoalSummary,
  RegionalRow,
  TrafficMixBucket,
  TrafficSource,
  VolumeRankRow,
  EvolutionSeriesPoint,
  PaidMediaEventsReport,
  GoogleQuarterlyReport,
  GoogleQuarterlyUnit,
  MediaEfficiencyRow,
  WeeklyRegistration,
} from "./types";
import { coverageScale, overlapDays, parseDashboardFilters, scaleNumber, unitMatchesFunnel } from "@/lib/filters";
import {
  GOALS,
  MARKETING_CHANNEL_CONFIG,
  MEDIA_OWNER,
  SELECT_COMPRA_LAST_STAGE,
  SELECT_VENDA_LAST_STAGE,
} from "@/lib/constants";
import { BRAZIL_UFS, IBGE_POPULATION_2024 } from "@/lib/data/ibge-population";
import { formatNumberFull } from "@/lib/utils/formatters";

export interface RawCampaign {
  source: "meta" | "google";
  name: string;
  adGroup: string | null;
  unit: "leilao_compra" | "select_venda" | "select_compra";
  delivery: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  results: number;
  resultType: string;
  conversas: number;
  newConversas: number;
}

interface RawSnapshot {
  origin: DataOrigin;
  originLabel: string;
  mediaStart: string;
  mediaEnd: string;
  copartStart: string;
  copartEnd: string;
  copartMonthly: {
    year: number;
    month: string;
    period: string;
    entrantes: number;
    habilitados: number;
    metaEntrantes: number | null;
    metaHabilitados: number | null;
    atingimentoEntrantesPct: number | null;
    atingimentoHabilitadosPct: number | null;
  }[];
  copartDaily: { date: string; entrantes: number; habilitados: number }[];
  copartByUf: { week: string; start: string; end: string; geo: string; entrantes: number; habilitados: number }[];
  selectWeekly: { week: string; start: string; end: string; leads: number; vendas: number; entradas: number }[];
  selectPageViews: { date: string; journey: "comprar" | "vender"; pageViews: number }[];
  ga4: {
    dailyActiveUsers: { date: string; value: number }[];
    dailyNewUsers: { date: string; value: number }[];
    firstUserChannels: Record<string, number>;
    sessionChannels: Record<string, number>;
    countryActiveUsers: Record<string, number>;
    events: Record<string, number>;
    keyEvents: Record<string, number>;
  };
  ga4PaidKeyEvents?: {
    sourceFile: string;
    metric: string;
    start: string;
    end: string;
    compareStart: string;
    compareEnd: string;
    days: number;
    compareDays: number;
    totalUsers: { current: number; previous: number };
    rows: { channel: string; event: string; current: number; previous: number }[];
  };
  googleQuarterly?: {
    sourceFile: string;
    start: string;
    end: string;
    compareStart: string;
    compareEnd: string;
    days: number;
    compareDays: number;
    totals: {
      spend: { current: number; previous: number };
      conversions: { current: number; previous: number };
      clicks: { current: number; previous: number };
      impressions: { current: number; previous: number };
    };
    byType: {
      label: string;
      spend: { current: number; previous: number };
      conversions: { current: number; previous: number };
      clicks: { current: number; previous: number };
    }[];
    campaigns: {
      name: string;
      status: string;
      campaignType: string;
      unit: GoogleQuarterlyUnit;
      spend: number;
      spendPrev: number;
      conversions: number;
      conversionsPrev: number;
      clicks: number;
      clicksPrev: number;
      impressions: number;
      impressionsPrev: number;
    }[];
  };
  campaigns: RawCampaign[];
  creatives: Omit<CreativePiece, "channel">[];
}

export const rawSnapshot = snapshotJson as RawSnapshot;

const MEDIA_DAYS = 31;
const COPART_DAYS = Math.max(rawSnapshot.copartDaily?.length ?? 16, 1);
const HIST_HAB_RATE = 4536 / 7337;
const LICITANTE_RATE = 0.4;
const ARREMATANTE_RATE = 0.45;

const GA4_CHANNEL_LABEL: Record<string, string> = {
  Direct: "Direto",
  "Organic Search": "Busca orgânica",
  "Paid Search": "Busca paga",
  "Cross-network": "Cross-network",
  "Organic Social": "Social orgânico",
  "Paid Other": "Outros pagos",
  "Paid Social": "Social pago",
  Display: "Display",
  "AI Assistant": "Assistente de IA",
  Referral: "Referral",
  Email: "E-mail",
  Unassigned: "Não atribuído",
  "Organic Video": "Vídeo orgânico",
};

function mediaScale(filters: DashboardFilters): number {
  return coverageScale(filters, rawSnapshot.mediaStart, rawSnapshot.mediaEnd, MEDIA_DAYS);
}

function copartScale(filters: DashboardFilters): number {
  return coverageScale(filters, rawSnapshot.copartStart, rawSnapshot.copartEnd, COPART_DAYS);
}

function scaleMoney(value: number, scale: number): number {
  return Math.round(value * scale * 100) / 100;
}

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

function rateStages(stages: FunnelStage[]): FunnelStage[] {
  return stages.map((stage, index) => {
    if (index === 0) return stage;
    const prev = stages[index - 1].value;
    return { ...stage, conversionRate: prev === 0 ? 0 : (stage.value / prev) * 100 };
  });
}

function campaignLabel(row: RawCampaign): string {
  return row.adGroup ? `${row.adGroup} — ${row.name}` : row.name;
}

function copartSep2026() {
  return rawSnapshot.copartMonthly.find((row) => row.year === 2026)!;
}

function eventCount(name: string): number {
  return rawSnapshot.ga4.events[name] ?? 0;
}

function newUsersTotal(): number {
  return sum(Object.values(rawSnapshot.ga4.firstUserChannels));
}

function cadastroSite(): number {
  return eventCount("cadastro_site");
}

function copartDailyInRange(filters: DashboardFilters) {
  return (rawSnapshot.copartDaily ?? []).filter(
    (row) => row.date >= filters.dateRange.start && row.date <= filters.dateRange.end
  );
}

function copartTotals(filters: DashboardFilters): { entrantes: number; habilitados: number } {
  if (filters.geo !== "ALL") {
    const rows = (rawSnapshot.copartByUf ?? []).filter(
      (row) =>
        row.geo === filters.geo &&
        overlapDays(filters.dateRange.start, filters.dateRange.end, row.start, row.end) > 0
    );
    return {
      entrantes: sum(rows.map((row) => row.entrantes)),
      habilitados: sum(rows.map((row) => row.habilitados)),
    };
  }
  const days = copartDailyInRange(filters);
  if (days.length > 0) {
    return {
      entrantes: sum(days.map((row) => row.entrantes)),
      habilitados: sum(days.map((row) => row.habilitados)),
    };
  }
  const sep = copartSep2026();
  return { entrantes: sep.entrantes, habilitados: sep.habilitados };
}

function selectTotals(filters: DashboardFilters) {
  const weeks = (rawSnapshot.selectWeekly ?? []).filter(
    (row) => overlapDays(filters.dateRange.start, filters.dateRange.end, row.start, row.end) > 0
  );
  if (weeks.length === 0) {
    return { leads: 0, vendas: 0, entradas: 0 };
  }
  return {
    leads: sum(weeks.map((row) => row.leads)),
    vendas: sum(weeks.map((row) => row.vendas)),
    entradas: sum(weeks.map((row) => row.entradas)),
  };
}

function selectPageViewsInRange(journey: "comprar" | "vender", filters: DashboardFilters) {
  return sum(
    (rawSnapshot.selectPageViews ?? [])
      .filter(
        (row) =>
          row.journey === journey &&
          row.date >= filters.dateRange.start &&
          row.date <= filters.dateRange.end
      )
      .map((row) => row.pageViews)
  );
}

function metric(value: number, label: string, period: string): MetricValue {
  const formatted =
    Math.abs(value) >= 1_000_000
      ? `${(value / 1_000_000).toFixed(2).replace(".", ",")}M`
      : formatNumberFull(Math.round(value));
  return {
    value,
    formatted,
    delta: 0,
    deltaFormatted: "n/d",
    deltaType: "neutral",
    label,
    period,
  };
}

function ofUnit(unit: RawCampaign["unit"]): RawCampaign[] {
  return rawSnapshot.campaigns.filter((row) => row.unit === unit);
}

function paidChannelsForFilter(channel: DashboardFilters["channel"]): string[] | null {
  if (channel === "ALL") return null;
  if (channel === "GOOGLE") return ["Paid Search", "Cross-network"];
  if (channel === "META") return ["Paid Social"];
  return [];
}

const GOOGLE_UNIT_LABEL: Record<GoogleQuarterlyUnit, string> = {
  leilao_compra: "Leilão/Compra",
  select_venda: "Select/Venda",
  select_compra: "Select/Compra",
  select_mix: "Select (compra e venda)",
};

const GOOGLE_UNIT_ORDER: GoogleQuarterlyUnit[] = [
  "leilao_compra",
  "select_venda",
  "select_compra",
  "select_mix",
];

function googleUnitAllowed(unit: GoogleQuarterlyUnit, filters: DashboardFilters): boolean {
  if (filters.campaignType !== "ALL") {
    if (unit === filters.campaignType) return true;
    return unit === "select_mix" && (filters.campaignType === "select_venda" || filters.campaignType === "select_compra");
  }
  if (filters.funnel !== "ALL") {
    if (unit === "select_mix") return filters.funnel === "select_venda" || filters.funnel === "select_compra";
    return unitMatchesFunnel(unit, filters.funnel);
  }
  return true;
}

function pctDelta(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

const PAID_EVENT_LABEL: Record<string, string> = {
  cadastro_site: "Usuários com cadastro (pago)",
  register_to_bid: "Usuários que registraram para lance (pago)",
  click_bid_now: "Usuários que clicaram em dar lance (pago)",
  sign_in: "Usuários com login (pago)",
  lead_vmc: "Usuários com lead VMC (pago)",
  form_submit: "Usuários que enviaram formulário (pago)",
  lead_lp: "Usuários com lead landing (pago)",
};

const ACCOUNT_RESULT_LABEL: Record<string, string> = {
  cadastro: "Cadastro (pixel Meta)",
  conversion: "Conversões Google Ads",
  messaging: "Conversas WhatsApp",
  landing: "Visualizações da landing",
  link: "Cliques no anúncio",
};

const PAID_EVENT_ORDER = [
  "cadastro_site",
  "register_to_bid",
  "click_bid_now",
  "sign_in",
  "lead_vmc",
  "form_submit",
  "lead_lp",
];

function channelRow(
  channel: string,
  channelId: Channel,
  unit: RawCampaign["unit"],
  spend: number,
  entrantes: number,
  habilitados: number,
  volumeSource: string,
  convertedSource: string
): ChannelPerformance {
  return {
    channel,
    channelId,
    unit,
    entrantes,
    habilitados,
    taxa_habilitacao: entrantes === 0 || habilitados === 0 ? 0 : (habilitados / entrantes) * 100,
    custo_por_entrante: entrantes === 0 ? 0 : spend / entrantes,
    custo_por_habilitado: habilitados === 0 ? 0 : spend / habilitados,
    gasto: spend,
    volumeSource,
    convertedSource,
  };
}

function campaignStatus(row: RawCampaign): CampaignScorecard["status"] {
  if (row.spend > 0 && row.results <= 0 && row.clicks <= 0) return "critical";
  if (row.resultType === "cadastro" && row.results > 0 && row.spend / row.results > 25) return "below_target";
  if (row.resultType === "messaging" && row.results > 0 && row.spend / row.results > 20) return "below_target";
  if (row.spend > 0 && row.results <= 0) return "below_target";
  return "on_target";
}

function sliceDaily(series: { date: string; value: number }[], filters: DashboardFilters): { date: string; value: number }[] {
  return series.filter(
    (point) => point.date >= filters.dateRange.start && point.date <= filters.dateRange.end
  );
}

function mixId(ga4Channel: string): TrafficMixBucket["id"] {
  if (ga4Channel === "Direct") return "direct";
  if (ga4Channel.startsWith("Organic")) return "organic";
  if (
    ga4Channel.startsWith("Paid") ||
    ga4Channel === "Display" ||
    ga4Channel === "Cross-network"
  ) {
    return "paid";
  }
  return "other";
}

function unitsFromFilters(filters: DashboardFilters): RawCampaign["unit"][] {
  if (filters.campaignType !== "ALL") return [filters.campaignType];
  if (filters.funnel === "leilao") return ["leilao_compra"];
  if (filters.funnel === "select_venda") return ["select_venda"];
  if (filters.funnel === "select_compra") return ["select_compra"];
  return ["leilao_compra", "select_venda", "select_compra"];
}

export class RawExportDataService extends MockDataService {
  getDataOrigin(): DataOrigin {
    return "weekly_report";
  }

  async getOverviewKPIs(filters: DashboardFilters): Promise<OverviewKPIs> {
    const scale = mediaScale(filters);
    const unique = (rawSnapshot.ga4.countryActiveUsers.BR ?? 0) * scale;
    const novos = newUsersTotal() * scale;
    const period = "carga ago/2026 — sem período anterior";
    return {
      pageViews: metric(eventCount("page_view") * scale, "Page Views", period),
      visitantesUnicos: metric(unique, "Usuários ativos (BR)", period),
      novosUsuarios: metric(novos, "Novos usuários (first-user)", period),
      usuariosRetornantes: metric(Math.max(0, unique - novos), "Únicos − novos (derivado)", "não é returningUsers do GA4"),
      firstVisit: metric(eventCount("first_visit") * scale, "Primeira visita", "diagnóstico de site"),
      logins: metric(eventCount("sign_in") * scale, "Eventos sign_in (GA4)", period),
      favoritados: metric(eventCount("add_watchlist") * scale, "Favoritos", "intenção de site"),
      sessoes: metric(sum(Object.values(rawSnapshot.ga4.sessionChannels)) * scale, "Sessões", period),
      sessoesEngajadas: metric(eventCount("user_engagement") * scale, "Eventos user_engagement", "não é sessão engajada do GA4"),
      taxaRejeicao: {
        value: 0,
        formatted: "n/d",
        delta: 0,
        deltaFormatted: "n/d",
        deltaType: "neutral",
        label: "Taxa de rejeição",
        period: "não veio nesta extração GA4",
      },
      registrationStart: metric(eventCount("registration_start") * scale, "Início de cadastro (diagnóstico)", "não é etapa do Funil Leilão"),
      signIn: metric(eventCount("sign_in") * scale, "Sign-in", period),
    };
  }

  async getGoalProgress(filters: DashboardFilters): Promise<GoalProgress[]> {
    const m = mediaScale(filters);
    const copart = copartTotals(filters);
    const hasCopart = copartDailyInRange(filters).length > 0 || filters.geo !== "ALL";
    const sep = copartSep2026();
    const metaE = sep.metaEntrantes ?? GOALS.leilao_compra.entrantes_mensal;
    const metaH = sep.metaHabilitados ?? GOALS.leilao_compra.habilitados_mensal;
    const conversas = scaleNumber(
      sum(ofUnit("select_venda").map((row) => (row.resultType === "messaging" ? row.results : 0))),
      m
    );
    const select = selectTotals(filters);
    const convTarget = Math.round(GOALS.select_venda.conversas_semanal * (MEDIA_DAYS / 7));
    const leadsTarget = Math.round(GOALS.select_venda.conversas_semanal * 2);
    const vendasTarget = Math.round(GOALS.select_compra.vendas_semanal * 2);
    const goals: GoalProgress[] = [
      {
        title: hasCopart ? "Entrantes Copart — Leilão/Compra" : "Cadastro GA4 (evento) — proxy da meta de entrantes",
        current: hasCopart ? copart.entrantes : scaleNumber(cadastroSite(), m),
        target: metaE,
        percentage: (hasCopart ? copart.entrantes : scaleNumber(cadastroSite(), m)) / metaE * 100,
        delta: 0,
        deltaLabel: hasCopart ? "Copart Excel (executado no recorte)" : "Evento cadastro_site ago/2026 — não é Entrante Copart",
        deltaType: "neutral",
        unit: "leilao_compra",
      },
      {
        title: hasCopart ? "Habilitados Copart — Leilão/Compra" : "Habilitados (estimado) — taxa Copart set/2026",
        current: hasCopart ? copart.habilitados : scaleNumber(cadastroSite() * HIST_HAB_RATE, m),
        target: metaH,
        percentage: ((hasCopart ? copart.habilitados : scaleNumber(cadastroSite() * HIST_HAB_RATE, m)) / metaH) * 100,
        delta: 0,
        deltaLabel: hasCopart ? "Copart Excel (executado no recorte)" : "cadastro_site × 4.536/7.337 — não medido neste recorte",
        deltaType: "neutral",
        unit: "leilao_compra",
      },
      {
        title: "Conversas — Select/Venda (mídia)",
        current: conversas,
        target: convTarget,
        percentage: convTarget === 0 ? 0 : (conversas / convTarget) * 100,
        delta: 0,
        deltaLabel: "Meta Ads messaging ago/2026 — não é lead CRM",
        deltaType: "neutral",
        unit: "select_venda",
      },
      {
        title: "Leads — Copart Select",
        current: select.leads,
        target: leadsTarget,
        percentage: leadsTarget === 0 ? 0 : (select.leads / leadsTarget) * 100,
        delta: 0,
        deltaLabel: "Excel Copart Select (semanas no recorte)",
        deltaType: "neutral",
        unit: "select_venda",
      },
      {
        title: "Vendas — Copart Select",
        current: select.vendas,
        target: vendasTarget,
        percentage: vendasTarget === 0 ? 0 : (select.vendas / vendasTarget) * 100,
        delta: 0,
        deltaLabel: "Excel Copart Select — não é pixel Purchases",
        deltaType: "neutral",
        unit: "select_compra",
      },
    ];
    if (filters.campaignType === "ALL") return goals;
    return goals.filter((goal) => goal.unit === filters.campaignType);
  }

  async getWeeklyRegistrations(filters: DashboardFilters = parseDashboardFilters()): Promise<WeeklyRegistration[]> {
    const ratio = cadastroSite() / Math.max(newUsersTotal(), 1);
    const ga4Weeks = [
      { week: "01/08–07/08", start: "2026-08-01", end: "2026-08-07" },
      { week: "08/08–14/08", start: "2026-08-08", end: "2026-08-14" },
      { week: "15/08–21/08", start: "2026-08-15", end: "2026-08-21" },
      { week: "22/08–28/08", start: "2026-08-22", end: "2026-08-28" },
      { week: "29/08–31/08", start: "2026-08-29", end: "2026-08-31" },
    ]
      .filter(({ start, end }) => overlapDays(filters.dateRange.start, filters.dateRange.end, start, end) > 0)
      .map(({ week, start, end }) => {
        const novos = sum(
          rawSnapshot.ga4.dailyNewUsers
            .filter(
              (d) =>
                d.date >= start &&
                d.date <= end &&
                d.date >= filters.dateRange.start &&
                d.date <= filters.dateRange.end &&
                !(rawSnapshot.copartDaily ?? []).some((c) => c.date === d.date)
            )
            .map((d) => d.value)
        );
        const entrantes = scaleNumber(novos * ratio, 1);
        const habilitados = scaleNumber(entrantes * HIST_HAB_RATE, 1);
        return {
          week,
          entrantes,
          habilitados,
          taxa_habilitacao: entrantes === 0 ? 0 : (habilitados / entrantes) * 100,
        };
      });

    const copartDays = copartDailyInRange(filters);
    if (copartDays.length === 0) return ga4Weeks;

    const buckets = new Map<string, { week: string; entrantes: number; habilitados: number }>();
    for (const row of copartDays) {
      const ufWeek = (rawSnapshot.copartByUf ?? []).find((w) => row.date >= w.start && row.date <= w.end);
      const key = ufWeek?.week ?? row.date;
      const current = buckets.get(key) ?? { week: key, entrantes: 0, habilitados: 0 };
      current.entrantes += row.entrantes;
      current.habilitados += row.habilitados;
      buckets.set(key, current);
    }
    const copartWeeks = [...buckets.values()].map((row) => ({
      week: row.week,
      entrantes: row.entrantes,
      habilitados: row.habilitados,
      taxa_habilitacao: row.entrantes === 0 ? 0 : (row.habilitados / row.entrantes) * 100,
    }));
    const seen = new Set(copartWeeks.map((row) => row.week));
    return [...ga4Weeks.filter((row) => !seen.has(row.week)), ...copartWeeks];
  }

  async getFunnelData(type: Parameters<MockDataService["getFunnelData"]>[0], filters: DashboardFilters): Promise<FunnelData> {
    const m = mediaScale(filters);
    const copart = copartTotals(filters);
    const hasCopart = copartDailyInRange(filters).length > 0 || filters.geo !== "ALL";
    if (type === "leilao") {
      const entrantes = hasCopart ? copart.entrantes : scaleNumber(cadastroSite(), m);
      const habilitados = hasCopart ? copart.habilitados : scaleNumber(cadastroSite() * HIST_HAB_RATE, m);
      const licitantes = scaleNumber(habilitados * LICITANTE_RATE, 1);
      const arrematantes = scaleNumber(licitantes * ARREMATANTE_RATE, 1);
      const pageViews = scaleNumber(eventCount("page_view"), m);
      const official = hasCopart
        ? rateStages([
            { label: "Entrantes Copart", value: entrantes, description: "Excel Copart — cadastro oficial da unidade" },
            { label: "Habilitados Copart", value: habilitados, description: "Excel Copart — habilitação oficial da unidade" },
          ])
        : [
            { label: "Cadastro GA4 (evento)", value: entrantes, description: "Evento cadastro_site ago/2026, site inteiro — não é Entrante Copart" },
            { label: "Habilitados (estimado)", value: habilitados, description: "cadastro_site × taxa Copart 4.536/7.337 — não medido neste recorte" },
          ];
      return {
        type: "leilao",
        title: "Funil Leilão",
        subtitle: hasCopart
          ? "Etapas oficiais do Excel Copart. Page views GA4 ficam no diagnóstico de site."
          : "Recorte sem Excel Copart — cadastro GA4 como proxy. Licitantes e arrematantes não vieram nesta carga.",
        pageViews,
        stages: official,
        estimatedStages: [
          { label: "Licitantes (estimado)", value: licitantes, description: "40% dos habilitados — não veio nesta carga" },
          { label: "Arrematantes (estimado)", value: arrematantes, description: "45% dos licitantes — não veio nesta carga" },
        ],
      };
    }
    if (type === "select_venda") {
      const rows = ofUnit("select_venda");
      const pageViewsVender = selectPageViewsInRange("vender", filters);
      const conversas = scaleNumber(sum(rows.map((row) => (row.resultType === "messaging" ? row.results : row.conversas))), m);
      const qualificados = scaleNumber(sum(rows.map((row) => row.newConversas || 0)), m);
      const select = selectTotals(filters);
      const cadastroSitePath = select.entradas;
      const vistorias = scaleNumber(qualificados * 0.5, 1);
      const captados = scaleNumber(vistorias * 0.5, 1);
      return {
        type: "select_venda",
        title: "Funil Select/Venda",
        subtitle: "Site e WhatsApp se juntam em qualificados. Vistorias e captados não vieram nesta carga.",
        sitePath: [
          { label: "Page views (vender)", value: pageViewsVender, description: "GA4 da aba Select no Excel Copart" },
          { label: "Cadastro / entradas", value: cadastroSitePath, description: "Entradas Copart Select no Excel" },
        ],
        whatsappPath: [
          { label: "Conversas WhatsApp", value: conversas, description: "Mensagens Meta [Whats][Vender]" },
        ],
        joinStages: [
          { label: "Qualificados", value: qualificados, description: "Novos contatos de mensagem no Meta" },
        ],
        estimatedStages: [
          { label: "Vistorias (estimado)", value: vistorias, description: "50% dos qualificados — sem extração de vistoria" },
          { label: `${SELECT_VENDA_LAST_STAGE} (estimado)`, value: captados, description: "50% das vistorias — sem extração de captados" },
        ],
        stages: rateStages([
          { label: "Page views (vender)", value: pageViewsVender || conversas, description: "GA4 da aba Select no Excel Copart" },
          { label: "Conversas WhatsApp", value: conversas, description: "Mensagens iniciadas no Meta ([Whats][Vender])" },
          { label: "Qualificados", value: qualificados, description: "Novos contatos de mensagem no Meta" },
        ]),
      };
    }
    const rows = ofUnit("select_compra");
    const anuncios = scaleNumber(sum(rows.map((row) => row.impressions)), m);
    const views = scaleNumber(sum(rows.map((row) => (row.resultType === "landing" || row.resultType === "link" ? row.results : 0))), m);
    const select = selectTotals(filters);
    const pageViewsComprar = selectPageViewsInRange("comprar", filters);
    return {
      type: "select_compra",
      title: "Funil Select/Compra",
      subtitle: "Impressões de mídia ago/2026; leads e vendas do Excel Copart Select",
      stages: rateStages([
        { label: "Impressões (Select/Compra)", value: anuncios, description: "Impressões Meta + Google — não é estoque físico" },
        { label: "Page views (comprar)", value: pageViewsComprar || views, description: pageViewsComprar ? "GA4 Comprar no Excel Copart" : "Landing page views / cliques no Meta" },
        { label: "Leads", value: select.leads, description: "Excel Copart Select" },
        { label: SELECT_COMPRA_LAST_STAGE, value: select.vendas, description: "Excel Copart Select — pixel Purchases veio vazio" },
      ]),
    };
  }

  async getChannelPerformance(
    type: Parameters<MockDataService["getChannelPerformance"]>[0],
    filters: DashboardFilters
  ): Promise<ChannelPerformance[]> {
    const m = mediaScale(filters);
    const unit = type === "leilao" ? "leilao_compra" : type;
    const rows = ofUnit(unit);
    const meta = rows.filter((row) => row.source === "meta");
    const google = rows.filter((row) => row.source === "google");
    const cadastros = (list: RawCampaign[]) =>
      sum(list.map((row) => (row.resultType === "cadastro" ? row.results : 0)));
    const messaging = (list: RawCampaign[]) =>
      sum(list.map((row) => (row.resultType === "messaging" ? row.results : 0)));
    const conversions = (list: RawCampaign[]) => sum(list.map((row) => row.results));
    const spendOf = (list: RawCampaign[]) => scaleMoney(sum(list.map((row) => row.spend)), m);

    let table: ChannelPerformance[] = [];
    if (type === "leilao") {
      const totalNew = newUsersTotal();
      const organicShare = (rawSnapshot.ga4.firstUserChannels["Organic Search"] ?? 0) / totalNew;
      const directShare = (rawSnapshot.ga4.firstUserChannels.Direct ?? 0) / totalNew;
      const metaE = scaleNumber(cadastros(meta), m);
      const googleE = scaleNumber(conversions(google), m);
      const organicE = scaleNumber(cadastroSite() * organicShare, m);
      const directE = scaleNumber(cadastroSite() * directShare, m);
      table = [
        channelRow(
          "Meta Ads",
          "META",
          "leilao_compra",
          spendOf(meta),
          metaE,
          scaleNumber(metaE * HIST_HAB_RATE, 1),
          "Cadastro (pixel Meta)",
          "Habilitados (estimado, taxa Copart)"
        ),
        channelRow(
          "Google Ads",
          "GOOGLE",
          "leilao_compra",
          spendOf(google),
          googleE,
          scaleNumber(googleE * HIST_HAB_RATE, 1),
          "Conversões Google Ads",
          "Habilitados (estimado, taxa Copart)"
        ),
        channelRow(
          "Orgânico",
          "ORGANIC",
          "leilao_compra",
          0,
          organicE,
          scaleNumber(organicE * HIST_HAB_RATE, 1),
          "Cadastro GA4 × first-touch orgânico",
          "Habilitados (estimado, taxa Copart)"
        ),
        channelRow(
          "Direto",
          "DIRECT",
          "leilao_compra",
          0,
          directE,
          scaleNumber(directE * HIST_HAB_RATE, 1),
          "Cadastro GA4 × first-touch direto",
          "Habilitados (estimado, taxa Copart)"
        ),
      ].sort((a, b) => b.entrantes - a.entrantes);
    } else if (type === "select_venda") {
      const metaE = scaleNumber(messaging(meta) || sum(meta.map((row) => row.clicks)), m);
      const googleE = scaleNumber(conversions(google), m);
      const metaH = scaleNumber(sum(meta.map((row) => row.newConversas)), m);
      table = [
        channelRow(
          "Meta Ads",
          "META",
          "select_venda",
          spendOf(meta),
          metaE,
          metaH,
          "Conversas WhatsApp (Meta)",
          "Novos contatos (Meta)"
        ),
        channelRow(
          "Google Ads",
          "GOOGLE",
          "select_venda",
          spendOf(google),
          googleE,
          0,
          "Conversões Google Ads",
          "Sem avanço nativo nesta carga"
        ),
      ];
    } else {
      const metaE = scaleNumber(sum(meta.map((row) => (row.resultType === "landing" || row.resultType === "link" ? row.results : 0))), m);
      const googleE = scaleNumber(sum(google.map((row) => row.clicks)), m);
      const metaH = scaleNumber(cadastros(meta), m);
      table = [
        channelRow(
          "Meta Ads",
          "META",
          "select_compra",
          spendOf(meta),
          metaE,
          metaH,
          "Visualizações da landing (Meta)",
          "Cadastro (pixel Meta)"
        ),
        channelRow(
          "Google Ads",
          "GOOGLE",
          "select_compra",
          spendOf(google),
          googleE,
          scaleNumber(conversions(google), m),
          "Cliques Google Ads",
          "Conversões Google Ads"
        ),
      ];
    }
    if (filters.channel === "ALL") return table;
    return table.filter((row) => row.channelId === filters.channel);
  }

  async getCampaignScorecards(filters: DashboardFilters): Promise<CampaignScorecard[]> {
    const m = mediaScale(filters);
    return rawSnapshot.campaigns
      .filter((row) => filters.campaignType === "ALL" || row.unit === filters.campaignType)
      .filter((row) => filters.channel === "ALL" || row.source.toUpperCase() === filters.channel)
      .filter((row) => filters.campaign === "ALL" || campaignLabel(row) === filters.campaign)
      .filter((row) => filters.funnel === "ALL" || unitMatchesFunnel(row.unit, filters.funnel))
      .map((row) => {
        const spend = scaleMoney(row.spend, m);
        const clicks = scaleNumber(row.clicks, m);
        const impressions = scaleNumber(row.impressions, m);
        const entrantes =
          row.resultType === "cadastro" || row.resultType === "conversion"
            ? scaleNumber(row.results, m)
            : 0;
        const conversas = row.resultType === "messaging" ? scaleNumber(row.results, m) : row.conversas ? scaleNumber(row.conversas, m) : null;
        const nativeResults = scaleNumber(row.results, m);
        return {
          campaign_name: campaignLabel(row),
          channel: (row.source === "meta" ? "META" : "GOOGLE") as Channel,
          campaign_type: row.unit,
          impressions,
          clicks,
          ctr: impressions === 0 ? 0 : (clicks / impressions) * 100,
          entrantes,
          habilitados: row.resultType === "cadastro" ? scaleNumber(row.results * HIST_HAB_RATE, m) : null,
          taxa_habilitacao: row.resultType === "cadastro" ? HIST_HAB_RATE * 100 : null,
          spend,
          cpc: clicks === 0 ? null : spend / clicks,
          custo_por_entrante: nativeResults === 0 ? 0 : spend / nativeResults,
          conversas,
          status: campaignStatus(row),
          owner: MEDIA_OWNER,
          resultLabel: ACCOUNT_RESULT_LABEL[row.resultType] ?? "Resultado da conta",
          nativeResults,
        };
      })
      .sort((a, b) => b.spend - a.spend);
  }

  async getAttributionComparison(filters: DashboardFilters): Promise<AttributionComparison[]> {
    const cards = await this.getCampaignScorecards(filters);
    return cards
      .filter((row) => row.entrantes > 0 || (row.conversas ?? 0) > 0)
      .map((row) => {
        const value = row.entrantes || row.conversas || 0;
        return {
          campaign_name: row.campaign_name,
          unit: row.campaign_type,
          first_touch: value,
          last_touch: value,
          linear: value,
          time_decay: value,
        };
      });
  }

  async getFunnelStageAttribution(filters: DashboardFilters): Promise<FunnelStageAttribution[]> {
    const leilao = await this.getFunnelData("leilao", filters);
    const venda = await this.getFunnelData("select_venda", filters);
    const compra = await this.getFunnelData("select_compra", filters);
    const cards = await this.getCampaignScorecards(filters);
    const pack = (unit: CampaignScorecard["campaign_type"], stages: FunnelStage[]) => {
      const subset = cards.filter((row) => row.campaign_type === unit);
      const weightSum = sum(subset.map((row) => row.spend || row.entrantes || 1));
      return subset.map((row) => {
        const weight = (row.spend || row.entrantes || 1) / weightSum;
        return {
          campaign_name: row.campaign_name,
          channel: row.channel,
          unit,
          stages: Object.fromEntries(stages.map((stage) => [stage.label, scaleNumber(stage.value * weight, 1)])),
        };
      });
    };
    return [
      ...pack("leilao_compra", leilao.stages),
      ...pack("select_venda", venda.stages),
      ...pack("select_compra", compra.stages),
    ];
  }

  async getAlerts(): Promise<Alert[]> {
    const sep = copartSep2026();
    const through = copartDailyInRange({
      ...parseDashboardFilters(),
      dateRange: { start: "2026-09-01", end: rawSnapshot.copartEnd },
    });
    const sepEntrantes = sum(through.map((row) => row.entrantes)) || sep.entrantes;
    const lastDay = through.at(-1)?.date ?? rawSnapshot.copartEnd;
    const dayNum = Number(lastDay.slice(8));
    const expectedPace = Math.round((dayNum / 30) * 100);
    const actualPace = sep.metaEntrantes ? Math.round((sepEntrantes / sep.metaEntrantes) * 100) : 0;
    const whats = rawSnapshot.campaigns.find((row) => row.name.includes("[Whats][Vender]"));
    return [
      {
        id: "alert-copart-pace",
        severity: actualPace + 5 < expectedPace ? "warning" : "info",
        title: "Ritmo de entrantes Copart (set/2026)",
        description: `Série diária até ${lastDay.slice(8)}/09: ${sepEntrantes} entrantes (${actualPace}% da meta ${sep.metaEntrantes}). Em ${dayNum}/30 dias o ritmo linear seria ~${expectedPace}%.`,
        metric: "Entrantes",
        expected: `${expectedPace}% no dia ${dayNum}`,
        action: "Acompanhar cadastro pago vs orgânico na segunda quinzena",
        responsavel: MEDIA_OWNER,
        timestamp: `${lastDay}T11:00:00Z`,
        isMedia: true,
      },
      {
        id: "alert-meta-ga4-cadastro",
        severity: "critical",
        title: "Pixel Meta vs GA4 cadastro_site",
        description: `Meta atribuiu ${Math.round(sum(rawSnapshot.campaigns.filter((r) => r.resultType === "cadastro").map((r) => r.results)))} cadastros; GA4 registrou ${cadastroSite()} eventos cadastro_site no mesmo mês de mídia.`,
        metric: "Cadastros",
        expected: "Discrepância < 15%",
        action: "Auditar Cadastro_site no pixel e no GA4",
        responsavel: MEDIA_OWNER,
        timestamp: "2026-08-31T11:00:00Z",
        isMedia: true,
      },
      ...(whats && whats.results > 0
        ? [
            {
              id: "alert-select-cpa",
              severity: "info" as const,
              title: "CPA de conversas Select/Venda",
              description: `R$ ${(whats.spend / whats.results).toFixed(2)} por conversa Meta (${whats.results} mensagens, R$ ${whats.spend.toFixed(2)}). Lead CRM do Excel é outra métrica.`,
              metric: "CPA conversa",
              expected: "Custo por conversa sob revisão",
              action: "Não misturar conversa Meta com lead Copart Select",
              responsavel: MEDIA_OWNER,
              timestamp: "2026-08-31T11:00:00Z",
              isMedia: true,
            },
          ]
        : []),
    ];
  }

  async getDataDiscrepancies(): Promise<DataDiscrepancy[]> {
    const metaCad = sum(rawSnapshot.campaigns.filter((row) => row.resultType === "cadastro").map((row) => row.results));
    const ga4Cad = cadastroSite();
    const gap = ga4Cad === 0 ? 0 : (Math.abs(ga4Cad - metaCad) / ga4Cad) * 100;
    return [
      { source_a: "Meta Ads (pixel Cadastro_site)", source_b: "GA4 cadastro_site", discrepancy: gap, sla: 15, status: "critical" },
      { source_a: "Copart Excel set/2026", source_b: "GA4 ago/2026", discrepancy: 100, sla: 15, status: "warning" },
    ];
  }

  async getRecommendations(): Promise<ActionRecommendation[]> {
    const cadastro = rawSnapshot.campaigns.find((row) => row.name.includes("[Cadastro]Leilão"));
    const whats = rawSnapshot.campaigns.find((row) => row.name.includes("[Whats][Vender]"));
    const select = selectTotals(parseDashboardFilters({ start: "2026-08-30", end: "2026-09-14" }));
    return [
      {
        id: "rec-1",
        priority: 1,
        title: "Auditar cadastro Meta vs GA4",
        campaign: cadastro?.name,
        reason: `GA4 ${cadastroSite()} cadastro_site vs pixel ${cadastro?.results ?? 0} na campanha de cadastro.`,
        impact: "Atribuição de Leilão/Compra confiável",
        responsavel: MEDIA_OWNER,
        deadline: "Próxima segunda",
        isMedia: true,
      },
      {
        id: "rec-2",
        priority: 2,
        title: whats && whats.results > 0 ? "Não misturar CPA de conversa com lead Select" : "Revisar mensagens Select/Venda",
        campaign: whats?.name,
        reason: whats && whats.results > 0
          ? `R$ ${(whats.spend / whats.results).toFixed(2)} por conversa Meta. O Excel Copart traz ${select.leads} leads e ${select.vendas} vendas nas duas primeiras semanas.`
          : "Sem volume de mensagem no recorte.",
        impact: "Leitura correta de Select/Venda",
        budget_change: undefined,
        responsavel: MEDIA_OWNER,
        deadline: "Próxima terça",
        isMedia: true,
      },
      {
        id: "rec-3",
        priority: 3,
        title: "Pedir licitantes, arrematantes e vistorias ao ERP",
        reason: `Vendas Select já vieram no Excel (${select.vendas}). Funil Leilão ainda estima licitantes/arrematantes; Select/Venda ainda estima vistoria e captados.`,
        impact: "Funis 100% reais nas etapas finais",
        responsavel: "Vitória",
        deadline: "Próxima quarta",
        isMedia: false,
      },
    ];
  }

  async getTrafficSources(): Promise<TrafficSource[]> {
    return Object.entries(rawSnapshot.ga4.sessionChannels)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([source, sessions]) => ({
        source: GA4_CHANNEL_LABEL[source] ?? source,
        maio: Math.round(rawSnapshot.ga4.firstUserChannels[source] ?? 0),
        junho: Math.round(sessions),
      }));
  }

  async getTrafficMix(filters: DashboardFilters): Promise<TrafficMixBucket[]> {
    const m = mediaScale(filters);
    const labels: Record<TrafficMixBucket["id"], string> = {
      direct: "Direto",
      organic: "Orgânico",
      paid: "Pago",
      other: "Outros",
    };
    const sessionsTotal = sum(Object.values(rawSnapshot.ga4.sessionChannels));
    const newUsers = newUsersTotal();
    const acc: Record<TrafficMixBucket["id"], { sessions: number; newUsers: number }> = {
      direct: { sessions: 0, newUsers: 0 },
      organic: { sessions: 0, newUsers: 0 },
      paid: { sessions: 0, newUsers: 0 },
      other: { sessions: 0, newUsers: 0 },
    };
    for (const [key, value] of Object.entries(rawSnapshot.ga4.sessionChannels)) {
      acc[mixId(key)].sessions += value;
    }
    for (const [key, value] of Object.entries(rawSnapshot.ga4.firstUserChannels)) {
      acc[mixId(key)].newUsers += value;
    }
    const order: TrafficMixBucket["id"][] = ["direct", "organic", "paid", "other"];
    return order.map((id) => ({
      id,
      label: labels[id],
      sessions: scaleNumber(acc[id].sessions, m),
      newUsers: scaleNumber(acc[id].newUsers, m),
      shareSessions: sessionsTotal === 0 ? 0 : (acc[id].sessions / sessionsTotal) * 100,
      shareNewUsers: newUsers === 0 ? 0 : (acc[id].newUsers / newUsers) * 100,
    }));
  }

  async getVolumeRanking(filters: DashboardFilters): Promise<VolumeRankRow[]> {
    const m = mediaScale(filters);
    const totalNew = newUsersTotal();
    const cadastro = cadastroSite();
    const target = GOALS.leilao_compra.entrantes_mensal;
    return Object.entries(rawSnapshot.ga4.firstUserChannels)
      .map(([source, count]) => {
        const share = totalNew === 0 ? 0 : count / totalNew;
        const entrantes = scaleNumber(cadastro * share, m);
        return {
          channel: GA4_CHANNEL_LABEL[source] ?? source,
          channelId: source,
          entrantes,
          shareOfCadastro: share * 100,
          contributionToGoal: (entrantes / target) * 100,
        };
      })
      .filter((row) => row.entrantes > 0)
      .sort((a, b) => b.entrantes - a.entrantes);
  }

  async getMediaEfficiency(filters: DashboardFilters): Promise<MediaEfficiencyRow[]> {
    const m = mediaScale(filters);
    const units = unitsFromFilters(filters);
    const rows: MediaEfficiencyRow[] = [];
    for (const unit of units) {
      const unitRows = ofUnit(unit);
      const meta = unitRows.filter((row) => row.source === "meta");
      const google = unitRows.filter((row) => row.source === "google");
      const metaSpend = scaleMoney(sum(meta.map((row) => row.spend)), m);
      const googleSpend = scaleMoney(sum(google.map((row) => row.spend)), m);
      const unitSpend = metaSpend + googleSpend;
      const metaResults =
        unit === "select_venda"
          ? scaleNumber(sum(meta.map((row) => (row.resultType === "messaging" ? row.results : 0))), m)
          : scaleNumber(sum(meta.map((row) => (row.resultType === "cadastro" ? row.results : 0))), m);
      const googleResults = scaleNumber(sum(google.map((row) => row.results)), m);
      const metaLabel =
        unit === "select_venda" ? "Conversas (pixel Meta)" : "Cadastro (pixel Meta)";
      rows.push({
        channel: "META",
        channelLabel: "Meta Ads",
        unit,
        spend: metaSpend,
        nativeResults: metaResults,
        resultLabel: metaLabel,
        cpa: metaResults === 0 ? 0 : metaSpend / metaResults,
        volumeShare: unitSpend === 0 ? 0 : (metaSpend / unitSpend) * 100,
      });
      rows.push({
        channel: "GOOGLE",
        channelLabel: "Google Ads",
        unit,
        spend: googleSpend,
        nativeResults: googleResults,
        resultLabel: "Conversões (Google Ads)",
        cpa: googleResults === 0 ? 0 : googleSpend / googleResults,
        volumeShare: unitSpend === 0 ? 0 : (googleSpend / unitSpend) * 100,
      });
    }
    return rows.filter((row) => row.spend > 0 || row.nativeResults > 0);
  }

  async getTrendData(metricName: string, days: number, filters: DashboardFilters): Promise<{ date: string; value: number }[]> {
    const copartDays = copartDailyInRange(filters);
    if ((metricName === "entrantes" || metricName === "habilitados") && copartDays.length > 0) {
      return copartDays.slice(0, days).map((row) => ({
        date: row.date,
        value: metricName === "habilitados" ? row.habilitados : row.entrantes,
      }));
    }
    const series =
      metricName === "novos" || metricName === "novosUsuarios"
        ? rawSnapshot.ga4.dailyNewUsers
        : rawSnapshot.ga4.dailyActiveUsers;
    const sliced = sliceDaily(series, filters).slice(0, days);
    const ratio = cadastroSite() / Math.max(newUsersTotal(), 1);
    const spend = sum(rawSnapshot.campaigns.map((row) => row.spend));
    return sliced.map((point) => {
      if (metricName === "taxa_habilitacao") return { date: point.date, value: Math.round(HIST_HAB_RATE * 10000) / 100 };
      if (metricName === "entrantes") return { date: point.date, value: Math.round(point.value * ratio) };
      if (metricName === "habilitados") return { date: point.date, value: Math.round(point.value * ratio * HIST_HAB_RATE) };
      if (metricName === "custo_por_entrante") return { date: point.date, value: cadastroSite() === 0 ? 0 : spend / cadastroSite() };
      if (metricName === "conversas") return { date: point.date, value: 0 };
      return { date: point.date, value: Math.round(point.value) };
    });
  }

  async getChannelGoals(filters: DashboardFilters): Promise<{ channels: ChannelGoal[]; overall: OverallGoalSummary }> {
    const m = mediaScale(filters);
    const c = copartScale(filters);
    const sep = copartSep2026();
    const useCopart = c >= m && c > 0;
    const overallEntrantes = useCopart ? scaleNumber(sep.entrantes, c) : scaleNumber(cadastroSite(), m);
    const overallHab = useCopart ? scaleNumber(sep.habilitados, c) : scaleNumber(cadastroSite() * HIST_HAB_RATE, m);
    const metaE = sep.metaEntrantes ?? GOALS.leilao_compra.entrantes_mensal;
    const metaH = sep.metaHabilitados ?? GOALS.leilao_compra.habilitados_mensal;
    const totalNew = newUsersTotal();
    const share = (key: string) => (rawSnapshot.ga4.firstUserChannels[key] ?? 0) / totalNew;
    const leilaoMeta = ofUnit("leilao_compra").filter((row) => row.source === "meta");
    const leilaoGoogle = ofUnit("leilao_compra").filter((row) => row.source === "google");
    const metaEntrantes = scaleNumber(sum(leilaoMeta.map((row) => (row.resultType === "cadastro" ? row.results : 0))), m);
    const googleEntrantes = scaleNumber(sum(leilaoGoogle.map((row) => row.results)), m);
    const seoE = scaleNumber(cadastroSite() * share("Organic Search"), m);
    const igE = scaleNumber(cadastroSite() * share("Organic Social"), m);
    const rdE = scaleNumber(eventCount("RD Formulario Embutido") + eventCount("RD Landing Pages"), m);
    const blipE = scaleNumber(sum(ofUnit("select_venda").map((row) => (row.resultType === "messaging" ? row.results : 0))), m);
    const mk = (
      id: MarketingChannel,
      currentE: number,
      currentH: number,
      hasData: boolean,
      sourceNote: string
    ): ChannelGoal => {
      const cfg = MARKETING_CHANNEL_CONFIG[id];
      return {
        channel: id,
        channelLabel: cfg.label,
        color: cfg.color,
        icon: cfg.icon,
        metrics: {
          entrantes: {
            current: currentE,
            target: metaE,
            percentage: metaE === 0 ? 0 : (currentE / metaE) * 100,
          },
          habilitados: {
            current: currentH,
            target: metaH,
            percentage: metaH === 0 ? 0 : (currentH / metaH) * 100,
          },
        },
        delta: 0,
        deltaType: "neutral",
        hasData,
        sourceNote,
      };
    };
    const blipTarget = Math.round(GOALS.select_venda.conversas_semanal * (MEDIA_DAYS / 7));
    const channels: ChannelGoal[] = [
      mk("META_ADS", metaEntrantes, scaleNumber(metaEntrantes * HIST_HAB_RATE, 1), true, "Cadastro pixel Meta — Leilão"),
      mk("GOOGLE_ADS", googleEntrantes, scaleNumber(googleEntrantes * HIST_HAB_RATE, 1), true, "Conversões Google Ads — Leilão"),
      mk("SEO", seoE, scaleNumber(seoE * HIST_HAB_RATE, 1), true, "cadastro_site × first-touch busca orgânica"),
      mk("INSTAGRAM_ORGANIC", igE, scaleNumber(igE * HIST_HAB_RATE, 1), igE > 0, "cadastro_site × first-touch social orgânico"),
      mk("FACEBOOK_ORGANIC", 0, 0, false, "Sem extração nesta carga"),
      mk("TIKTOK", 0, 0, false, "Sem extração nesta carga"),
      mk("RD_STATION", rdE, scaleNumber(eventCount("RD Formulario Embutido"), m), rdE > 0, "Eventos GA4 de formulário RD"),
      {
        ...mk("BLIP", blipE, scaleNumber(sum(ofUnit("select_venda").map((row) => row.newConversas)), m), blipE > 0, "Mensagens Meta — Select/Venda"),
        metrics: {
          entrantes: {
            current: blipE,
            target: blipTarget,
            percentage: blipTarget === 0 ? 0 : (blipE / blipTarget) * 100,
          },
          habilitados: {
            current: scaleNumber(sum(ofUnit("select_venda").map((row) => row.newConversas)), m),
            target: Math.round(GOALS.select_venda.avaliacoes_semanal * (MEDIA_DAYS / 7)),
            percentage: 0,
          },
        },
      },
    ];
    const blip = channels[channels.length - 1];
    blip.metrics.habilitados.percentage =
      blip.metrics.habilitados.target === 0
        ? 0
        : (blip.metrics.habilitados.current / blip.metrics.habilitados.target) * 100;
    return {
      channels,
      overall: {
        entrantes: { current: overallEntrantes, target: metaE, percentage: (overallEntrantes / metaE) * 100 },
        habilitados: { current: overallHab, target: metaH, percentage: (overallHab / metaH) * 100 },
        entrantesTitle: useCopart ? "Entrantes Copart" : "Cadastro GA4 (evento) — proxy da meta",
        habilitadosTitle: useCopart ? "Habilitados Copart" : "Habilitados (estimado, taxa set/2026)",
      },
    };
  }

  async getConversionPaths(filters: ConversionPathFilters): Promise<ConversionPath[]> {
    const paths: ConversionPath[] = Object.entries(rawSnapshot.ga4.firstUserChannels)
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => {
        const label = GA4_CHANNEL_LABEL[source] ?? source;
        return {
          id: source,
          userId: "agregado-ga4",
          conversionType: "entrante" as const,
          conversionDate: "2026-08-31",
          touchpoints: [
            { channel: label, source, timestamp: "2026-08-01", type: "visit" as const },
          ],
          totalTouchpoints: 1,
          daysToConversion: 0,
          firstChannel: label,
          lastChannel: label,
          value: Math.round(count),
        };
      });
    let filtered = paths;
    if (filters.conversionType !== "ALL") {
      filtered = filtered.filter((path) => path.conversionType === filters.conversionType);
    }
    if (filters.channelInPath !== "ALL") {
      const label = MARKETING_CHANNEL_CONFIG[filters.channelInPath]?.label;
      if (label) {
        filtered = filtered.filter((path) => path.firstChannel === label || path.touchpoints.some((t) => t.channel === label));
      }
    }
    return filtered.filter(
      (path) => path.totalTouchpoints >= filters.minTouchpoints && path.totalTouchpoints <= filters.maxTouchpoints
    );
  }

  async getJourneyInsights(_filters?: DashboardFilters): Promise<JourneyInsights> {
    const entries = Object.entries(rawSnapshot.ga4.firstUserChannels).sort((a, b) => b[1] - a[1]);
    const total = sum(entries.map(([, n]) => n));
    const cad = cadastroSite();
    const merged = new Map<string, { count: number; habilitados: number }>();
    for (const [source, count] of entries) {
      const pattern = GA4_CHANNEL_LABEL[source] ?? source;
      const share = count / total;
      const current = merged.get(pattern) ?? { count: 0, habilitados: 0 };
      current.count += Math.round(count);
      current.habilitados += scaleNumber(cad * share * HIST_HAB_RATE, 1);
      merged.set(pattern, current);
    }
    const ranked = [...merged.entries()].map(([pattern, stats]) => ({
      pattern,
      count: stats.count,
      habilitados: stats.habilitados,
      share: total === 0 ? 0 : (stats.count / total) * 100,
    }));
    const channelShare = ranked.map((row) => ({
      channel: row.pattern,
      appearances: row.count,
      journeys: row.count,
      share: row.share,
    }));
    return {
      totalJourneys: Math.round(total),
      habilitados: scaleNumber(cad * HIST_HAB_RATE, 1),
      taxaHabilitacao: HIST_HAB_RATE * 100,
      avgTouchpoints: 1,
      frequent: [...ranked].sort((a, b) => b.count - a.count).slice(0, 5),
      byHabilitados: [...ranked].sort((a, b) => b.habilitados - a.habilitados).slice(0, 5),
      channelShare,
    };
  }

  async getRegionalPerformance(filters: DashboardFilters): Promise<RegionalRow[]> {
    const weeks = (rawSnapshot.copartByUf ?? []).filter(
      (row) => overlapDays(filters.dateRange.start, filters.dateRange.end, row.start, row.end) > 0
    );
    const byGeo = new Map<string, { entrantes: number; habilitados: number }>();
    for (const row of weeks) {
      const current = byGeo.get(row.geo) ?? { entrantes: 0, habilitados: 0 };
      current.entrantes += row.entrantes;
      current.habilitados += row.habilitados;
      byGeo.set(row.geo, current);
    }
    const extras = [
      { geo: "OUTROS", label: "Outros" },
      { geo: "VAZIAS", label: "Sem UF (Vazias)" },
    ];
    const ufs = BRAZIL_UFS.map((uf) => ({ geo: uf.id, label: uf.label }));
    const rows = [...ufs, ...extras]
      .filter((item) => filters.geo === "ALL" || filters.geo === item.geo)
      .map((item) => {
        const stats = byGeo.get(item.geo) ?? { entrantes: 0, habilitados: 0 };
        const population = IBGE_POPULATION_2024[item.geo] ?? 0;
        const per100k = population / 100_000;
        return {
          geo: item.geo,
          label: item.label,
          entrantes: stats.entrantes,
          habilitados: stats.habilitados,
          taxa_habilitacao: stats.entrantes === 0 ? 0 : (stats.habilitados / stats.entrantes) * 100,
          gasto: 0,
          weight: 0,
          population,
          perCapitaEntrantes: per100k === 0 ? 0 : stats.entrantes / per100k,
          perCapitaHabilitados: per100k === 0 ? 0 : stats.habilitados / per100k,
          source: stats.entrantes > 0 || stats.habilitados > 0 ? ("copart_excel" as const) : ("empty" as const),
        };
      });
    return rows.sort((a, b) => b.entrantes - a.entrantes || a.label.localeCompare(b.label, "pt-BR"));
  }

  async getEvolutionSeries(filters: DashboardFilters): Promise<EvolutionSeriesPoint[]> {
    const dates = new Set<string>();
    for (const row of copartDailyInRange(filters)) dates.add(row.date);
    for (const row of sliceDaily(rawSnapshot.ga4.dailyActiveUsers, filters)) dates.add(row.date);
    for (const row of rawSnapshot.selectPageViews ?? []) {
      if (row.date >= filters.dateRange.start && row.date <= filters.dateRange.end) dates.add(row.date);
    }
    const copart = new Map(copartDailyInRange(filters).map((row) => [row.date, row]));
    const ga4 = new Map(sliceDaily(rawSnapshot.ga4.dailyActiveUsers, filters).map((row) => [row.date, row.value]));
    const comprar = new Map(
      (rawSnapshot.selectPageViews ?? [])
        .filter((row) => row.journey === "comprar")
        .map((row) => [row.date, row.pageViews])
    );
    const vender = new Map(
      (rawSnapshot.selectPageViews ?? [])
        .filter((row) => row.journey === "vender")
        .map((row) => [row.date, row.pageViews])
    );
    const leadsByDate = new Map<string, number>();
    for (const week of rawSnapshot.selectWeekly ?? []) {
      if (overlapDays(filters.dateRange.start, filters.dateRange.end, week.start, week.end) > 0) {
        leadsByDate.set(week.end, week.leads);
      }
    }
    return [...dates]
      .sort()
      .map((date) => {
        const [y, m, d] = date.split("-");
        return {
          date,
          label: `${d}/${m}`,
          entrantes: copart.get(date)?.entrantes ?? 0,
          habilitados: copart.get(date)?.habilitados ?? 0,
          pageViewsGa4: Math.round(ga4.get(date) ?? 0),
          pageViewsComprar: comprar.get(date) ?? 0,
          pageViewsVender: vender.get(date) ?? 0,
          leads: leadsByDate.get(date) ?? 0,
        };
      });
  }

  async getKpiEvolution(filters: DashboardFilters, grain: "weekly" | "monthly"): Promise<KpiEvolutionPoint[]> {
    const m = mediaScale(filters);
    if (grain === "monthly") {
      const set25 = rawSnapshot.copartMonthly.find((row) => row.year === 2025)!;
      const set26 = copartSep2026();
      const spend = scaleMoney(sum(rawSnapshot.campaigns.map((row) => row.spend)), m);
      return [
        { period: "Set/25", platform: "Habilitados", entrantes: set25.entrantes, habilitados: set25.habilitados, gasto: 0 },
        {
          period: "Ago/26",
          platform: "Habilitados",
          entrantes: scaleNumber(cadastroSite(), m),
          habilitados: scaleNumber(cadastroSite() * HIST_HAB_RATE, m),
          gasto: spend,
        },
        { period: "Set/26", platform: "Habilitados", entrantes: set26.entrantes, habilitados: set26.habilitados, gasto: 0 },
      ];
    }
    const weeks = await this.getWeeklyRegistrations(filters);
    return weeks.map((week) => ({
      period: week.week,
      platform: week.week.includes("/09") || week.week.startsWith("30/08") ? "Cadastro (Copart)" : "Cadastro (GA4)",
      entrantes: week.entrantes,
      habilitados: week.habilitados,
      gasto: 0,
    }));
  }

  async getPaidMediaEvents(filters: DashboardFilters): Promise<PaidMediaEventsReport> {
    const extract = rawSnapshot.ga4PaidKeyEvents;
    const empty: PaidMediaEventsReport = {
      overlapDays: 0,
      sourceDays: extract?.days ?? 93,
      scale: 0,
      start: extract?.start ?? "2026-06-15",
      end: extract?.end ?? "2026-09-15",
      compareStart: extract?.compareStart ?? "2026-03-14",
      compareEnd: extract?.compareEnd ?? "2026-06-14",
      totalUsers: { current: 0, previous: 0, delta: 0 },
      events: [],
      channels: [],
    };
    if (!extract) return empty;
    const overlap = overlapDays(filters.dateRange.start, filters.dateRange.end, extract.start, extract.end);
    const scale = overlap / Math.max(extract.days, 1);
    const allowed = paidChannelsForFilter(filters.channel);
    const rows = extract.rows.filter((row) => (allowed === null ? true : allowed.includes(row.channel)));
    const apply = (value: number) => scaleNumber(value, scale);
    const byEvent = new Map<string, { current: number; previous: number }>();
    for (const row of rows) {
      const current = byEvent.get(row.event) ?? { current: 0, previous: 0 };
      current.current += row.current;
      current.previous += row.previous;
      byEvent.set(row.event, current);
    }
    const events = PAID_EVENT_ORDER.filter((event) => byEvent.has(event)).map((event) => {
      const raw = byEvent.get(event)!;
      const current = apply(raw.current);
      const previous = apply(raw.previous);
      return {
        event,
        label: PAID_EVENT_LABEL[event] ?? event,
        current,
        previous,
        delta: pctDelta(current, previous),
      };
    });
    const channels = rows
      .map((row) => ({
        channel: row.channel,
        channelLabel: GA4_CHANNEL_LABEL[row.channel] ?? row.channel,
        event: row.event,
        current: apply(row.current),
        previous: apply(row.previous),
      }))
      .sort((a, b) => b.current - a.current);
    const totalCurrent = apply(allowed === null ? extract.totalUsers.current : sum(rows.map((row) => row.current)));
    const totalPrevious = apply(allowed === null ? extract.totalUsers.previous : sum(rows.map((row) => row.previous)));
    return {
      overlapDays: overlap,
      sourceDays: extract.days,
      scale,
      start: extract.start,
      end: extract.end,
      compareStart: extract.compareStart,
      compareEnd: extract.compareEnd,
      totalUsers: {
        current: totalCurrent,
        previous: totalPrevious,
        delta: pctDelta(totalCurrent, totalPrevious),
      },
      events,
      channels,
    };
  }

  async getGoogleQuarterly(filters: DashboardFilters): Promise<GoogleQuarterlyReport> {
    const extract = rawSnapshot.googleQuarterly;
    const empty: GoogleQuarterlyReport = {
      overlapDays: 0,
      sourceDays: extract?.days ?? 93,
      scale: 0,
      start: extract?.start ?? "2026-06-15",
      end: extract?.end ?? "2026-09-15",
      compareStart: extract?.compareStart ?? "2026-03-14",
      compareEnd: extract?.compareEnd ?? "2026-06-14",
      totals: {
        spend: { current: 0, previous: 0, delta: 0 },
        conversions: { current: 0, previous: 0, delta: 0 },
        clicks: { current: 0, previous: 0, delta: 0 },
        impressions: { current: 0, previous: 0, delta: 0 },
      },
      byType: [],
      byUnit: [],
      campaigns: [],
    };
    if (!extract) return empty;
    if (filters.channel !== "ALL" && filters.channel !== "GOOGLE") return empty;
    const overlap = overlapDays(filters.dateRange.start, filters.dateRange.end, extract.start, extract.end);
    if (overlap === 0) return empty;
    const scale = overlap / Math.max(extract.days, 1);
    const allowed = extract.campaigns.filter((row) => googleUnitAllowed(row.unit, filters));
    if (allowed.length === 0) return { ...empty, overlapDays: overlap, scale, sourceDays: extract.days };

    const metric = (current: number, previous: number) => ({
      current,
      previous,
      delta: pctDelta(current, previous),
    });
    const filtered = filters.campaignType !== "ALL" || filters.funnel !== "ALL";
    const spendCurrent = scaleMoney(filtered ? sum(allowed.map((row) => row.spend)) : extract.totals.spend.current, scale);
    const spendPrevious = scaleMoney(filtered ? sum(allowed.map((row) => row.spendPrev)) : extract.totals.spend.previous, scale);
    const convCurrent = scaleMoney(filtered ? sum(allowed.map((row) => row.conversions)) : extract.totals.conversions.current, scale);
    const convPrevious = scaleMoney(filtered ? sum(allowed.map((row) => row.conversionsPrev)) : extract.totals.conversions.previous, scale);
    const clicksCurrent = scaleNumber(filtered ? sum(allowed.map((row) => row.clicks)) : extract.totals.clicks.current, scale);
    const clicksPrevious = scaleNumber(filtered ? sum(allowed.map((row) => row.clicksPrev)) : extract.totals.clicks.previous, scale);
    const imprCurrent = scaleNumber(filtered ? sum(allowed.map((row) => row.impressions)) : extract.totals.impressions.current, scale);
    const imprPrevious = scaleNumber(filtered ? sum(allowed.map((row) => row.impressionsPrev)) : extract.totals.impressions.previous, scale);

    const byUnitMap = new Map<GoogleQuarterlyUnit, { spend: number; spendPrev: number; conversions: number; conversionsPrev: number }>();
    for (const row of allowed) {
      const current = byUnitMap.get(row.unit) ?? { spend: 0, spendPrev: 0, conversions: 0, conversionsPrev: 0 };
      current.spend += row.spend;
      current.spendPrev += row.spendPrev;
      current.conversions += row.conversions;
      current.conversionsPrev += row.conversionsPrev;
      byUnitMap.set(row.unit, current);
    }

    const byTypeSource = filtered
      ? Array.from(
          allowed.reduce((acc, row) => {
            const current = acc.get(row.campaignType) ?? {
              spend: 0,
              spendPrev: 0,
              conversions: 0,
              conversionsPrev: 0,
              clicks: 0,
              clicksPrev: 0,
            };
            current.spend += row.spend;
            current.spendPrev += row.spendPrev;
            current.conversions += row.conversions;
            current.conversionsPrev += row.conversionsPrev;
            current.clicks += row.clicks;
            current.clicksPrev += row.clicksPrev;
            acc.set(row.campaignType, current);
            return acc;
          }, new Map<string, { spend: number; spendPrev: number; conversions: number; conversionsPrev: number; clicks: number; clicksPrev: number }>())
        ).map(([label, row]) => ({
          label,
          spend: { current: row.spend, previous: row.spendPrev },
          conversions: { current: row.conversions, previous: row.conversionsPrev },
          clicks: { current: row.clicks, previous: row.clicksPrev },
        }))
      : extract.byType;

    return {
      overlapDays: overlap,
      sourceDays: extract.days,
      scale,
      start: extract.start,
      end: extract.end,
      compareStart: extract.compareStart,
      compareEnd: extract.compareEnd,
      totals: {
        spend: metric(spendCurrent, spendPrevious),
        conversions: metric(convCurrent, convPrevious),
        clicks: metric(clicksCurrent, clicksPrevious),
        impressions: metric(imprCurrent, imprPrevious),
      },
      byType: byTypeSource
        .map((row) => ({
          label: row.label,
          spend: metric(scaleMoney(row.spend.current, scale), scaleMoney(row.spend.previous, scale)),
          conversions: metric(scaleMoney(row.conversions.current, scale), scaleMoney(row.conversions.previous, scale)),
          clicks: metric(scaleNumber(row.clicks.current, scale), scaleNumber(row.clicks.previous, scale)),
        }))
        .filter((row) => row.spend.current > 0 || row.spend.previous > 0)
        .sort((a, b) => b.spend.current - a.spend.current),
      byUnit: GOOGLE_UNIT_ORDER.filter((unit) => byUnitMap.has(unit)).map((unit) => {
        const row = byUnitMap.get(unit)!;
        return {
          unit,
          label: GOOGLE_UNIT_LABEL[unit],
          spend: metric(scaleMoney(row.spend, scale), scaleMoney(row.spendPrev, scale)),
          conversions: metric(scaleMoney(row.conversions, scale), scaleMoney(row.conversionsPrev, scale)),
        };
      }),
      campaigns: allowed
        .map((row) => ({
          name: row.name,
          status: row.status,
          campaignType: row.campaignType,
          unit: row.unit,
          spend: scaleMoney(row.spend, scale),
          spendPrev: scaleMoney(row.spendPrev, scale),
          conversions: scaleMoney(row.conversions, scale),
          conversionsPrev: scaleMoney(row.conversionsPrev, scale),
          clicks: scaleNumber(row.clicks, scale),
          clicksPrev: scaleNumber(row.clicksPrev, scale),
          impressions: scaleNumber(row.impressions, scale),
          impressionsPrev: scaleNumber(row.impressionsPrev, scale),
        }))
        .sort((a, b) => b.spend - a.spend),
    };
  }

  async getCreatives(filters: DashboardFilters): Promise<CreativePiece[]> {
    const m = mediaScale(filters);
    return rawSnapshot.creatives
      .filter((row) => filters.campaignType === "ALL" || row.unit === filters.campaignType)
      .filter((row) => {
        if (filters.channel === "ALL") return true;
        if (filters.channel === "META") return row.source === "meta";
        if (filters.channel === "GOOGLE") return row.source === "google";
        return false;
      })
      .filter((row) => filters.funnel === "ALL" || unitMatchesFunnel(row.unit, filters.funnel))
      .map((row) => {
        const spend = scaleMoney(row.spend, m);
        const impressions = scaleNumber(row.impressions, m);
        const clicks = scaleNumber(row.clicks, m);
        return {
          ...row,
          channel: (row.source === "meta" ? "META" : "GOOGLE") as Channel,
          spend,
          impressions,
          reach: scaleNumber(row.reach, m),
          clicks,
          ctr: impressions === 0 ? 0 : row.ctr || (clicks / impressions) * 100,
          resultsCadastro: scaleNumber(row.resultsCadastro, m),
          resultsLanding: scaleNumber(row.resultsLanding, m),
          conversas: scaleNumber(row.conversas, m),
          conversions: Math.round(row.conversions * m * 100) / 100,
        };
      })
      .sort((a, b) => b.spend - a.spend);
  }
}
