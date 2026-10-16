import Link from "next/link";
import { InfoTip } from "@/components/layout/info-tip";
import { formatBRL, formatNumberFull, formatPercentage } from "@/lib/utils/formatters";
import type { GoogleQuarterlyReport, PaidMediaEventsReport } from "@/lib/data/types";

function tone(delta: number) {
  return delta >= 0 ? "text-[#14c79a]" : "text-[#ff8a9a]";
}

export function MediaSynthesis({
  paid,
  google,
  leilaoHref,
  selectHref,
}: {
  paid: PaidMediaEventsReport;
  google: GoogleQuarterlyReport;
  leilaoHref: string;
  selectHref: string;
}) {
  const hidePaid = paid.overlapDays === 0 || paid.events.length === 0;
  const hideGoogle = google.overlapDays === 0 || google.campaigns.length === 0;
  if (hidePaid && hideGoogle) return null;

  const cadastro = paid.events.find((row) => row.event === "cadastro_site");
  const scalePct = formatPercentage((hidePaid ? google.scale : paid.scale) * 100, 1);
  const overlapDays = hidePaid ? google.overlapDays : paid.overlapDays;
  const sourceDays = hidePaid ? google.sourceDays : paid.sourceDays;

  return (
    <div className="mb-8 rounded-2xl border border-[#dfe6ee] bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
        <div>
          <p className="text-sm font-black text-[#0b1f3a]">
            Síntese de mídia
            <InfoTip text="Números de overlap 15/06–15/09, já proporcionalizados ao filtro. Detalhe de canais, campanhas e eventos fica nos funis — aqui não se soma com o Resumo GA4 nem com o Google de agosto." />
          </p>
          <p className="text-[11px] text-[#6c7685] font-semibold">
            {overlapDays} de {sourceDays} dias da extração ({scalePct}) · vs trimestre anterior
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-bold">
          <Link href={leilaoHref} className="text-[#153a73] hover:underline">
            Funil de Leilão →
          </Link>
          <Link href={selectHref} className="text-[#007342] hover:underline">
            Copart Select →
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {!hidePaid && (
          <>
            <div className="rounded-xl bg-[#f4f7fb] px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">Usuários pagos (site)</p>
              <p className="text-xl font-black text-[#0b1f3a] mt-1">{formatNumberFull(paid.totalUsers.current)}</p>
              <p className={`text-xs font-bold mt-1 ${tone(paid.totalUsers.delta)}`}>
                {paid.totalUsers.delta >= 0 ? "+" : ""}
                {formatPercentage(paid.totalUsers.delta, 1)}
              </p>
            </div>
            {cadastro && (
              <div className="rounded-xl bg-[#f4f7fb] px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">Usuários com cadastro (pago)</p>
                <p className="text-xl font-black text-[#0b1f3a] mt-1">{formatNumberFull(cadastro.current)}</p>
                <p className={`text-xs font-bold mt-1 ${tone(cadastro.delta)}`}>
                  {cadastro.delta >= 0 ? "+" : ""}
                  {formatPercentage(cadastro.delta, 1)}
                </p>
              </div>
            )}
          </>
        )}
        {!hideGoogle && (
          <>
            <div className="rounded-xl bg-[#f4f7fb] px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">Google Ads (trimestre)</p>
              <p className="text-xl font-black text-[#0b1f3a] mt-1">{formatBRL(google.totals.spend.current)}</p>
              <p className={`text-xs font-bold mt-1 ${tone(google.totals.spend.delta)}`}>
                {google.totals.spend.delta >= 0 ? "+" : ""}
                {formatPercentage(google.totals.spend.delta, 1)}
              </p>
            </div>
            <div className="rounded-xl bg-[#f4f7fb] px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">Conversões Google</p>
              <p className="text-xl font-black text-[#0b1f3a] mt-1">
                {formatNumberFull(Math.round(google.totals.conversions.current))}
              </p>
              <p className={`text-xs font-bold mt-1 ${tone(google.totals.conversions.delta)}`}>
                {google.totals.conversions.delta >= 0 ? "+" : ""}
                {formatPercentage(google.totals.conversions.delta, 1)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
