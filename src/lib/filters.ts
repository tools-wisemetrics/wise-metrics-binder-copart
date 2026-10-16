import type { DashboardFilters, Channel, CampaignType, FunnelKey } from "@/lib/data/types";
import { DEFAULT_DATE_RANGE } from "@/lib/constants";

export type SearchParamRecord = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

const UNITS: CampaignType[] = ["leilao_compra", "select_venda", "select_compra"];
const FUNNELS: FunnelKey[] = ["leilao", "select_venda", "select_compra"];
const CHANNELS: Channel[] = [
  "META",
  "GOOGLE",
  "TIKTOK",
  "ORGANIC",
  "DIRECT",
  "RD_STATION",
  "BLIP",
];

export function parseDashboardFilters(params: SearchParamRecord = {}): DashboardFilters {
  const unit = first(params.unit);
  const funnel = first(params.funnel);
  const channel = first(params.channel);
  const period = first(params.period);

  return {
    dateRange: {
      start: first(params.start) || DEFAULT_DATE_RANGE.start,
      end: first(params.end) || DEFAULT_DATE_RANGE.end,
    },
    channel: CHANNELS.includes(channel as Channel) ? (channel as Channel) : "ALL",
    campaignType: UNITS.includes(unit as CampaignType) ? (unit as CampaignType) : "ALL",
    campaign: first(params.campaign) || "ALL",
    funnel: FUNNELS.includes(funnel as FunnelKey) ? (funnel as FunnelKey) : "ALL",
    geo: first(params.geo) || "ALL",
    period: period === "daily" || period === "monthly" ? period : "weekly",
  };
}

export function daysInRange(start: string, end: string): number {
  const a = new Date(`${start}T00:00:00`);
  const b = new Date(`${end}T00:00:00`);
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1);
}

export function overlapDays(start: string, end: string, srcStart: string, srcEnd: string): number {
  const a = Math.max(new Date(`${start}T00:00:00`).getTime(), new Date(`${srcStart}T00:00:00`).getTime());
  const b = Math.min(new Date(`${end}T00:00:00`).getTime(), new Date(`${srcEnd}T00:00:00`).getTime());
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 0;
  return Math.round((b - a) / 86_400_000) + 1;
}

export function coverageScale(
  filters: DashboardFilters,
  srcStart: string,
  srcEnd: string,
  srcDays: number
): number {
  const days = overlapDays(filters.dateRange.start, filters.dateRange.end, srcStart, srcEnd);
  return days / Math.max(srcDays, 1);
}

export function filterScale(filters: DashboardFilters): number {
  return daysInRange(filters.dateRange.start, filters.dateRange.end) / 7;
}

export function scaleNumber(value: number, scale: number): number {
  return Math.round(value * scale);
}

export function formatDateRangeLabel(start: string, end: string): string {
  const [ys, ms, ds] = start.split("-");
  const [ye, me, de] = end.split("-");
  return `${ds}/${ms}${ys !== ye ? `/${ys}` : ""} – ${de}/${me}/${ye}`;
}

export function filtersToQuery(filters: DashboardFilters): string {
  const params = new URLSearchParams();
  params.set("start", filters.dateRange.start);
  params.set("end", filters.dateRange.end);
  if (filters.campaignType !== "ALL") params.set("unit", filters.campaignType);
  if (filters.channel !== "ALL") params.set("channel", filters.channel);
  if (filters.geo !== "ALL") params.set("geo", filters.geo);
  if (filters.funnel !== "ALL") params.set("funnel", filters.funnel);
  if (filters.campaign !== "ALL") params.set("campaign", filters.campaign);
  return params.toString();
}

export type UnitScope = "free" | "leilao" | "select";

export function unitScopeForPath(pathname: string): UnitScope {
  if (pathname.startsWith("/dashboard/funnel") || pathname.startsWith("/dashboard/auction-campaigns")) {
    return "leilao";
  }
  if (pathname.startsWith("/dashboard/direct-sales") || pathname.startsWith("/dashboard/direct-campaigns")) {
    return "select";
  }
  return "free";
}

export function coerceUnitForScope(scope: UnitScope, unit: string): CampaignType | "ALL" {
  if (scope === "leilao") return "leilao_compra";
  if (scope === "select") {
    if (unit === "select_venda" || unit === "select_compra") return unit;
    return "ALL";
  }
  return UNITS.includes(unit as CampaignType) ? (unit as CampaignType) : "ALL";
}

export function navHref(path: string, current: URLSearchParams | string): string {
  const params = new URLSearchParams(typeof current === "string" ? current : current.toString());
  const previous = params.get("unit") || "ALL";
  const nextUnit = coerceUnitForScope(unitScopeForPath(path), previous);
  if (nextUnit === "ALL") params.delete("unit");
  else params.set("unit", nextUnit);
  if (nextUnit !== previous) {
    params.delete("funnel");
    params.delete("campaign");
  }
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function hrefWithFilters(path: string, filters: DashboardFilters): string {
  const scoped: DashboardFilters = {
    ...filters,
    campaignType: coerceUnitForScope(unitScopeForPath(path), filters.campaignType),
  };
  const query = filtersToQuery(scoped);
  return query ? `${path}?${query}` : path;
}

export function unitMatchesFunnel(
  unit: CampaignType | "ALL",
  type: FunnelKey
): boolean {
  if (unit === "ALL") return true;
  if (type === "leilao") return unit === "leilao_compra";
  return unit === type;
}
