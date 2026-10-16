import { PageHeader, PageContent } from "@/components/layout/page-header";
import { ConversionPathList } from "@/components/cards/conversion-path-list";
import { dataService } from "@/lib/data/data-service";
import { filtersFromSearchParams } from "@/lib/page-filters";
import type { SearchParamRecord } from "@/lib/filters";

export const metadata = {
  title: "Canais de origem — Copart BI Dashboard",
};

export default async function ConversionPathsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const filters = await filtersFromSearchParams(searchParams);
  const insights = await dataService.getJourneyInsights(filters);

  return (
    <>
      <PageHeader
        title="Canais de origem"
        subtitle="First-user GA4 agregado — volume de novos usuários por canal de primeiro acesso. Sem caminho por pessoa."
      />
      <PageContent>
        <ConversionPathList origins={insights.channelShare} />
      </PageContent>
    </>
  );
}
