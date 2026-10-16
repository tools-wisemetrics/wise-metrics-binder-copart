import { PageHeader, PageContent, SectionTitle, CardWrapper } from "@/components/layout/page-header";
import { CampaignTable } from "@/components/tables/campaign-table";
import { EvolutionChart } from "@/components/charts/evolution-chart";
import { DoughnutChart } from "@/components/charts/doughnut-chart";
import { GoogleQuarterly } from "@/components/cards/google-quarterly";
import { dataService } from "@/lib/data/data-service";
import { CHANNEL_LABELS, COLORS } from "@/lib/constants";
import { filtersFromSearchParams } from "@/lib/page-filters";
import type { SearchParamRecord } from "@/lib/filters";
import { formatBRL } from "@/lib/utils/formatters";

export const metadata = { title: "Campanhas de Leilão — Copart BI" };

export default async function AuctionCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const filters = await filtersFromSearchParams(searchParams);
  const leilaoFilters = { ...filters, campaignType: "leilao_compra" as const };
  const [scorecards, series, googleQuarterly] = await Promise.all([
    dataService.getCampaignScorecards(leilaoFilters),
    dataService.getEvolutionSeries(leilaoFilters),
    dataService.getGoogleQuarterly(leilaoFilters),
  ]);
  const spendData = scorecards.filter((c) => c.spend > 0);
  const totalSpend = spendData.reduce((a, c) => a + c.spend, 0);
  const spendByChannel = spendData.reduce<Record<string, number>>((acc, row) => {
    const label = CHANNEL_LABELS[row.channel] ?? row.channel;
    acc[label] = (acc[label] ?? 0) + row.spend;
    return acc;
  }, {});
  const spendLabels = Object.keys(spendByChannel);
  const spendValues = Object.values(spendByChannel);

  return (
    <>
      <PageHeader
        title="Campanhas Leilão/Compra"
        subtitle="Investimento isolado do Select — owner de mídia: Felipe"
        badge="Operacional"
        badgeColor="#00a85a"
      />
      <PageContent>
        <GoogleQuarterly report={googleQuarterly} />
        <SectionTitle>Tabela detalhada</SectionTitle>
        <div className="mb-8 overflow-x-auto">
          <CampaignTable data={scorecards} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CardWrapper title="Evolução no recorte" className="lg:col-span-2">
            <EvolutionChart points={series} height={240} />
          </CardWrapper>
          <CardWrapper title="Distribuição de gasto — só Leilão/Compra">
            <DoughnutChart
              labels={spendLabels}
              data={spendValues}
              colors={[COLORS.teal, COLORS.blue, COLORS.violet]}
              centerValue={formatBRL(totalSpend)}
              centerLabel="Gasto Leilão"
              height={240}
            />
          </CardWrapper>
        </div>
      </PageContent>
    </>
  );
}
