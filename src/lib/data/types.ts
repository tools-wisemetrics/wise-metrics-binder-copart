// ============================================================================
// Copart Brasil — TypeScript Data Types (SPEC v2)
// ============================================================================

export type ConversionType =
  | "entrante"
  | "habilitado"
  | "licitante"
  | "arrematante"
  | "conversa_whatsapp"
  | "veiculo_captado"
  | "veiculo_vendido";

export type Channel =
  | "META"
  | "GOOGLE"
  | "TIKTOK"
  | "ORGANIC"
  | "DIRECT"
  | "RD_STATION"
  | "BLIP";

export type BusinessUnit = "leilao_compra" | "select_venda" | "select_compra";

export type CampaignType = BusinessUnit;

export type FunnelKey = "leilao" | "select_venda" | "select_compra";

export type DeviceCategory = "desktop" | "mobile" | "tablet";

export type AttributionModel =
  | "first_touch"
  | "last_touch"
  | "linear"
  | "time_decay";

export type AlertSeverity = "critical" | "warning" | "info";

export type DataOrigin = "mock_spec" | "weekly_report";

export interface ConversionEvent {
  conversion_id: string;
  user_id: string;
  conversion_date: string;
  conversion_type: ConversionType;
  conversion_value: number;
  source_system: string;
  campaign_id: string;
  campaign_name: string;
  channel: Channel;
  is_attributed: boolean;
  attribution_model: AttributionModel;
  created_at: string;
}

export interface CampaignPerformance {
  performance_id: string;
  date: string;
  campaign_id: string;
  campaign_name: string;
  campaign_type: CampaignType;
  channel: Channel;
  impressions: number;
  clicks: number;
  spend: number;
  entrantes: number;
  habilitados: number;
  licitantes_por_veiculo: number;
  conversas_whatsapp: number;
  taxa_habilitacao: number;
  ctr: number;
  cpc: number;
  custo_por_entrante: number;
  custo_por_habilitado: number;
  roas: number;
  created_at: string;
}

export interface UserJourney {
  user_id: string;
  first_touch_date: string;
  first_touch_source: string;
  first_touch_campaign: string;
  first_touch_channel: Channel;
  last_touch_date: string;
  last_touch_source: string;
  last_touch_campaign: string;
  last_touch_channel: Channel;
  touchpoint_count: number;
  days_to_conversion: number;
  conversion_date: string;
  conversion_type: ConversionType;
  device_category: DeviceCategory;
  country: string;
  region: string;
  is_converter: boolean;
  created_at: string;
}

export interface DailyMetrics {
  date: string;
  channel: Channel | "TOTAL";
  campaign_name: string;
  campaign_type: CampaignType;
  entrantes: number;
  habilitados: number;
  taxa_habilitacao: number;
  licitantes_por_veiculo: number;
  conversas_whatsapp: number;
  custo_total: number;
  custo_por_entrante: number;
  custo_por_habilitado: number;
  roas: number;
}

export interface OverviewKPIs {
  pageViews: MetricValue;
  visitantesUnicos: MetricValue;
  novosUsuarios: MetricValue;
  usuariosRetornantes: MetricValue;
  firstVisit: MetricValue;
  logins: MetricValue;
  favoritados: MetricValue;
  sessoes: MetricValue;
  sessoesEngajadas: MetricValue;
  taxaRejeicao: MetricValue;
  registrationStart: MetricValue;
  signIn: MetricValue;
}

export interface MetricValue {
  value: number;
  formatted: string;
  delta: number;
  deltaFormatted: string;
  deltaType: "good" | "bad" | "neutral";
  label: string;
  period: string;
}

export interface GoalProgress {
  title: string;
  current: number;
  target: number;
  percentage: number;
  delta: number;
  deltaLabel: string;
  deltaType: "good" | "bad" | "neutral";
  unit?: BusinessUnit;
}

export interface FunnelStage {
  label: string;
  value: number;
  conversionRate?: number;
  description?: string;
}

export interface FunnelData {
  stages: FunnelStage[];
  type: FunnelKey;
  title?: string;
  subtitle?: string;
  pageViews?: number;
  sitePath?: FunnelStage[];
  whatsappPath?: FunnelStage[];
  joinStages?: FunnelStage[];
  estimatedStages?: FunnelStage[];
}

export interface WeeklyRegistration {
  week: string;
  entrantes: number;
  habilitados: number;
  taxa_habilitacao: number;
}

export interface ChannelPerformance {
  channel: string;
  channelId?: Channel;
  unit?: BusinessUnit;
  entrantes: number;
  habilitados: number;
  taxa_habilitacao: number;
  custo_por_entrante: number;
  custo_por_habilitado: number;
  gasto: number;
  volumeSource?: string;
  convertedSource?: string;
}

export interface CampaignScorecard {
  campaign_name: string;
  channel: Channel;
  campaign_type: CampaignType;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  entrantes: number;
  habilitados: number | null;
  taxa_habilitacao: number | null;
  spend: number;
  cpc: number | null;
  custo_por_entrante: number;
  conversas: number | null;
  status: "on_target" | "below_target" | "critical";
  owner?: string;
  resultLabel?: string;
  nativeResults?: number;
}

export interface AttributionComparison {
  campaign_name: string;
  unit: BusinessUnit;
  first_touch: number;
  last_touch: number;
  linear: number;
  time_decay: number;
}

export interface FunnelStageAttribution {
  campaign_name: string;
  channel: Channel;
  unit: BusinessUnit;
  stages: Record<string, number>;
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  metric: string;
  expected: string;
  action: string;
  responsavel: string;
  timestamp: string;
  isMedia?: boolean;
}

export interface DataDiscrepancy {
  source_a: string;
  source_b: string;
  discrepancy: number;
  sla: number;
  status: "ok" | "warning" | "critical";
}

export interface ActionRecommendation {
  id: string;
  priority: number;
  title: string;
  campaign?: string;
  reason: string;
  impact: string;
  budget_change?: string;
  responsavel: string;
  deadline: string;
  isMedia?: boolean;
}

export interface SocialMetrics {
  platforms: SocialPlatform[];
}

export interface SocialPlatform {
  name: string;
  color: string;
  base: number;
  baseDelta: string;
  mainMetric: number;
  mainDelta: number;
  mainDeltaType: "good" | "bad" | "neutral";
  details: { label: string; value: string; delta: string; deltaType: "good" | "bad" }[];
}

export interface TrafficSource {
  source: string;
  maio: number;
  junho: number;
}

export type MarketingChannel =
  | "SEO"
  | "INSTAGRAM_ORGANIC"
  | "FACEBOOK_ORGANIC"
  | "META_ADS"
  | "GOOGLE_ADS"
  | "TIKTOK"
  | "RD_STATION"
  | "BLIP";

export interface ChannelGoalMetric {
  current: number;
  target: number;
  percentage: number;
}

export interface ChannelGoal {
  channel: MarketingChannel;
  channelLabel: string;
  color: string;
  icon: string;
  metrics: {
    entrantes: ChannelGoalMetric;
    habilitados: ChannelGoalMetric;
  };
  delta: number;
  deltaType: "good" | "bad" | "neutral";
  hasData?: boolean;
  sourceNote?: string;
  resultLabel?: string;
  convertedLabel?: string;
  progressCaption?: string;
}

export type TrafficMixId = "direct" | "organic" | "paid" | "other";

export interface TrafficMixBucket {
  id: TrafficMixId;
  label: string;
  sessions: number;
  newUsers: number;
  shareSessions: number;
  shareNewUsers: number;
}

export interface VolumeRankRow {
  channel: string;
  channelId: string;
  entrantes: number;
  shareOfCadastro: number;
  contributionToGoal: number;
}

export interface MediaEfficiencyRow {
  channel: "META" | "GOOGLE";
  channelLabel: string;
  unit: BusinessUnit;
  spend: number;
  nativeResults: number;
  resultLabel: string;
  cpa: number;
  volumeShare: number;
}

export interface OverallGoalSummary {
  entrantes: ChannelGoalMetric;
  habilitados: ChannelGoalMetric;
  entrantesTitle?: string;
  habilitadosTitle?: string;
}

export interface ConversionTouchpoint {
  channel: string;
  source: string;
  timestamp: string;
  type: "visit" | "interaction" | "conversion";
}

export interface ConversionPath {
  id: string;
  userId: string;
  conversionType: ConversionType;
  conversionDate: string;
  touchpoints: ConversionTouchpoint[];
  totalTouchpoints: number;
  daysToConversion: number;
  firstChannel: string;
  lastChannel: string;
  value?: number;
}

export interface ConversionPathFilters {
  conversionType: ConversionType | "ALL";
  channelInPath: MarketingChannel | "ALL";
  minTouchpoints: number;
  maxTouchpoints: number;
  dateRange: { start: string; end: string };
}

export interface JourneyPatternRank {
  pattern: string;
  count: number;
  habilitados: number;
  share: number;
}

export interface ChannelJourneyShare {
  channel: string;
  appearances: number;
  journeys: number;
  share: number;
}

export interface JourneyInsights {
  totalJourneys: number;
  habilitados: number;
  taxaHabilitacao: number;
  avgTouchpoints: number;
  frequent: JourneyPatternRank[];
  byHabilitados: JourneyPatternRank[];
  channelShare: ChannelJourneyShare[];
}

export interface RegionalRow {
  geo: string;
  label: string;
  entrantes: number;
  habilitados: number;
  taxa_habilitacao: number;
  gasto: number;
  weight: number;
  population: number;
  perCapitaEntrantes: number;
  perCapitaHabilitados: number;
  source: "copart_excel" | "empty";
}

export interface KpiEvolutionPoint {
  period: string;
  platform: string;
  entrantes: number;
  habilitados: number;
  gasto: number;
}

export interface EvolutionSeriesPoint {
  date: string;
  label: string;
  entrantes: number;
  habilitados: number;
  pageViewsGa4: number;
  pageViewsComprar: number;
  pageViewsVender: number;
  leads: number;
}

export interface PaidMediaEventRow {
  event: string;
  label: string;
  current: number;
  previous: number;
  delta: number;
}

export interface PaidMediaChannelRow {
  channel: string;
  channelLabel: string;
  event: string;
  current: number;
  previous: number;
}

export interface PaidMediaEventsReport {
  overlapDays: number;
  sourceDays: number;
  scale: number;
  start: string;
  end: string;
  compareStart: string;
  compareEnd: string;
  totalUsers: { current: number; previous: number; delta: number };
  events: PaidMediaEventRow[];
  channels: PaidMediaChannelRow[];
}

export type GoogleQuarterlyUnit = BusinessUnit | "select_mix";

export interface GoogleQuarterlyMetric {
  current: number;
  previous: number;
  delta: number;
}

export interface GoogleQuarterlyCampaign {
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
}

export interface GoogleQuarterlyTypeRow {
  label: string;
  spend: GoogleQuarterlyMetric;
  conversions: GoogleQuarterlyMetric;
  clicks: GoogleQuarterlyMetric;
}

export interface GoogleQuarterlyUnitRow {
  unit: GoogleQuarterlyUnit;
  label: string;
  spend: GoogleQuarterlyMetric;
  conversions: GoogleQuarterlyMetric;
}

export interface GoogleQuarterlyReport {
  overlapDays: number;
  sourceDays: number;
  scale: number;
  start: string;
  end: string;
  compareStart: string;
  compareEnd: string;
  totals: {
    spend: GoogleQuarterlyMetric;
    conversions: GoogleQuarterlyMetric;
    clicks: GoogleQuarterlyMetric;
    impressions: GoogleQuarterlyMetric;
  };
  byType: GoogleQuarterlyTypeRow[];
  byUnit: GoogleQuarterlyUnitRow[];
  campaigns: GoogleQuarterlyCampaign[];
}

export interface AlertThreshold {
  id: string;
  metric: string;
  maxDropPercent: number;
  slaPercent: number;
  configurable: boolean;
}

export interface VitoriaCoverageItem {
  vision: string;
  status: "absorvida" | "parcial" | "pendente";
  location: string;
}

export interface CreativePiece {
  id: string;
  source: "meta" | "google";
  channel: Channel;
  unit: BusinessUnit;
  name: string;
  campaign: string;
  adGroup: string;
  delivery: string;
  adType: string;
  format: string;
  quality: string | null;
  qualityHint: string | null;
  finalUrl: string | null;
  headlines: string[];
  descriptions: string[];
  hasImageIds: boolean;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  resultsCadastro: number;
  resultsLanding: number;
  conversas: number;
  conversions: number;
}

export interface DashboardFilters {
  dateRange: {
    start: string;
    end: string;
  };
  channel: Channel | "ALL";
  campaignType: CampaignType | "ALL";
  campaign: string;
  funnel: FunnelKey | "ALL";
  geo: string;
  period: "daily" | "weekly" | "monthly";
}

export interface DataService {
  getOverviewKPIs(filters: DashboardFilters): Promise<OverviewKPIs>;
  getGoalProgress(filters: DashboardFilters): Promise<GoalProgress[]>;
  getWeeklyRegistrations(filters: DashboardFilters): Promise<WeeklyRegistration[]>;
  getFunnelData(type: FunnelKey, filters: DashboardFilters): Promise<FunnelData>;
  getChannelPerformance(type: FunnelKey, filters: DashboardFilters): Promise<ChannelPerformance[]>;
  getCampaignScorecards(filters: DashboardFilters): Promise<CampaignScorecard[]>;
  getAttributionComparison(filters: DashboardFilters): Promise<AttributionComparison[]>;
  getFunnelStageAttribution(filters: DashboardFilters): Promise<FunnelStageAttribution[]>;
  getAlerts(filters?: DashboardFilters): Promise<Alert[]>;
  getDataDiscrepancies(): Promise<DataDiscrepancy[]>;
  getRecommendations(): Promise<ActionRecommendation[]>;
  getSocialMetrics(): Promise<SocialMetrics>;
  getTrafficSources(filters: DashboardFilters): Promise<TrafficSource[]>;
  getTrafficMix(filters: DashboardFilters): Promise<TrafficMixBucket[]>;
  getVolumeRanking(filters: DashboardFilters): Promise<VolumeRankRow[]>;
  getMediaEfficiency(filters: DashboardFilters): Promise<MediaEfficiencyRow[]>;
  getTrendData(metric: string, days: number, filters: DashboardFilters): Promise<{ date: string; value: number }[]>;
  getChannelGoals(filters: DashboardFilters): Promise<{ channels: ChannelGoal[]; overall: OverallGoalSummary }>;
  getConversionPaths(filters: ConversionPathFilters): Promise<ConversionPath[]>;
  getJourneyInsights(filters: DashboardFilters): Promise<JourneyInsights>;
  getRegionalPerformance(filters: DashboardFilters): Promise<RegionalRow[]>;
  getKpiEvolution(filters: DashboardFilters, grain: "weekly" | "monthly"): Promise<KpiEvolutionPoint[]>;
  getEvolutionSeries(filters: DashboardFilters): Promise<EvolutionSeriesPoint[]>;
  getPaidMediaEvents(filters: DashboardFilters): Promise<PaidMediaEventsReport>;
  getGoogleQuarterly(filters: DashboardFilters): Promise<GoogleQuarterlyReport>;
  getAlertThresholds(): Promise<AlertThreshold[]>;
  getVitoriaCoverage(): Promise<VitoriaCoverageItem[]>;
  getCreatives(filters: DashboardFilters): Promise<CreativePiece[]>;
  getDataOrigin(): DataOrigin;
}
