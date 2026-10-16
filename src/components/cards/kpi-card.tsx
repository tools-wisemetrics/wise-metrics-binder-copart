"use client";

import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface KpiCardProps {
  title: string;
  value: string;
  delta?: number;
  deltaFormatted?: string;
  deltaType?: "good" | "bad" | "neutral";
  period?: string;
  tooltip?: string;
  insights?: string[];
  className?: string;
}

export function KpiCard({
  title,
  value,
  delta,
  deltaFormatted,
  deltaType = "neutral",
  period,
  tooltip,
  insights,
  className,
}: KpiCardProps) {
  const DeltaIcon =
    deltaType === "good"
      ? ArrowUpRight
      : deltaType === "bad"
      ? ArrowDownRight
      : Minus;

  return (
    <div
      className={cn(
        "bg-white border border-[#dfe6ee] rounded-2xl p-4 min-h-[112px]",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0b1f3a]/5",
        "transition-all duration-200 cursor-default",
        className
      )}
    >
      {/* Title row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-[0.07em] font-bold text-[#6c7685]">
          {title}
        </span>
        
        {insights && insights.length > 0 ? (
          <Popover>
            <PopoverTrigger className="w-5 h-5 rounded-full bg-[#eef4ff] border border-[#cfe3ee] text-[#153a73] text-[11px] font-black flex items-center justify-center hover:bg-[#153a73] hover:text-white transition-colors">
              i
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 bg-white text-[#0b1f3a] border-[#dfe6ee] shadow-xl">
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[#153a73]">Insights:</h4>
                <ul className="text-xs text-[#6c7685] space-y-1.5 list-disc pl-4">
                  {insights.map((insight, i) => (
                    <li key={i} className="leading-relaxed">{insight}</li>
                  ))}
                </ul>
              </div>
            </PopoverContent>
          </Popover>
        ) : tooltip ? (
          <Tooltip>
            <TooltipTrigger className="w-5 h-5 rounded-full bg-[#eef4ff] border border-[#cfe3ee] text-[#153a73] text-[11px] font-black flex items-center justify-center hover:bg-[#153a73] hover:text-white transition-colors">
              i
            </TooltipTrigger>
            <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      {/* Value */}
      <div className="text-[28px] font-black text-[#0b1f3a] tracking-tight leading-none mb-3">
        {value}
      </div>

      {/* Delta */}
      {delta !== undefined && (
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-black rounded-full px-2 py-0.5",
              deltaType === "good" && "text-[#007342] bg-[#e8f8ef]",
              deltaType === "bad" && "text-[#b2162e] bg-[#fdecee]",
              deltaType === "neutral" && "text-[#667085] bg-[#f0f2f5]"
            )}
          >
            <DeltaIcon className="w-3 h-3" />
            {deltaFormatted || `${delta > 0 ? "+" : ""}${delta.toFixed(2)}%`}
          </span>
          {period && (
            <span className="text-xs text-[#6c7685]">{period}</span>
          )}
        </div>
      )}
    </div>
  );
}
