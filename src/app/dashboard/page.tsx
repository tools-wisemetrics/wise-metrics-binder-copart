import { PageHeader, PageContent, SectionTitle, CardWrapper } from "@/components/layout/page-header";
import { KpiCard } from "@/components/cards/kpi-card";
import { GoalCard } from "@/components/cards/goal-card";
import { DoughnutChart } from "@/components/charts/doughnut-chart";
import { MediaSynthesis } from "@/components/cards/media-synthesis";
import { dataService } from "@/lib/data/data-service";
import { filtersFromSearchParams } from "@/lib/page-filters";
import { formatDateRangeLabel, hrefWithFilters } from "@/lib/filters";
import type { SearchParamRecord } from "@/lib/filters";
import { BUSINESS_UNIT_LABELS } from "@/lib/constants";
import type { BusinessUnit } from "@/lib/data/types";
import { formatBRL, formatPercentage } from "@/lib/utils/formatters";
import { InfoTip } from "@/components/layout/info-tip";
import { Database, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Visão Geral — Copart BI Dashboard",
};

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const filters = await filtersFromSearchParams(searchParams);
  const [kpis, goals, mix, efficiency, paidEvents, googleQuarterly] = await Promise.all([
    dataService.getOverviewKPIs(filters),
    dataService.getGoalProgress(filters),
    dataService.getTrafficMix(filters),
    dataService.getMediaEfficiency(filters),
    dataService.getPaidMediaEvents(filters),
    dataService.getGoogleQuarterly(filters),
  ]);

  const owned = mix.filter((bucket) => bucket.id === "direct" || bucket.id === "organic");
  const paid = mix.find((bucket) => bucket.id === "paid");
  const ownedShare = owned.reduce((sum, bucket) => sum + bucket.shareSessions, 0);
  const paidShare = paid?.shareSessions ?? 0;
  const spendByUnit = efficiency.reduce<Partial<Record<BusinessUnit, number>>>((acc, row) => {
    acc[row.unit] = (acc[row.unit] ?? 0) + row.spend;
    return acc;
  }, {});
  const spendCards = (["leilao_compra", "select_venda", "select_compra"] as const)
    .filter((unit) => (spendByUnit[unit] ?? 0) > 0)
    .map((unit) => ({
      unit,
      label: BUSINESS_UNIT_LABELS[unit],
      spend: spendByUnit[unit] ?? 0,
      accent:
        unit === "leilao_compra" ? "#8aa4be" : unit === "select_venda" ? "#14c79a" : "#00b8cf",
    }));

  const kpiList = [
    { key: "pageViews", data: kpis.pageViews, insights: ["Evento page_view, site inteiro — detalhe no Funil de Leilão"] },
    { key: "visitantesUnicos", data: kpis.visitantesUnicos, insights: ["Usuários ativos GA4 (BR) no recorte — não é visitante de leilão"] },
    { key: "logins", data: kpis.logins, insights: ["Contagem de eventos sign_in no Resumo GA4 de agosto. Distinto dos usuários com login na extração paga."] },
    { key: "registrationStart", data: kpis.registrationStart, insights: ["Início de cadastro GA4. Distinto de Entrante Copart e de cadastro_site."] },
  ];

  const mixColors = ["#8c5be8", "#00a85a", "#cf3044", "#6c7685"];
  const period = formatDateRangeLabel(filters.dateRange.start, filters.dateRange.end);

  return (
    <>
      <PageHeader
        title="Visão Geral"
        subtitle={`Síntese executiva — ${period}`}
        badge="Executivo"
        badgeColor="#153a73"
      />
      <PageContent>
        <CardWrapper className="mb-8 bg-[#0b1f3a] text-white border-0">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#00b8cf] mb-2">
            Quem traz o volume
            <InfoTip text="Direct e orgânico carregam a maior parte das sessões GA4. O investimento está na fatia paga. Spend de Leilão e Select não se somam." />
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-[#8aa4be] font-semibold">Direct + orgânico (sessões)</p>
              <p className="text-3xl font-black">{formatPercentage(ownedShare)}</p>
            </div>
            <div>
              <p className="text-xs text-[#8aa4be] font-semibold">Mídia paga (sessões)</p>
              <p className="text-3xl font-black">{formatPercentage(paidShare)}</p>
            </div>
          </div>
          <p className="text-xs text-[#8aa4be] font-semibold mb-2">Gasto de mídia — agosto, unidades não se somam</p>
          {spendCards.length === 0 ? (
            <p className="text-lg font-black">—</p>
          ) : (
            <div
              className={`grid gap-3 ${
                spendCards.length === 1
                  ? "grid-cols-1 max-w-xs"
                  : spendCards.length === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1 sm:grid-cols-3"
              }`}
            >
              {spendCards.map((card) => (
                <div
                  key={card.unit}
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: card.accent }}>
                    {card.label}
                  </p>
                  <p className="text-xl font-black mt-1">{formatBRL(card.spend)}</p>
                </div>
              ))}
            </div>
          )}
        </CardWrapper>

        <MediaSynthesis
          paid={paidEvents}
          google={googleQuarterly}
          leilaoHref={hrefWithFilters("/dashboard/funnel", filters)}
          selectHref={hrefWithFilters("/dashboard/direct-sales", filters)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <CardWrapper title="Mix de sessões GA4" subtitle="Owned vs pago vs outros" className="lg:col-span-1">
            <DoughnutChart
              labels={mix.map((bucket) => bucket.label)}
              data={mix.map((bucket) => bucket.sessions)}
              colors={mixColors}
              centerValue={formatPercentage(ownedShare, 0)}
              centerLabel="owned"
              height={220}
            />
          </CardWrapper>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {kpiList.map(({ key, data, insights }) => (
              <KpiCard
                key={key}
                title={data.label}
                value={data.formatted}
                delta={data.delta}
                deltaFormatted={data.deltaFormatted}
                deltaType={data.deltaType}
                period={data.period}
                insights={insights}
              />
            ))}
          </div>
        </div>

        <SectionTitle>Progresso vs metas por unidade</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {goals.map((g) => (
            <GoalCard
              key={g.title}
              title={g.title}
              current={g.current}
              target={g.target}
              percentage={g.percentage}
              delta={g.delta}
              deltaLabel={g.deltaLabel}
              deltaType={g.deltaType}
              color={g.title.includes("Select/Compra") ? "#00b8cf" : g.title.includes("Select") ? "#00a85a" : "#153a73"}
            />
          ))}
        </div>

        <div className="mt-8 p-5 rounded-2xl bg-[#0b1f3a] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00b8cf]/20 flex items-center justify-center text-[#00b8cf]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-sm">Governança e origem</span>
              <p className="text-xs text-[#d9eaf5] mt-0.5">
                Extrações em raw/ · Meta + GA4 ago/2026 · Copart set/2026
                <InfoTip text="Google Ads, Meta Ads, GA4 e Copart ERP a partir dos arquivos em raw/. Não é BigQuery ao vivo." />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8aa4be]">
            <ShieldCheck className="w-4 h-4 text-[#00b8cf]" />
            <span>Carga 11h BRT</span>
          </div>
        </div>
      </PageContent>
    </>
  );
}
