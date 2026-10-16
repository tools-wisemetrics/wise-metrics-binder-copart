import { cn } from "@/lib/utils";
import type { Alert } from "@/lib/data/types";

const SEVERITY_MAP = {
  critical: {
    icon: "🔴",
    label: "CRÍTICO",
    border: "border-l-[#cf3044]",
    badge: "bg-[#fdecee] text-[#b2162e]",
    bg: "bg-[#fff8f8]",
  },
  warning: {
    icon: "⚠️",
    label: "AVISO",
    border: "border-l-[#c77a00]",
    badge: "bg-[#fff4df] text-[#8c5700]",
    bg: "bg-[#fffdf5]",
  },
  info: {
    icon: "ℹ️",
    label: "INFO",
    border: "border-l-[#00b8cf]",
    badge: "bg-[#eef9ff] text-[#007a8c]",
    bg: "bg-[#f8fdff]",
  },
};

interface AlertCardProps {
  alert: Alert;
  className?: string;
}

export function AlertCard({ alert, className }: AlertCardProps) {
  const config = SEVERITY_MAP[alert.severity];
  const date = new Date(alert.timestamp);
  const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className={cn(
        "rounded-2xl p-5 border border-[#dfe6ee] border-l-4",
        config.border,
        config.bg,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{config.icon}</span>
          <span
            className={cn(
              "text-[10px] uppercase tracking-[0.08em] font-black px-2 py-0.5 rounded-full",
              config.badge
            )}
          >
            {config.label}
          </span>
        </div>
        <span className="text-xs text-[#6c7685] flex-shrink-0">{timeStr}</span>
      </div>

      <p className="font-black text-sm text-[#0b1f3a] mb-1 font-mono">
        {alert.title}
      </p>
      <p className="text-sm text-[#344255] mb-3 leading-relaxed">
        {alert.description}
      </p>

      <div className="pt-3 border-t border-[#dfe6ee] space-y-1">
        <div className="flex items-start gap-2">
          <span className="text-xs font-bold text-[#6c7685] flex-shrink-0 w-20">Ação:</span>
          <span className="text-xs text-[#344255]">{alert.action}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#6c7685] w-20">Responsável:</span>
          <span className="text-xs font-bold text-[#153a73]">{alert.responsavel}</span>
        </div>
      </div>
    </div>
  );
}
