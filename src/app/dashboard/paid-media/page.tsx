import { PageHeader, PageContent } from "@/components/layout/page-header";
import { PaidMediaView } from "@/components/paid-media/paid-media-view";
import { dataService } from "@/lib/data/data-service";
import { filtersFromSearchParams } from "@/lib/page-filters";
import type { SearchParamRecord } from "@/lib/filters";
import { formatDateRangeLabel } from "@/lib/filters";

export const metadata = {
  title: "Mídia Paga — Copart BI Dashboard",
  description: "Desempenho por canal e evento com variação semanal WoW Δ% no Copart BI Dashboard",
};

export default async function PaidMediaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const filters = await filtersFromSearchParams(searchParams);
  const [paidEvents, kpis, channelPerf, mediaEfficiency] = await Promise.all([
    dataService.getPaidMediaEvents(filters),
    dataService.getOverviewKPIs(filters),
    dataService.getChannelPerformance("leilao", filters),
    dataService.getMediaEfficiency(filters),
  ]);

  const periodLabel = formatDateRangeLabel(filters.dateRange.start, filters.dateRange.end);

  return (
    <>
      <PageHeader
        title="Mídia Paga"
        subtitle={`Visão detalhada por canal e evento com evolução semanal e WoW Δ% — ${periodLabel}`}
        badge="Operacional"
        badgeColor="#153a73"
      />
      <PageContent>
        <PaidMediaView
          paidEvents={paidEvents}
          kpis={kpis}
          channelPerf={channelPerf}
          mediaEfficiency={mediaEfficiency}
        />
      </PageContent>
    </>
  );
}
