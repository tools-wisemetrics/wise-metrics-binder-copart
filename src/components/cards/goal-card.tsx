import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface GoalCardProps {
  title: string;
  current: number;
  target: number;
  percentage: number;
  delta?: number;
  deltaLabel?: string;
  deltaType?: "good" | "bad" | "neutral";
  color?: string;
  className?: string;
}

export function GoalCard({
  title,
  current,
  target,
  percentage,
  delta,
  deltaLabel,
  deltaType,
  color = "#00b8cf",
  className,
}: GoalCardProps) {
  const capped = Math.min(percentage, 100);
  const showDelta = Boolean(deltaLabel);
  const DeltaIcon = (delta ?? 0) >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className={cn(
        "bg-white border border-[#dfe6ee] rounded-2xl p-5",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0b1f3a]/5 transition-all duration-200",
        className
      )}
    >
      <p className="text-[11px] uppercase tracking-[0.07em] font-bold text-[#6c7685] mb-2">
        {title}
      </p>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-[32px] font-black text-[#0b1f3a] leading-none tracking-tight">
          {current.toLocaleString("pt-BR")}
        </span>
        <span className="text-lg text-[#6c7685] font-semibold">
          / {target.toLocaleString("pt-BR")}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-[#e9eef5] rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${capped}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-black text-[#0b1f3a]">{percentage.toFixed(1)}% da meta</span>
        {showDelta && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-bold rounded-full px-2 py-0.5",
              deltaType === "good" && "text-[#007342] bg-[#e8f8ef]",
              deltaType === "bad" && "text-[#b2162e] bg-[#fdecee]",
              deltaType === "neutral" && "text-[#667085] bg-[#f0f2f5]"
            )}
          >
            <DeltaIcon className="w-3 h-3" />
            {(delta ?? 0) > 0 ? "+" : ""}{(delta ?? 0).toFixed(2)}% {deltaLabel}
          </span>
        )}
      </div>
    </div>
  );
}
