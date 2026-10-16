import { InfoTip } from "@/components/layout/info-tip";
import { formatNumberFull, formatPercentage } from "@/lib/utils/formatters";
import type { PaidMediaEventsReport } from "@/lib/data/types";

const FEATURED = ["cadastro_site", "register_to_bid", "click_bid_now", "sign_in"];

const CHANNEL_TITLE: Record<string, string> = {
  cadastro_site: "Usuários com cadastro (canal pago, site inteiro)",
  register_to_bid: "Usuários que registraram para lance (canal pago)",
  click_bid_now: "Usuários que clicaram em dar lance (canal pago)",
  lead_vmc: "Usuários com lead VMC (canal pago)",
  form_submit: "Usuários que enviaram formulário (canal pago)",
  sign_in: "Usuários com login (canal pago)",
};

export function PaidMediaEvents({
  report,
  featured = FEATURED,
  channelEvents = ["cadastro_site"],
  showSiteWideUsers = true,
}: {
  report: PaidMediaEventsReport;
  featured?: string[];
  channelEvents?: string[];
  showSiteWideUsers?: boolean;
}) {
  if (report.overlapDays === 0 || report.events.length === 0) return null;

  const featuredRows = report.events.filter((row) => featured.includes(row.event));
  const scalePct = formatPercentage(report.scale * 100, 1);

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-black text-[#0b1f3a]">
            Mídia paga GA4
            <InfoTip text="Usuários (não contagem de eventos) em canais pagos, extração 15/06–15/09 vs 14/03–14/06. O recorte do filtro escala pelo overlap com essa janela — não soma com o evento cadastro_site de agosto (6.860, site inteiro) nem com Entrante Copart." />
          </p>
          <p className="text-[11px] text-[#6c7685] font-semibold">
            {report.overlapDays} de {report.sourceDays} dias da extração ({scalePct}) · vs trimestre anterior
          </p>
        </div>
        {showSiteWideUsers ? (
          <p className="text-[11px] font-bold text-[#6c7685]">
            {formatNumberFull(report.totalUsers.current)} usuários pagos (site)
            <span className={report.totalUsers.delta >= 0 ? " text-[#007342]" : " text-[#b2162e]"}>
              {" "}
              {report.totalUsers.delta >= 0 ? "+" : ""}
              {formatPercentage(report.totalUsers.delta, 1)}
            </span>
          </p>
        ) : (
          <p className="text-[11px] font-bold text-[#6c7685]">Eventos Select — sem o cadastro_site do Leilão</p>
        )}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {featuredRows.map((row) => (
          <div key={row.event} className="bg-white border border-[#dfe6ee] rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">{row.label}</p>
            <p className="text-2xl font-black text-[#0b1f3a] mt-1">{formatNumberFull(row.current)}</p>
            <p className={`text-xs font-bold mt-1 ${row.delta >= 0 ? "text-[#007342]" : "text-[#b2162e]"}`}>
              {row.delta >= 0 ? "+" : ""}
              {formatPercentage(row.delta, 1)} vs 14/03–14/06
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {channelEvents.map((event) => {
          const rows = report.channels.filter((row) => row.event === event);
          if (rows.length === 0) return null;
          return (
            <div key={event} className="rounded-2xl border border-[#dfe6ee] overflow-hidden bg-white">
              <p className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-[#6c7685] bg-[#f4f7fb]">
                {CHANNEL_TITLE[event] ?? event}
              </p>
              <div className="divide-y divide-[#dfe6ee]">
                {rows.map((row) => (
                  <div key={row.channel} className="px-4 py-2.5 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-[#0b1f3a]">{row.channelLabel}</span>
                    <span className="text-sm font-black text-[#0b1f3a]">
                      {formatNumberFull(row.current)}
                      <span className="ml-2 text-[11px] font-bold text-[#6c7685]">
                        vs {formatNumberFull(row.previous)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
