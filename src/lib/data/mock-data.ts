import type {
  DataService,
  DashboardFilters,
  OverviewKPIs,
  GoalProgress,
  WeeklyRegistration,
  FunnelData,
  FunnelStage,
  ChannelPerformance,
  CampaignScorecard,
  AttributionComparison,
  FunnelStageAttribution,
  Alert,
  DataDiscrepancy,
  ActionRecommendation,
  SocialMetrics,
  TrafficSource,
  ChannelGoal,
  OverallGoalSummary,
  ConversionPath,
  ConversionPathFilters,
  FunnelKey,
  JourneyInsights,
  JourneyPatternRank,
  ChannelJourneyShare,
  RegionalRow,
  KpiEvolutionPoint,
  EvolutionSeriesPoint,
  PaidMediaEventsReport,
  GoogleQuarterlyReport,
  AlertThreshold,
  VitoriaCoverageItem,
  CreativePiece,
  TrafficMixBucket,
  VolumeRankRow,
  MediaEfficiencyRow,
  DataOrigin,
} from "./types";
import { conversionPaths as rawJourneys } from "./mock-journeys";
import { filterScale, scaleNumber, unitMatchesFunnel } from "@/lib/filters";
import {
  GEO_WEIGHTS,
  LEILAO_FUNNEL_STAGES,
  MARKETING_CHANNEL_CONFIG,
  MEDIA_OWNER,
  SELECT_COMPRA_LAST_STAGE,
  SELECT_VENDA_LAST_STAGE,
} from "@/lib/constants";
import { formatNumberFull } from "@/lib/utils/formatters";

function scaleStages(stages: FunnelStage[], scale: number): FunnelStage[] {
  return stages.map((stage) => ({
    ...stage,
    value: scaleNumber(stage.value, scale),
  }));
}

function scaleRows(rows: ChannelPerformance[], scale: number): ChannelPerformance[] {
  return rows.map((row) => {
    const entrantes = scaleNumber(row.entrantes, scale);
    const habilitados = scaleNumber(row.habilitados, scale);
    const gasto = scaleNumber(row.gasto, scale);
    return {
      ...row,
      entrantes,
      habilitados,
      taxa_habilitacao: entrantes === 0 ? 0 : (habilitados / entrantes) * 100,
      custo_por_entrante: entrantes === 0 || gasto === 0 ? row.custo_por_entrante : gasto / entrantes,
      custo_por_habilitado: habilitados === 0 || gasto === 0 ? row.custo_por_habilitado : gasto / habilitados,
      gasto,
    };
  });
}

function byChannel(rows: ChannelPerformance[], filters: DashboardFilters): ChannelPerformance[] {
  if (filters.channel === "ALL") return rows;
  return rows.filter((row) => row.channelId === filters.channel);
}

const funnelLeilaoBase: FunnelData = {
  type: "leilao",
  title: "Funil Leilão",
  subtitle: "Leilão/Compra — etapas de negócio",
  stages: [
    { label: "Entrantes", value: 3547, description: "Cadastros concluídos no recorte" },
    { label: "Habilitados", value: 2231, conversionRate: 62.9, description: "Aptos a licitar" },
    { label: "Licitantes", value: 892, conversionRate: 40.0, description: "Deram ao menos um lance" },
    { label: "Arrematantes", value: 401, conversionRate: 45.0, description: "Venceram lote" },
  ],
};

const funnelSelectVendaBase: FunnelData = {
  type: "select_venda",
  title: "Funil Select/Venda",
  subtitle: "Captação de veículos para o estoque",
  stages: [
    { label: "Cliques CTA", value: 2800, description: "Cliques em anúncios de captação" },
    { label: "Conversas", value: 2380, conversionRate: 85.0, description: "Conversas no Blip (WhatsApp)" },
    { label: "Qualificados", value: 1428, conversionRate: 60.0, description: "Veículo dentro do perfil Select" },
    { label: "Vistorias", value: 714, conversionRate: 50.0, description: "Avaliação física ou digital" },
    { label: SELECT_VENDA_LAST_STAGE, value: 357, conversionRate: 50.0, description: "Entraram no estoque" },
  ],
};

const funnelSelectCompraBase: FunnelData = {
  type: "select_compra",
  title: "Funil Select/Compra",
  subtitle: "Venda de veículos do estoque",
  stages: [
    { label: "Impressões (Select/Compra)", value: 145000, description: "Impressões de mídia — não é estoque físico" },
    { label: "Visualização de lote", value: 12400, conversionRate: 8.55, description: "Páginas de detalhe" },
    { label: "Intenção / contato", value: 3100, conversionRate: 25.0, description: "Proposta ou contato" },
    { label: "Compradores habilitados", value: 1240, conversionRate: 40.0, description: "Pré-aprovados" },
    { label: SELECT_COMPRA_LAST_STAGE, value: 248, conversionRate: 20.0, description: "Vendas concluídas" },
  ],
};

const channelPerformanceLeilao: ChannelPerformance[] = [
  { channel: "Meta Ads", channelId: "META", unit: "leilao_compra", entrantes: 1280, habilitados: 806, taxa_habilitacao: 63.0, custo_por_entrante: 8.2, custo_por_habilitado: 13.02, gasto: 10496 },
  { channel: "Google Ads", channelId: "GOOGLE", unit: "leilao_compra", entrantes: 890, habilitados: 445, taxa_habilitacao: 50.0, custo_por_entrante: 9.1, custo_por_habilitado: 18.2, gasto: 8099 },
  { channel: "Orgânico", channelId: "ORGANIC", unit: "leilao_compra", entrantes: 802, habilitados: 401, taxa_habilitacao: 50.0, custo_por_entrante: 0, custo_por_habilitado: 0, gasto: 0 },
  { channel: "Direto", channelId: "DIRECT", unit: "leilao_compra", entrantes: 243, habilitados: 83, taxa_habilitacao: 34.2, custo_por_entrante: 0, custo_por_habilitado: 0, gasto: 0 },
];

const channelPerformanceSelectVenda: ChannelPerformance[] = [
  { channel: "Meta Ads", channelId: "META", unit: "select_venda", entrantes: 1960, habilitados: 1666, taxa_habilitacao: 85.0, custo_por_entrante: 7.2, custo_por_habilitado: 8.47, gasto: 14112 },
  { channel: "Blip (WhatsApp)", channelId: "BLIP", unit: "select_venda", entrantes: 840, habilitados: 714, taxa_habilitacao: 85.0, custo_por_entrante: 8.4, custo_por_habilitado: 9.88, gasto: 7056 },
];

const channelPerformanceSelectCompra: ChannelPerformance[] = [
  { channel: "Google Ads", channelId: "GOOGLE", unit: "select_compra", entrantes: 6800, habilitados: 1700, taxa_habilitacao: 25.0, custo_por_entrante: 2.87, custo_por_habilitado: 11.5, gasto: 19516 },
  { channel: "Meta Ads", channelId: "META", unit: "select_compra", entrantes: 4200, habilitados: 1050, taxa_habilitacao: 25.0, custo_por_entrante: 2.55, custo_por_habilitado: 10.2, gasto: 10710 },
  { channel: "Orgânico", channelId: "ORGANIC", unit: "select_compra", entrantes: 1400, habilitados: 350, taxa_habilitacao: 25.0, custo_por_entrante: 0, custo_por_habilitado: 0, gasto: 0 },
];

const weeklyRegistrations: WeeklyRegistration[] = [
  { week: "31/05–06/06", entrantes: 3511, habilitados: 2092, taxa_habilitacao: 59.58 },
  { week: "07/06–13/06", entrantes: 3498, habilitados: 2158, taxa_habilitacao: 61.69 },
  { week: "14/06–20/06", entrantes: 3695, habilitados: 2368, taxa_habilitacao: 64.09 },
  { week: "21/06–27/06", entrantes: 3554, habilitados: 2326, taxa_habilitacao: 65.44 },
  { week: "28/06–04/07", entrantes: 3547, habilitados: 2231, taxa_habilitacao: 62.9 },
];

const campaignScorecards: CampaignScorecard[] = [
  { campaign_name: "META_LEILAO_BR_LAL_VIDEO_CPC", channel: "META", campaign_type: "leilao_compra", impressions: 245000, clicks: 5880, ctr: 2.4, entrantes: 1995, habilitados: 1077, taxa_habilitacao: 53.9, spend: 16380, cpc: 2.79, custo_por_entrante: 8.21, conversas: null, status: "on_target", owner: MEDIA_OWNER },
  { campaign_name: "GOOGLE_LEILAO_SP_INT_STATIC_CPM", channel: "GOOGLE", campaign_type: "leilao_compra", impressions: 156000, clicks: 3120, ctr: 2.0, entrantes: 1470, habilitados: 735, taxa_habilitacao: 50.0, spend: 13230, cpc: 4.24, custo_por_entrante: 9.0, conversas: null, status: "below_target", owner: MEDIA_OWNER },
  { campaign_name: "ORGANIC_LEILAO_BR_SEO_CORE", channel: "ORGANIC", campaign_type: "leilao_compra", impressions: null, clicks: null, ctr: null, entrantes: 1260, habilitados: 630, taxa_habilitacao: 50.0, spend: 0, cpc: null, custo_por_entrante: 0, conversas: null, status: "on_target" },
  { campaign_name: "META_SELECT_VENDER_BR_CPC", channel: "META", campaign_type: "select_venda", impressions: 98000, clicks: 1960, ctr: 2.0, entrantes: 665, habilitados: null, taxa_habilitacao: null, spend: 8400, cpc: 4.29, custo_por_entrante: 7.58, conversas: 1166, status: "on_target", owner: MEDIA_OWNER },
  { campaign_name: "BLIP_SELECT_VENDER_WHATSAPP", channel: "BLIP", campaign_type: "select_venda", impressions: null, clicks: 588, ctr: null, entrantes: 315, habilitados: null, taxa_habilitacao: null, spend: 4200, cpc: 7.14, custo_por_entrante: 8.0, conversas: 500, status: "on_target", owner: MEDIA_OWNER },
  { campaign_name: "GOOGLE_SELECT_COMPRAR_PMAX", channel: "GOOGLE", campaign_type: "select_compra", impressions: 85000, clicks: 6800, ctr: 8.0, entrantes: 1700, habilitados: 425, taxa_habilitacao: 25.0, spend: 19550, cpc: 2.87, custo_por_entrante: 11.5, conversas: 850, status: "on_target", owner: MEDIA_OWNER },
  { campaign_name: "META_SELECT_COMPRAR_CATALOG", channel: "META", campaign_type: "select_compra", impressions: 60000, clicks: 4200, ctr: 7.0, entrantes: 1050, habilitados: 262, taxa_habilitacao: 25.0, spend: 10710, cpc: 2.55, custo_por_entrante: 10.2, conversas: 525, status: "on_target", owner: MEDIA_OWNER },
];

const attributionComparison: AttributionComparison[] = [
  { campaign_name: "META_LEILAO_BR_LAL_VIDEO_CPC", unit: "leilao_compra", first_touch: 3200, last_touch: 2800, linear: 3000, time_decay: 2900 },
  { campaign_name: "GOOGLE_LEILAO_SP_INT_STATIC_CPM", unit: "leilao_compra", first_touch: 2100, last_touch: 2400, linear: 2250, time_decay: 2350 },
  { campaign_name: "ORGANIC_LEILAO_BR_SEO_CORE", unit: "leilao_compra", first_touch: 1800, last_touch: 1500, linear: 1650, time_decay: 1550 },
  { campaign_name: "META_SELECT_VENDER_BR_CPC", unit: "select_venda", first_touch: 1200, last_touch: 1100, linear: 1150, time_decay: 1120 },
  { campaign_name: "BLIP_SELECT_VENDER_WHATSAPP", unit: "select_venda", first_touch: 640, last_touch: 880, linear: 760, time_decay: 810 },
  { campaign_name: "GOOGLE_SELECT_COMPRAR_PMAX", unit: "select_compra", first_touch: 980, last_touch: 1210, linear: 1090, time_decay: 1140 },
];

const funnelStageAttributionBase: FunnelStageAttribution[] = [
  { campaign_name: "META_LEILAO_BR_LAL_VIDEO_CPC", channel: "META", unit: "leilao_compra", stages: { Entrantes: 1995, Habilitados: 1077, Licitantes: 430, Arrematantes: 190 } },
  { campaign_name: "GOOGLE_LEILAO_SP_INT_STATIC_CPM", channel: "GOOGLE", unit: "leilao_compra", stages: { Entrantes: 1470, Habilitados: 735, Licitantes: 294, Arrematantes: 132 } },
  { campaign_name: "ORGANIC_LEILAO_BR_SEO_CORE", channel: "ORGANIC", unit: "leilao_compra", stages: { Entrantes: 1260, Habilitados: 630, Licitantes: 252, Arrematantes: 113 } },
  { campaign_name: "META_SELECT_VENDER_BR_CPC", channel: "META", unit: "select_venda", stages: { "Cliques CTA": 1960, Conversas: 1666, Qualificados: 1000, Vistorias: 500, "Veículos Captados": 250 } },
  { campaign_name: "BLIP_SELECT_VENDER_WHATSAPP", channel: "BLIP", unit: "select_venda", stages: { "Cliques CTA": 840, Conversas: 714, Qualificados: 428, Vistorias: 214, "Veículos Captados": 107 } },
  { campaign_name: "GOOGLE_SELECT_COMPRAR_PMAX", channel: "GOOGLE", unit: "select_compra", stages: { "Impressões (Select/Compra)": 85000, "Visualização de lote": 6800, "Intenção / contato": 1700, "Compradores habilitados": 680, "Veículos Vendidos": 136 } },
  { campaign_name: "META_SELECT_COMPRAR_CATALOG", channel: "META", unit: "select_compra", stages: { "Impressões (Select/Compra)": 60000, "Visualização de lote": 4200, "Intenção / contato": 1050, "Compradores habilitados": 420, "Veículos Vendidos": 84 } },
];

const alerts: Alert[] = [
  {
    id: "alert-1",
    severity: "critical",
    title: "GOOGLE_LEILAO_SP_INT_STATIC_CPM",
    description: "Taxa de habilitação caiu para 42% (vs. 50% esperado)",
    metric: "Taxa de Habilitação",
    expected: "50%",
    action: "Revisar segmentação de audiência",
    responsavel: MEDIA_OWNER,
    timestamp: "2026-07-04T10:30:00Z",
    isMedia: true,
  },
  {
    id: "alert-2",
    severity: "warning",
    title: "META_LEILAO_BR_LAL_VIDEO_CPC",
    description: "Custo por entrante subiu para R$ 9,50 (vs. R$ 8,20 esperado)",
    metric: "Custo/Entrante",
    expected: "R$ 8,20",
    action: "Revisar lances de CPC",
    responsavel: MEDIA_OWNER,
    timestamp: "2026-07-04T11:00:00Z",
    isMedia: true,
  },
  {
    id: "alert-3",
    severity: "info",
    title: "ORGANIC_LEILAO_BR_SEO_CORE",
    description: "Tráfego orgânico cresceu 15% vs. semana passada",
    metric: "Tráfego Orgânico",
    expected: "Estável",
    action: "Investigar quais páginas estão ranqueando",
    responsavel: "Caio",
    timestamp: "2026-07-04T09:15:00Z",
    isMedia: false,
  },
];

const dataDiscrepancies: DataDiscrepancy[] = [
  { source_a: "GA4", source_b: "mLabs", discrepancy: 3.2, sla: 5, status: "ok" },
  { source_a: "Google Ads", source_b: "GA4", discrepancy: 8.5, sla: 10, status: "ok" },
  { source_a: "Meta Ads", source_b: "GA4", discrepancy: 12.1, sla: 15, status: "warning" },
  { source_a: "Copart (Planilhas)", source_b: "RD Station", discrepancy: 2.1, sla: 5, status: "ok" },
  { source_a: "Blip (WhatsApp)", source_b: "RD Station", discrepancy: 4.4, sla: 5, status: "ok" },
];

const recommendations: ActionRecommendation[] = [
  {
    id: "rec-1",
    priority: 1,
    title: "Aumentar orçamento de mídia Leilão/Compra",
    campaign: "META_LEILAO_BR_LAL_VIDEO_CPC",
    reason: "Taxa de habilitação 54% (acima da meta de 50%)",
    impact: "+200 habilitados/mês",
    budget_change: "+R$ 5.000 (de R$ 16.380 para R$ 21.380)",
    responsavel: MEDIA_OWNER,
    deadline: "Próxima segunda",
    isMedia: true,
  },
  {
    id: "rec-2",
    priority: 2,
    title: "Revisar segmentação Google Ads",
    campaign: "GOOGLE_LEILAO_SP_INT_STATIC_CPM",
    reason: "Taxa de habilitação caiu para 42% (abaixo da meta)",
    impact: "Recuperar taxa para 50%+",
    responsavel: MEDIA_OWNER,
    deadline: "Próxima terça",
    isMedia: true,
  },
  {
    id: "rec-3",
    priority: 3,
    title: "Expandir cobertura orgânica",
    campaign: "ORGANIC_LEILAO_BR_SEO_CORE",
    reason: "Tráfego cresceu 15%, custo por entrante = R$ 0",
    impact: "Reduzir dependência de mídia paga",
    responsavel: "Caio",
    deadline: "Próxima quarta",
    isMedia: false,
  },
];

const socialMetrics: SocialMetrics = {
  platforms: [
    {
      name: "Instagram", color: "#e1306c", base: 547876, baseDelta: "-167 seguidores",
      mainMetric: 547100, mainDelta: -14, mainDeltaType: "bad",
      details: [
        { label: "Visualizações", value: "547,1k", delta: "-14%", deltaType: "bad" },
        { label: "Interações", value: "2,4k", delta: "+31%", deltaType: "good" },
        { label: "Cliques", value: "2,3k", delta: "-20%", deltaType: "bad" },
      ],
    },
    {
      name: "Facebook", color: "#1877f2", base: 171696, baseDelta: "-104 seguidores",
      mainMetric: 74300, mainDelta: -57, mainDeltaType: "bad",
      details: [
        { label: "Visualizações", value: "74,3k", delta: "-57%", deltaType: "bad" },
        { label: "Interações", value: "110", delta: "-52%", deltaType: "bad" },
        { label: "Cliques", value: "320", delta: "-32%", deltaType: "bad" },
      ],
    },
  ],
};

const trafficSources: TrafficSource[] = [
  { source: "Direto", maio: 1156279, junho: 632940 },
  { source: "Busca paga", maio: 121914, junho: 140610 },
  { source: "Busca orgânica", maio: 186873, junho: 167107 },
  { source: "Cross-network", maio: 70555, junho: 79668 },
  { source: "Social orgânico", maio: 31932, junho: 17974 },
  { source: "E-mail", maio: 36783, junho: 21209 },
  { source: "Social pago", maio: 40772, junho: 10624 },
  { source: "Referral", maio: 6840, junho: 7514 },
];

const channelGoals: ChannelGoal[] = [
  { channel: "META_ADS", channelLabel: MARKETING_CHANNEL_CONFIG.META_ADS.label, color: "#0668E1", icon: "Megaphone", metrics: { entrantes: { current: 4850, target: 5500, percentage: 88.2 }, habilitados: { current: 2680, target: 3000, percentage: 89.3 } }, delta: 5.4, deltaType: "good" },
  { channel: "GOOGLE_ADS", channelLabel: MARKETING_CHANNEL_CONFIG.GOOGLE_ADS.label, color: "#4285f4", icon: "Target", metrics: { entrantes: { current: 3720, target: 4200, percentage: 88.6 }, habilitados: { current: 1860, target: 2300, percentage: 80.9 } }, delta: -3.2, deltaType: "bad" },
  { channel: "SEO", channelLabel: MARKETING_CHANNEL_CONFIG.SEO.label, color: "#00a85a", icon: "Search", metrics: { entrantes: { current: 3150, target: 3500, percentage: 90.0 }, habilitados: { current: 2205, target: 2100, percentage: 105.0 } }, delta: 12.8, deltaType: "good" },
  { channel: "INSTAGRAM_ORGANIC", channelLabel: MARKETING_CHANNEL_CONFIG.INSTAGRAM_ORGANIC.label, color: "#e1306c", icon: "Instagram", metrics: { entrantes: { current: 1420, target: 2000, percentage: 71.0 }, habilitados: { current: 780, target: 1100, percentage: 70.9 } }, delta: -8.5, deltaType: "bad" },
  { channel: "FACEBOOK_ORGANIC", channelLabel: MARKETING_CHANNEL_CONFIG.FACEBOOK_ORGANIC.label, color: "#1877f2", icon: "Facebook", metrics: { entrantes: { current: 620, target: 1200, percentage: 51.7 }, habilitados: { current: 310, target: 650, percentage: 47.7 } }, delta: -22.1, deltaType: "bad" },
  { channel: "TIKTOK", channelLabel: MARKETING_CHANNEL_CONFIG.TIKTOK.label, color: "#010101", icon: "Music", metrics: { entrantes: { current: 890, target: 1800, percentage: 49.4 }, habilitados: { current: 374, target: 850, percentage: 44.0 } }, delta: -15.3, deltaType: "bad" },
  { channel: "RD_STATION", channelLabel: MARKETING_CHANNEL_CONFIG.RD_STATION.label, color: "#8c5be8", icon: "Users", metrics: { entrantes: { current: 520, target: 500, percentage: 104.0 }, habilitados: { current: 310, target: 300, percentage: 103.3 } }, delta: 9.2, deltaType: "good" },
  { channel: "BLIP", channelLabel: MARKETING_CHANNEL_CONFIG.BLIP.label, color: "#25d366", icon: "MessageCircle", metrics: { entrantes: { current: 330, target: 300, percentage: 110.0 }, habilitados: { current: 190, target: 200, percentage: 95.0 } }, delta: 6.4, deltaType: "good" },
];

const overallGoalSummary: OverallGoalSummary = {
  entrantes: { current: 15500, target: 20000, percentage: 77.5 },
  habilitados: { current: 9709, target: 11000, percentage: 88.3 },
};

function overviewFromScale(scale: number): OverviewKPIs {
  const n = (value: number, formatted: (v: number) => string, extra: Omit<OverviewKPIs["pageViews"], "value" | "formatted">) => ({
    ...extra,
    value: scaleNumber(value, scale),
    formatted: formatted(scaleNumber(value, scale)),
  });
  return {
    pageViews: n(6_420_000, (v) => `${(v / 1_000_000).toFixed(2).replace(".", ",")}M`, { delta: -8.15, deltaFormatted: "-8,15%", deltaType: "bad", label: "Page Views", period: "vs período anterior" }),
    visitantesUnicos: n(297_000, (v) => `${Math.round(v / 1000)}k`, { delta: -4.91, deltaFormatted: "-4,91%", deltaType: "bad", label: "Visitantes únicos", period: "usuários totais" }),
    novosUsuarios: n(176_000, (v) => `${Math.round(v / 1000)}k`, { delta: -5.84, deltaFormatted: "-5,84%", deltaType: "bad", label: "Novos usuários", period: "aquisição" }),
    usuariosRetornantes: n(145_000, (v) => `${Math.round(v / 1000)}k`, { delta: 7.21, deltaFormatted: "+7,21%", deltaType: "good", label: "Usuários retornantes", period: "retenção" }),
    firstVisit: n(1_100_000, (v) => `${(v / 1_000_000).toFixed(2).replace(".", ",")}M`, { delta: -6.66, deltaFormatted: "-6,66%", deltaType: "bad", label: "Primeira visita", period: "diagnóstico de site" }),
    logins: n(110_000, (v) => `${Math.round(v / 1000)}k`, { delta: -5.73, deltaFormatted: "-5,73%", deltaType: "bad", label: "Logins", period: "acesso" }),
    favoritados: n(59_000, (v) => `${Math.round(v / 1000)}k`, { delta: -0.89, deltaFormatted: "-0,89%", deltaType: "bad", label: "Favoritos", period: "intenção de site" }),
    sessoes: n(765851, (v) => formatNumberFull(v), { delta: -4.96, deltaFormatted: "-4,96%", deltaType: "bad", label: "Sessões", period: "visitas" }),
    sessoesEngajadas: n(595804, (v) => formatNumberFull(v), { delta: -7.94, deltaFormatted: "-7,94%", deltaType: "bad", label: "Sessões engajadas", period: "qualidade" }),
    taxaRejeicao: { value: 22.2, formatted: "22,20%", delta: 12.78, deltaFormatted: "+12,78%", deltaType: "bad", label: "Taxa de rejeição", period: "piora" },
    registrationStart: n(68445, (v) => formatNumberFull(v), { delta: 0.6, deltaFormatted: "+0,6%", deltaType: "good", label: "Início de cadastro (diagnóstico)", period: "não é etapa do Funil Leilão" }),
    signIn: n(110269, (v) => formatNumberFull(v), { delta: -5.73, deltaFormatted: "-5,73%", deltaType: "bad", label: "Sign-in", period: "login" }),
  };
}

function generateTrendData(baseValue: number, days: number, seed: number): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = [];
  let currentValue = baseValue;
  const startDate = new Date("2026-06-28");
  for (let i = 0; i < days; i += 1) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const change = 1 + Math.sin((i + seed) * 1.7) * 0.04;
    currentValue *= change;
    data.push({
      date: date.toISOString().split("T")[0],
      value: Math.round(currentValue * 100) / 100,
    });
  }
  return data;
}

function patternKey(path: ConversionPath): string {
  const channels = path.touchpoints
    .filter((t) => t.type !== "conversion")
    .map((t) => t.channel);
  return channels.join(" → ") || path.firstChannel;
}

function buildJourneyInsights(paths: ConversionPath[]): JourneyInsights {
  const habilitados = paths.filter((p) =>
    ["habilitado", "licitante", "arrematante"].includes(p.conversionType)
  ).length;
  const counts = new Map<string, { count: number; habilitados: number }>();
  for (const path of paths) {
    const key = patternKey(path);
    const current = counts.get(key) ?? { count: 0, habilitados: 0 };
    current.count += 1;
    if (["habilitado", "licitante", "arrematante"].includes(path.conversionType)) {
      current.habilitados += 1;
    }
    counts.set(key, current);
  }
  const ranked: JourneyPatternRank[] = [...counts.entries()].map(([pattern, stats]) => ({
    pattern,
    count: stats.count,
    habilitados: stats.habilitados,
    share: paths.length === 0 ? 0 : (stats.count / paths.length) * 100,
  }));
  const channelMap = new Map<string, { appearances: number; journeys: Set<string> }>();
  for (const path of paths) {
    for (const touch of path.touchpoints.filter((t) => t.type !== "conversion")) {
      const entry = channelMap.get(touch.channel) ?? { appearances: 0, journeys: new Set<string>() };
      entry.appearances += 1;
      entry.journeys.add(path.id);
      channelMap.set(touch.channel, entry);
    }
  }
  const channelShare: ChannelJourneyShare[] = [...channelMap.entries()]
    .map(([channel, stats]) => ({
      channel,
      appearances: stats.appearances,
      journeys: stats.journeys.size,
      share: paths.length === 0 ? 0 : (stats.journeys.size / paths.length) * 100,
    }))
    .sort((a, b) => b.journeys - a.journeys);

  return {
    totalJourneys: paths.length,
    habilitados,
    taxaHabilitacao: paths.length === 0 ? 0 : (habilitados / paths.length) * 100,
    avgTouchpoints: paths.length === 0 ? 0 : paths.reduce((s, p) => s + p.totalTouchpoints, 0) / paths.length,
    frequent: [...ranked].sort((a, b) => b.count - a.count).slice(0, 5),
    byHabilitados: [...ranked].sort((a, b) => b.habilitados - a.habilitados || b.count - a.count).slice(0, 5),
    channelShare,
  };
}

export class MockDataService implements DataService {
  getDataOrigin(): DataOrigin {
    return "mock_spec";
  }

  async getOverviewKPIs(filters: DashboardFilters): Promise<OverviewKPIs> {
    return overviewFromScale(filterScale(filters));
  }

  async getGoalProgress(filters: DashboardFilters): Promise<GoalProgress[]> {
    const scale = filterScale(filters);
    const unitGoals: GoalProgress[] = [
      { title: "Entrantes — Leilão/Compra", current: scaleNumber(15500, scale / (30 / 7)), target: 20000, percentage: 77.5, delta: -2.66, deltaLabel: "vs período anterior", deltaType: "bad", unit: "leilao_compra" },
      { title: "Habilitados — Leilão/Compra", current: scaleNumber(9709, scale / (30 / 7)), target: 11000, percentage: 88.3, delta: 15.25, deltaLabel: "vs período anterior", deltaType: "good", unit: "leilao_compra" },
      { title: "Veículos captados — Select/Venda", current: scaleNumber(357, scale), target: 400, percentage: 89.3, delta: 14.2, deltaLabel: "vs período anterior", deltaType: "good", unit: "select_venda" },
      { title: "Veículos vendidos — Select/Compra", current: scaleNumber(248, scale), target: 300, percentage: 82.7, delta: 18.5, deltaLabel: "vs período anterior", deltaType: "good", unit: "select_compra" },
    ];
    if (filters.campaignType === "ALL") return unitGoals;
    return unitGoals.filter((g) => g.unit === filters.campaignType);
  }

  async getWeeklyRegistrations(_filters?: DashboardFilters): Promise<WeeklyRegistration[]> {
    return weeklyRegistrations;
  }

  async getFunnelData(type: FunnelKey, filters: DashboardFilters): Promise<FunnelData> {
    const scale = filterScale(filters);
    const source =
      type === "leilao" ? funnelLeilaoBase : type === "select_venda" ? funnelSelectVendaBase : funnelSelectCompraBase;
    return { ...source, stages: scaleStages(source.stages, scale) };
  }

  async getChannelPerformance(type: FunnelKey, filters: DashboardFilters): Promise<ChannelPerformance[]> {
    const scale = filterScale(filters);
    const source =
      type === "leilao"
        ? channelPerformanceLeilao
        : type === "select_venda"
        ? channelPerformanceSelectVenda
        : channelPerformanceSelectCompra;
    return byChannel(scaleRows(source, scale), filters);
  }

  async getCampaignScorecards(filters: DashboardFilters): Promise<CampaignScorecard[]> {
    const scale = filterScale(filters);
    return campaignScorecards
      .filter((row) => filters.campaignType === "ALL" || row.campaign_type === filters.campaignType)
      .filter((row) => filters.channel === "ALL" || row.channel === filters.channel)
      .filter((row) => filters.campaign === "ALL" || row.campaign_name === filters.campaign)
      .filter((row) => filters.funnel === "ALL" || unitMatchesFunnel(row.campaign_type, filters.funnel))
      .map((row) => ({
        ...row,
        entrantes: scaleNumber(row.entrantes, scale),
        habilitados: row.habilitados == null ? null : scaleNumber(row.habilitados, scale),
        spend: scaleNumber(row.spend, scale),
        conversas: row.conversas == null ? null : scaleNumber(row.conversas, scale),
      }));
  }

  async getAttributionComparison(filters: DashboardFilters): Promise<AttributionComparison[]> {
    const scale = filterScale(filters);
    return attributionComparison
      .filter((row) => filters.campaignType === "ALL" || row.unit === filters.campaignType)
      .map((row) => ({
        ...row,
        first_touch: scaleNumber(row.first_touch, scale),
        last_touch: scaleNumber(row.last_touch, scale),
        linear: scaleNumber(row.linear, scale),
        time_decay: scaleNumber(row.time_decay, scale),
      }));
  }

  async getFunnelStageAttribution(filters: DashboardFilters): Promise<FunnelStageAttribution[]> {
    const scale = filterScale(filters);
    return funnelStageAttributionBase
      .filter((row) => filters.campaignType === "ALL" || row.unit === filters.campaignType)
      .filter((row) => filters.channel === "ALL" || row.channel === filters.channel)
      .map((row) => ({
        ...row,
        stages: Object.fromEntries(
          Object.entries(row.stages).map(([key, value]) => [key, scaleNumber(value, scale)])
        ),
      }));
  }

  async getAlerts(): Promise<Alert[]> {
    return alerts;
  }

  async getDataDiscrepancies(): Promise<DataDiscrepancy[]> {
    return dataDiscrepancies;
  }

  async getRecommendations(): Promise<ActionRecommendation[]> {
    return recommendations;
  }

  async getSocialMetrics(): Promise<SocialMetrics> {
    return socialMetrics;
  }

  async getTrafficSources(): Promise<TrafficSource[]> {
    return trafficSources;
  }

  async getTrafficMix(_filters: DashboardFilters): Promise<TrafficMixBucket[]> {
    return [];
  }

  async getVolumeRanking(_filters: DashboardFilters): Promise<VolumeRankRow[]> {
    return [];
  }

  async getMediaEfficiency(_filters: DashboardFilters): Promise<MediaEfficiencyRow[]> {
    return [];
  }

  async getTrendData(metric: string, days: number, filters: DashboardFilters): Promise<{ date: string; value: number }[]> {
    const scale = filterScale(filters);
    const bases: Record<string, number> = {
      taxa_habilitacao: 62.9,
      entrantes: 507 * scale,
      habilitados: 319 * scale,
      custo_por_entrante: 8.5,
      conversas: 340 * scale,
    };
    const seed = filters.channel === "ALL" ? 1 : filters.channel.length;
    return generateTrendData(bases[metric] || 100, days, seed);
  }

  async getChannelGoals(filters: DashboardFilters): Promise<{ channels: ChannelGoal[]; overall: OverallGoalSummary }> {
    const scale = Math.min(filterScale(filters), 1.2);
    return {
      channels: channelGoals.map((goal) => ({
        ...goal,
        metrics: {
          entrantes: {
            current: scaleNumber(goal.metrics.entrantes.current, scale),
            target: goal.metrics.entrantes.target,
            percentage: (scaleNumber(goal.metrics.entrantes.current, scale) / goal.metrics.entrantes.target) * 100,
          },
          habilitados: {
            current: scaleNumber(goal.metrics.habilitados.current, scale),
            target: goal.metrics.habilitados.target,
            percentage: (scaleNumber(goal.metrics.habilitados.current, scale) / goal.metrics.habilitados.target) * 100,
          },
        },
      })),
      overall: {
        entrantes: {
          current: scaleNumber(overallGoalSummary.entrantes.current, scale),
          target: overallGoalSummary.entrantes.target,
          percentage: (scaleNumber(overallGoalSummary.entrantes.current, scale) / overallGoalSummary.entrantes.target) * 100,
        },
        habilitados: {
          current: scaleNumber(overallGoalSummary.habilitados.current, scale),
          target: overallGoalSummary.habilitados.target,
          percentage: (scaleNumber(overallGoalSummary.habilitados.current, scale) / overallGoalSummary.habilitados.target) * 100,
        },
      },
    };
  }

  async getConversionPaths(filters: ConversionPathFilters): Promise<ConversionPath[]> {
    let filtered = [...rawJourneys];
    if (filters.conversionType !== "ALL") {
      filtered = filtered.filter((p) => p.conversionType === filters.conversionType);
    }
    if (filters.channelInPath !== "ALL") {
      const label = MARKETING_CHANNEL_CONFIG[filters.channelInPath]?.label;
      if (label) {
        filtered = filtered.filter((p) =>
          p.touchpoints.some((t) => t.channel === label || t.channel.includes(label.replace(" Ads", "")))
        );
      }
    }
    if (filters.minTouchpoints > 0) {
      filtered = filtered.filter((p) => p.totalTouchpoints >= filters.minTouchpoints);
    }
    if (filters.maxTouchpoints < 20) {
      filtered = filtered.filter((p) => p.totalTouchpoints <= filters.maxTouchpoints);
    }
    return filtered;
  }

  async getJourneyInsights(): Promise<JourneyInsights> {
    return buildJourneyInsights(rawJourneys);
  }

  async getRegionalPerformance(filters: DashboardFilters): Promise<RegionalRow[]> {
    const leilao = await this.getChannelPerformance("leilao", { ...filters, geo: "ALL", channel: "ALL" });
    const totalEntrantes = leilao.reduce((s, r) => s + r.entrantes, 0);
    const totalHabilitados = leilao.reduce((s, r) => s + r.habilitados, 0);
    const totalGasto = leilao.reduce((s, r) => s + r.gasto, 0);
    const geos = [
      { geo: "SP", label: "São Paulo" },
      { geo: "RJ", label: "Rio de Janeiro" },
      { geo: "MG", label: "Minas Gerais" },
      { geo: "PR", label: "Paraná" },
      { geo: "RS", label: "Rio Grande do Sul" },
      { geo: "BA", label: "Bahia" },
    ];
    return geos
      .filter((g) => filters.geo === "ALL" || filters.geo === g.geo)
      .map((g) => {
        const weight = GEO_WEIGHTS[g.geo] ?? 0.05;
        const entrantes = scaleNumber(totalEntrantes, weight);
        const habilitados = scaleNumber(totalHabilitados, weight);
        return {
          ...g,
          entrantes,
          habilitados,
          taxa_habilitacao: entrantes === 0 ? 0 : (habilitados / entrantes) * 100,
          gasto: scaleNumber(totalGasto, weight),
          weight,
          population: 0,
          perCapitaEntrantes: 0,
          perCapitaHabilitados: 0,
          source: "empty" as const,
        };
      });
  }

  async getKpiEvolution(filters: DashboardFilters, grain: "weekly" | "monthly"): Promise<KpiEvolutionPoint[]> {
    const scale = filterScale(filters);
    const platforms = ["Meta Ads", "Google Ads", "Orgânico", "Blip (WhatsApp)"];
    if (grain === "monthly") {
      return ["Mai/26", "Jun/26", "Jul/26"].flatMap((period, i) =>
        platforms.map((platform, p) => ({
          period,
          platform,
          entrantes: scaleNumber(2800 + i * 180 - p * 220, scale),
          habilitados: scaleNumber(1500 + i * 90 - p * 110, scale),
          gasto: scaleNumber(platform === "Orgânico" ? 0 : 12000 + i * 800 - p * 1500, scale),
        }))
      );
    }
    return weeklyRegistrations.flatMap((week, i) =>
      platforms.map((platform, p) => ({
        period: week.week,
        platform,
        entrantes: scaleNumber(week.entrantes / 4 - p * 40 + i * 12, scale),
        habilitados: scaleNumber(week.habilitados / 4 - p * 20 + i * 8, scale),
        gasto: scaleNumber(platform === "Orgânico" ? 0 : 4200 - p * 400, scale),
      }))
    );
  }

  async getAlertThresholds(): Promise<AlertThreshold[]> {
    return [
      { id: "drop-wow", metric: "Queda vs período anterior", maxDropPercent: 20, slaPercent: 20, configurable: true },
      { id: "source-gap", metric: "Discrepância entre fontes", maxDropPercent: 15, slaPercent: 15, configurable: true },
      { id: "hab-rate", metric: "Taxa de habilitação mínima", maxDropPercent: 10, slaPercent: 50, configurable: true },
    ];
  }

  async getVitoriaCoverage(): Promise<VitoriaCoverageItem[]> {
    return [
      { vision: "Page Views / visitantes / logins", status: "absorvida", location: "Visão Geral" },
      { vision: "Entrantes vs Habilitados semanal", status: "absorvida", location: "Funil Leilão + Evolução" },
      { vision: "Leads Select", status: "absorvida", location: "Copart Select (Select/Venda e Select/Compra)" },
      { vision: "Redes sociais nativas", status: "parcial", location: "dados prontos; tela social ainda resumida" },
      { vision: "Controles manuais em planilha", status: "pendente", location: "substituir no ritual de Recomendações" },
    ];
  }

  async getEvolutionSeries(_filters: DashboardFilters): Promise<EvolutionSeriesPoint[]> {
    return [];
  }

  async getPaidMediaEvents(_filters: DashboardFilters): Promise<PaidMediaEventsReport> {
    return {
      overlapDays: 0,
      sourceDays: 93,
      scale: 0,
      start: "2026-06-15",
      end: "2026-09-15",
      compareStart: "2026-03-14",
      compareEnd: "2026-06-14",
      totalUsers: { current: 0, previous: 0, delta: 0 },
      events: [],
      channels: [],
    };
  }

  async getGoogleQuarterly(_filters: DashboardFilters): Promise<GoogleQuarterlyReport> {
    return {
      overlapDays: 0,
      sourceDays: 93,
      scale: 0,
      start: "2026-06-15",
      end: "2026-09-15",
      compareStart: "2026-03-14",
      compareEnd: "2026-06-14",
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
  }

  async getCreatives(_filters: DashboardFilters): Promise<CreativePiece[]> {
    return [];
  }
}

export { LEILAO_FUNNEL_STAGES };
