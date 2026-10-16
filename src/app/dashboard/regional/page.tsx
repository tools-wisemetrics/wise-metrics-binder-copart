import { PageHeader, PageContent } from "@/components/layout/page-header";
import { RegionalExplorer } from "@/components/charts/regional-explorer";
import { dataService } from "@/lib/data/data-service";
import { filtersFromSearchParams } from "@/lib/page-filters";
import type { SearchParamRecord } from "@/lib/filters";
import { InfoTip } from "@/components/layout/info-tip";

export const metadata = {
  title: "Análise Regional & Campanhas — Copart BI",
  description: "Análise aprofundada por UF, Macro-Regiões IBGE e Campanhas Geolocalizadas no Copart BI Dashboard",
};

export default async function RegionalPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const filters = await filtersFromSearchParams(searchParams);
  const [rows, scorecards, mediaEfficiency] = await Promise.all([
    dataService.getRegionalPerformance(filters),
    dataService.getCampaignScorecards(filters),
    dataService.getMediaEfficiency(filters),
  ]);

  return (
    <>
      <PageHeader
        title="Análise Regional"
        subtitle="Mapeamento aprofundado por Estado (27 UFs), Macro-Regiões e Campanhas de Mídia geolocalizadas"
        badge="Executivo"
        badgeColor="#153a73"
        actions={
          <InfoTip text="Entrantes e habilitados por UF vêm da extração oficial da Copart. Campanhas e investimento regional agregam dados do Google Ads e Meta Ads. Indicador per capita calculado via dados IBGE 2024." />
        }
      />
      <PageContent>
        <RegionalExplorer
          rows={rows}
          scorecards={scorecards}
          mediaEfficiency={mediaEfficiency}
        />
      </PageContent>
    </>
  );
}
