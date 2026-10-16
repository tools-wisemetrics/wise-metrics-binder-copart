import { PageHeader, PageContent, SectionTitle } from "@/components/layout/page-header";
import { dataService } from "@/lib/data/data-service";
import { filtersFromSearchParams } from "@/lib/page-filters";
import { formatDateRangeLabel } from "@/lib/filters";
import type { SearchParamRecord } from "@/lib/filters";
import { PrintReportButton } from "@/components/report/print-button";
import { formatBRL, formatNumberFull } from "@/lib/utils/formatters";

export const metadata = { title: "Relatório — Copart BI" };

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const filters = await filtersFromSearchParams(searchParams);
  const [leilao, selectVenda, selectCompra, coverage] = await Promise.all([
    dataService.getFunnelData("leilao", filters),
    dataService.getFunnelData("select_venda", filters),
    dataService.getFunnelData("select_compra", filters),
    dataService.getVitoriaCoverage(),
  ]);
  const [perfLeilao, perfVenda] = await Promise.all([
    dataService.getChannelPerformance("leilao", filters),
    dataService.getChannelPerformance("select_venda", filters),
  ]);
  const spendLeilao = perfLeilao.reduce((s, r) => s + r.gasto, 0);
  const spendSelect = perfVenda.reduce((s, r) => s + r.gasto, 0);

  return (
    <>
      <PageHeader
        title="Relatório executivo"
        subtitle={`Resumo imprimível — ${formatDateRangeLabel(filters.dateRange.start, filters.dateRange.end)}`}
        badge="Operacional"
        badgeColor="#00a85a"
      />
      <PageContent>
        <div className="print:hidden mb-6">
          <PrintReportButton />
        </div>

        <SectionTitle>Números do recorte</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[#dfe6ee] rounded-2xl p-5">
            <p className="text-xs font-bold text-[#6c7685] uppercase mb-1">Entrantes Leilão/Compra</p>
            <p className="text-2xl font-black">{formatNumberFull(leilao.stages[0]?.value ?? 0)}</p>
          </div>
          <div className="bg-white border border-[#dfe6ee] rounded-2xl p-5">
            <p className="text-xs font-bold text-[#6c7685] uppercase mb-1">Arrematantes</p>
            <p className="text-2xl font-black">{formatNumberFull(leilao.stages.at(-1)?.value ?? 0)}</p>
          </div>
          <div className="bg-white border border-[#dfe6ee] rounded-2xl p-5">
            <p className="text-xs font-bold text-[#6c7685] uppercase mb-1">Veículos captados</p>
            <p className="text-2xl font-black">{formatNumberFull(selectVenda.stages.at(-1)?.value ?? 0)}</p>
          </div>
          <div className="bg-white border border-[#dfe6ee] rounded-2xl p-5">
            <p className="text-xs font-bold text-[#6c7685] uppercase mb-1">Veículos vendidos</p>
            <p className="text-2xl font-black">{formatNumberFull(selectCompra.stages.at(-1)?.value ?? 0)}</p>
          </div>
        </div>

        <SectionTitle>Investimento isolado</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-[#dfe6ee] rounded-2xl p-5">
            <p className="text-sm font-black">Leilão/Compra</p>
            <p className="text-2xl font-black text-[#153a73]">{formatBRL(spendLeilao)}</p>
          </div>
          <div className="bg-white border border-[#dfe6ee] rounded-2xl p-5">
            <p className="text-sm font-black">Select/Venda</p>
            <p className="text-2xl font-black text-[#00a85a]">{formatBRL(spendSelect)}</p>
          </div>
        </div>

        <SectionTitle>Cobertura do relatório Vitória (D37–D38)</SectionTitle>
        <div className="space-y-2">
          {coverage.map((item) => (
            <div key={item.vision} className="bg-white border border-[#dfe6ee] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-bold text-[#0b1f3a]">{item.vision}</p>
                <p className="text-xs text-[#6c7685]">{item.location}</p>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-[#153a73]">{item.status}</span>
            </div>
          ))}
        </div>
      </PageContent>
    </>
  );
}
