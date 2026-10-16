import { InfoTip } from "@/components/layout/info-tip";
import { formatBRL, formatNumberFull, formatPercentage } from "@/lib/utils/formatters";
import type { GoogleQuarterlyReport, GoogleQuarterlyUnit } from "@/lib/data/types";

function pctDelta(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

function restrict(report: GoogleQuarterlyReport, units: GoogleQuarterlyUnit[]): GoogleQuarterlyReport {
  const campaigns = report.campaigns.filter((row) => units.includes(row.unit));
  const metric = (current: number, previous: number) => ({
    current,
    previous,
    delta: pctDelta(current, previous),
  });
  const spend = campaigns.reduce((sum, row) => sum + row.spend, 0);
  const spendPrev = campaigns.reduce((sum, row) => sum + row.spendPrev, 0);
  const conversions = campaigns.reduce((sum, row) => sum + row.conversions, 0);
  const conversionsPrev = campaigns.reduce((sum, row) => sum + row.conversionsPrev, 0);
  const clicks = campaigns.reduce((sum, row) => sum + row.clicks, 0);
  const clicksPrev = campaigns.reduce((sum, row) => sum + row.clicksPrev, 0);
  const impressions = campaigns.reduce((sum, row) => sum + row.impressions, 0);
  const impressionsPrev = campaigns.reduce((sum, row) => sum + row.impressionsPrev, 0);
  return {
    ...report,
    totals: {
      spend: metric(spend, spendPrev),
      conversions: metric(conversions, conversionsPrev),
      clicks: metric(clicks, clicksPrev),
      impressions: metric(impressions, impressionsPrev),
    },
    byUnit: report.byUnit.filter((row) => units.includes(row.unit)),
    campaigns,
  };
}

function Delta({ value }: { value: number }) {
  return (
    <span className={value >= 0 ? "text-[#007342]" : "text-[#b2162e]"}>
      {value >= 0 ? "+" : ""}
      {formatPercentage(value, 1)} vs 14/03–14/06
    </span>
  );
}

export function GoogleQuarterly({
  report,
  units,
}: {
  report: GoogleQuarterlyReport;
  units?: GoogleQuarterlyUnit[];
}) {
  const view = units ? restrict(report, units) : report;
  if (view.overlapDays === 0 || view.campaigns.length === 0) return null;

  const scalePct = formatPercentage(view.scale * 100, 1);
  const top = view.campaigns.filter((row) => row.spend > 0).slice(0, 8);

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-black text-[#0b1f3a]">
            Google Ads trimestral
            <InfoTip text="Conta Google Ads, 15/06–15/09 vs 14/03–14/06. O recorte do filtro escala pelo overlap com essa janela — não soma com o gasto de grupos de agosto (Performance do grupo de anúncios). Campanhas Compra e Venda no nível de campanha não separam ad group." />
          </p>
          <p className="text-[11px] text-[#6c7685] font-semibold">
            {view.overlapDays} de {view.sourceDays} dias da extração ({scalePct}) · vs trimestre anterior
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-white border border-[#dfe6ee] rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">Gasto</p>
          <p className="text-2xl font-black text-[#0b1f3a] mt-1">{formatBRL(view.totals.spend.current)}</p>
          <p className="text-xs font-bold mt-1">
            <Delta value={view.totals.spend.delta} />
          </p>
        </div>
        <div className="bg-white border border-[#dfe6ee] rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">Conversões</p>
          <p className="text-2xl font-black text-[#0b1f3a] mt-1">{formatNumberFull(Math.round(view.totals.conversions.current))}</p>
          <p className="text-xs font-bold mt-1">
            <Delta value={view.totals.conversions.delta} />
          </p>
        </div>
        <div className="bg-white border border-[#dfe6ee] rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">Cliques</p>
          <p className="text-2xl font-black text-[#0b1f3a] mt-1">{formatNumberFull(view.totals.clicks.current)}</p>
          <p className="text-xs font-bold mt-1">
            <Delta value={view.totals.clicks.delta} />
          </p>
        </div>
        <div className="bg-white border border-[#dfe6ee] rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">Impressões</p>
          <p className="text-2xl font-black text-[#0b1f3a] mt-1">{formatNumberFull(view.totals.impressions.current)}</p>
          <p className="text-xs font-bold mt-1">
            <Delta value={view.totals.impressions.delta} />
          </p>
        </div>
      </div>
      {view.byUnit.length > 0 && (
        <div className="rounded-2xl border border-[#dfe6ee] overflow-hidden bg-white mb-4">
          <p className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-[#6c7685] bg-[#f4f7fb]">
            Gasto por unidade
          </p>
          <div className="divide-y divide-[#dfe6ee]">
            {view.byUnit.map((row) => (
              <div key={row.unit} className="px-4 py-2.5 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[#0b1f3a]">{row.label}</span>
                <span className="text-sm font-black text-[#0b1f3a]">
                  {formatBRL(row.spend.current)}
                  <span className="ml-2 text-[11px] font-bold text-[#6c7685]">
                    vs {formatBRL(row.spend.previous)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {view.byType.length > 0 && !units && (
        <div className="rounded-2xl border border-[#dfe6ee] overflow-hidden bg-white mb-4">
          <p className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-[#6c7685] bg-[#f4f7fb]">
            Por tipo de campanha
          </p>
          <div className="divide-y divide-[#dfe6ee]">
            {view.byType.map((row) => (
              <div key={row.label} className="px-4 py-2.5 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[#0b1f3a]">{row.label}</span>
                <span className="text-sm font-black text-[#0b1f3a]">
                  {formatBRL(row.spend.current)}
                  <span className="ml-2 text-[11px] font-bold text-[#6c7685]">
                    {formatNumberFull(Math.round(row.conversions.current))} conv.
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {top.length > 0 && (
        <div className="rounded-2xl border border-[#dfe6ee] overflow-hidden bg-white">
          <p className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-[#6c7685] bg-[#f4f7fb]">
            Campanhas com gasto no trimestre
          </p>
          <div className="divide-y divide-[#dfe6ee]">
            {top.map((row) => (
              <div key={row.name} className="px-4 py-2.5 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[#0b1f3a] truncate">{row.name}</span>
                <span className="text-sm font-black text-[#0b1f3a] whitespace-nowrap">
                  {formatBRL(row.spend)}
                  <span className="ml-2 text-[11px] font-bold text-[#6c7685]">
                    vs {formatBRL(row.spendPrev)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
