import type { FunnelStage } from "@/lib/data/types";
import { formatNumberFull } from "@/lib/utils/formatters";
import { InfoTip } from "@/components/layout/info-tip";
import { EstimatedStagesNote } from "@/components/charts/funnel-chart";

function PathCard({ title, color, stages }: { title: string; color: string; stages: FunnelStage[] }) {
  return (
    <div className="rounded-2xl border border-[#dfe6ee] p-4 flex-1 min-w-0">
      <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color }}>{title}</p>
      <ul className="space-y-2">
        {stages.map((stage) => (
          <li key={stage.label} className="flex items-baseline justify-between gap-3">
            <span className="text-xs text-[#6c7685] font-semibold">{stage.label}</span>
            <span className="text-sm font-black text-[#0b1f3a]">{formatNumberFull(stage.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SelectTwoPathFunnel({
  sitePath,
  whatsappPath,
  joinStages,
  estimatedStages = [],
}: {
  sitePath: FunnelStage[];
  whatsappPath: FunnelStage[];
  joinStages: FunnelStage[];
  estimatedStages?: FunnelStage[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1">
        <p className="text-xs font-bold text-[#0b1f3a]">Dois caminhos até qualificados</p>
        <InfoTip text="Site (page views vender + entradas Copart) e WhatsApp (conversas Meta) se juntam em qualificados. Vistorias e captados ficam à parte — são estimados." />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PathCard title="Site" color="#153a73" stages={sitePath} />
        <PathCard title="WhatsApp" color="#00a85a" stages={whatsappPath} />
      </div>
      <div className="flex justify-center text-[#6c7685] text-lg font-black">↓</div>
      <div className="rounded-2xl border border-[#00a85a]/30 bg-[#e8f8ef] p-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-[#007342] mb-3">Qualificados (Meta)</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {joinStages.map((stage) => (
            <div key={stage.label}>
              <p className="text-[11px] text-[#6c7685] font-semibold">{stage.label}</p>
              <p className="text-xl font-black text-[#0b1f3a]">{formatNumberFull(stage.value)}</p>
            </div>
          ))}
        </div>
      </div>
      <EstimatedStagesNote stages={estimatedStages} />
    </div>
  );
}
