import { cn } from "@/lib/utils";
import type { FunnelStage } from "@/lib/data/types";
import { InfoTip } from "@/components/layout/info-tip";

interface FunnelChartProps {
  stages: FunnelStage[];
  primaryColor?: string;
  className?: string;
}

function isEstimated(stage: FunnelStage) {
  const text = `${stage.label} ${stage.description ?? ""}`.toLowerCase();
  return text.includes("estimado");
}

export function FunnelChart({
  stages,
  primaryColor = "#00b8cf",
  className,
}: FunnelChartProps) {
  if (!stages || stages.length === 0) {
    return null;
  }

  const max = stages[0]?.value > 0 ? stages[0].value : 1;

  return (
    <div className={cn("space-y-1", className)}>
      {stages.map((stage, i) => {
        const widthPct = (stage.value / max) * 100;
        const isLast = i === stages.length - 1;
        const estimated = isEstimated(stage);

        return (
          <div key={`${stage.label}-${i}`} className="relative">
            <div
              className="flex items-center gap-3 mx-auto transition-all duration-700"
              style={{ width: `${Math.max(widthPct, 30)}%` }}
            >
              <div
                className="flex-1 rounded-xl px-4 py-3 flex items-center min-h-[52px]"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}22, ${primaryColor}11)`,
                  border: `1.5px solid ${primaryColor}44`,
                }}
              >
                <div>
                  <span className="text-[11px] uppercase tracking-widest font-bold text-[#6c7685] inline-flex items-center">
                    {stage.label}
                    {stage.description ? <InfoTip text={stage.description} side="right" /> : null}
                  </span>
                  <span className="text-xl font-black text-[#0b1f3a] block">
                    {stage.value.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>

            {!isLast && !estimated && stage.conversionRate !== undefined && (
              <div className="flex items-center justify-center py-1 gap-2">
                <div className="h-px flex-1 max-w-[200px] bg-[#dfe6ee]" />
                <span className="text-xs font-black text-[#6c7685] flex items-center gap-1">
                  ↓
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-black",
                      stage.conversionRate >= 50
                        ? "bg-[#e8f8ef] text-[#007342]"
                        : "bg-[#fff4df] text-[#8c5700]"
                    )}
                  >
                    {stage.conversionRate.toFixed(1)}% conv.
                  </span>
                </span>
                <div className="h-px flex-1 max-w-[200px] bg-[#dfe6ee]" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function EstimatedStagesNote({ stages }: { stages: FunnelStage[] }) {
  if (!stages.length) return null;
  return (
    <div className="rounded-2xl border border-dashed border-[#dfe6ee] bg-[#fffaf0] p-4 mt-4">
      <p className="text-[10px] uppercase tracking-widest font-bold text-[#c77a00] mb-3">
        Não veio nesta carga — estimado
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stages.map((stage) => (
          <div key={stage.label}>
            <p className="text-[11px] text-[#6c7685] font-semibold">{stage.label}</p>
            <p className="text-lg font-black text-[#0b1f3a]">{stage.value.toLocaleString("pt-BR")}</p>
            {stage.description ? (
              <p className="text-[10px] text-[#6c7685] mt-0.5">{stage.description}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
