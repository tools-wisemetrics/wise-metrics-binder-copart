import { PageHeader, PageContent, SectionTitle, CardWrapper } from "@/components/layout/page-header";
import { EvolutionChart } from "@/components/charts/evolution-chart";
import { dataService } from "@/lib/data/data-service";
import { filtersFromSearchParams } from "@/lib/page-filters";
import type { SearchParamRecord } from "@/lib/filters";
import { LineChart } from "@/components/charts/line-chart";
import { COLORS } from "@/lib/constants";
import { InfoTip } from "@/components/layout/info-tip";

export const metadata = { title: "Evolução de KPIs — Copart BI" };

export default async function EvolutionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const filters = await filtersFromSearchParams(searchParams);
  const [series, weekly, monthly] = await Promise.all([
    dataService.getEvolutionSeries(filters),
    dataService.getKpiEvolution(filters, "weekly"),
    dataService.getKpiEvolution(filters, "monthly"),
  ]);

  const weeklyLabels = Array.from(new Set(weekly.map((p) => p.period)));
  const monthlyLabels = Array.from(new Set(monthly.map((p) => p.period)));

  return (
    <>
      <PageHeader
        title="Evolução"
        subtitle="Copart diário (Excel) e GA4 — escolha o KPI e cruze no eixo direito"
        badge="Executivo"
        badgeColor="#153a73"
      />
      <PageContent>
        <SectionTitle>Série no recorte</SectionTitle>
        <CardWrapper className="mb-8">
          <EvolutionChart points={series} height={320} />
        </CardWrapper>
        <SectionTitle>
          Semanal
          <InfoTip text="Quando o recorte pega o Excel Copart, a semana usa cadastro real. Sem overlap, cai no proxy GA4 de agosto. Semana 29/08–31/08 tem só 3 dias de GA4." />
        </SectionTitle>
        <CardWrapper className="mb-8">
          <LineChart
            labels={weeklyLabels}
            datasets={Array.from(new Set(weekly.map((p) => p.platform))).map((platform) => ({
              label: platform,
              data: weeklyLabels.map((period) => weekly.find((p) => p.period === period && p.platform === platform)?.entrantes ?? 0),
              color: COLORS.teal,
            }))}
            height={260}
          />
        </CardWrapper>
        <SectionTitle>
          Mensal — habilitados
          <InfoTip text="Set/25 e set/26 vêm do Copart ERP. Ago/26 usa cadastro_site do GA4 × taxa Copart — não há habilitados oficiais de agosto nesta carga." />
        </SectionTitle>
        <CardWrapper>
          <LineChart
            labels={monthlyLabels}
            datasets={Array.from(new Set(monthly.map((p) => p.platform))).map((platform) => ({
              label: platform,
              data: monthlyLabels.map((period) => monthly.find((p) => p.period === period && p.platform === platform)?.habilitados ?? 0),
              color: COLORS.blue,
            }))}
            height={260}
          />
        </CardWrapper>
      </PageContent>
    </>
  );
}
