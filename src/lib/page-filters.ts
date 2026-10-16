import { parseDashboardFilters, type SearchParamRecord } from "@/lib/filters";

export async function filtersFromSearchParams(
  searchParams: Promise<SearchParamRecord>
) {
  return parseDashboardFilters(await searchParams);
}
