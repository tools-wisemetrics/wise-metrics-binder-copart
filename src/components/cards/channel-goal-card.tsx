import { cn } from "@/lib/utils";
import type { ChannelGoal } from "@/lib/data/types";

interface ChannelGoalCardProps {
  goal: ChannelGoal;
  className?: string;
}

const CHANNEL_COPY: Partial<Record<ChannelGoal["channel"], { result: string; converted: string; caption: string }>> = {
  META_ADS: {
    result: "Cadastro (pixel Meta)",
    converted: "Habilitados (estimado)",
    caption: "% da meta de entrantes da unidade — contribuição, não alvo do canal",
  },
  GOOGLE_ADS: {
    result: "Conversões Google Ads",
    converted: "Habilitados (estimado)",
    caption: "% da meta de entrantes da unidade — contribuição, não alvo do canal",
  },
  SEO: {
    result: "Cadastro GA4 alocado (first-touch)",
    converted: "Habilitados (estimado)",
    caption: "% da meta de entrantes da unidade — rateio, não Entrante Copart",
  },
  INSTAGRAM_ORGANIC: {
    result: "Cadastro GA4 alocado (first-touch)",
    converted: "Habilitados (estimado)",
    caption: "% da meta de entrantes da unidade — rateio, não Entrante Copart",
  },
  RD_STATION: {
    result: "Eventos de formulário RD",
    converted: "Formulário embutido (GA4)",
    caption: "% da meta de entrantes da unidade — não é lead CRM oficial",
  },
  BLIP: {
    result: "Conversas WhatsApp",
    converted: "Novos contatos",
    caption: "% da meta semanal de conversas Select — não é a meta de 20 mil",
  },
};

export function ChannelGoalCard({ goal, className }: ChannelGoalCardProps) {
  const entrantes = goal.metrics.entrantes;
  const habilitados = goal.metrics.habilitados;
  const hasData = goal.hasData !== false;
  const copy = CHANNEL_COPY[goal.channel];
  const resultLabel = goal.resultLabel ?? copy?.result ?? "Resultado nativo";
  const convertedLabel = goal.convertedLabel ?? copy?.converted ?? "Avanço";
  const progressCaption = goal.progressCaption ?? copy?.caption ?? "% da meta da unidade";

  return (
    <div
      className={cn(
        "bg-white border border-[#dfe6ee] rounded-2xl p-5 relative overflow-hidden",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0b1f3a]/5 transition-all duration-200",
        !hasData && "opacity-70",
        className
      )}
      style={{ borderLeftWidth: 4, borderLeftColor: goal.color }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${goal.color}15` }}
          >
            <div className="w-4 h-4 rounded-full" style={{ background: goal.color }} />
          </div>
          <div>
            <p className="text-sm font-black text-[#0b1f3a]">{goal.channelLabel}</p>
            {goal.sourceNote && (
              <p className="text-[10px] text-[#6c7685] font-medium mt-0.5">{goal.sourceNote}</p>
            )}
          </div>
        </div>
      </div>

      {!hasData ? (
        <p className="text-sm font-semibold text-[#6c7685]">Sem extração nesta carga</p>
      ) : (
        <>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-[0.07em] font-bold text-[#6c7685]">
                {resultLabel}
              </span>
              <span className="text-xs font-bold text-[#0b1f3a]">
                {entrantes.current.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="h-2.5 bg-[#e9eef5] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(entrantes.percentage, 100)}%`,
                  background: "linear-gradient(90deg, #153a73, #153a73cc)",
                }}
              />
            </div>
            <p className="text-[10px] font-bold text-[#6c7685] mt-0.5">
              {entrantes.percentage.toFixed(1)}% · {progressCaption.replace(/^%\s*/, "")}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-[0.07em] font-bold text-[#6c7685]">
                {convertedLabel}
              </span>
              <span className="text-xs font-bold text-[#0b1f3a]">
                {habilitados.current.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="h-2.5 bg-[#e9eef5] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(habilitados.percentage, 100)}%`,
                  background: "linear-gradient(90deg, #00b8cf, #00b8cfcc)",
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
