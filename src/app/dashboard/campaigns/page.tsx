import { PageHeader, PageContent, SectionTitle } from "@/components/layout/page-header";
import { CampaignTable } from "@/components/tables/campaign-table";
import { KpiCard } from "@/components/cards/kpi-card";
import { dataService } from "@/lib/data/data-service";
import { filtersFromSearchParams } from "@/lib/page-filters";
import type { SearchParamRecord } from "@/lib/filters";
import { formatBRL, formatNumberFull } from "@/lib/utils/formatters";

export const metadata = { title: "Scorecard de campanhas — Copart BI" };

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const filters = await filtersFromSearchParams(searchParams);
  const scorecards = await dataService.getCampaignScorecards(filters);
  const spend = scorecards.reduce((s, r) => s + r.spend, 0);
  const byLabel = new Map<string, number>();
  for (const row of scorecards) {
    const label = row.resultLabel ?? "Resultado da conta";
    const value = row.nativeResults ?? row.entrantes ?? 0;
    if (value <= 0) continue;
    byLabel.set(label, (byLabel.get(label) ?? 0) + value);
  }
  const resultCards = [...byLabel.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PageHeader
        title="Scorecard de campanhas"
        subtitle="Totais da carga de agosto no recorte — não é série diária. Cada resultado fica na fonte da conta."
        badge="Operacional"
        badgeColor="#00a85a"
      />
      <PageContent>
        <SectionTitle>Resumo do recorte</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard title="Gasto total" value={formatBRL(spend)} />
          {resultCards.map(([label, value]) => (
            <KpiCard key={label} title={label} value={formatNumberFull(value)} />
          ))}
        </div>
        <SectionTitle>Scorecard de campanhas</SectionTitle>
        <div className="overflow-x-auto">
          <CampaignTable data={scorecards} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-[#6c7685]">
          <span className="font-bold">Legenda:</span>
          <span>Na meta — dentro do esperado</span>
          <span>Abaixo da meta — &lt;90% da meta</span>
          <span>Crítico — abaixo de 70% da meta</span>
        </div>
      </PageContent>
    </>
  );
}
