"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function InfoTip({
  text,
  side = "bottom",
}: {
  text: string;
  side?: "bottom" | "right";
}) {
  return (
    <span className="relative inline-flex align-middle ml-1 group">
      <Info className="w-3.5 h-3.5 text-[#00b8cf] cursor-help" />
      <span
        className={cn(
          "pointer-events-none absolute z-50 w-64 rounded-xl border border-[#dfe6ee] bg-white p-3 text-[11px] leading-relaxed font-medium normal-case tracking-normal text-[#344255] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity",
          side === "right"
            ? "left-full top-1/2 ml-2 -translate-y-1/2"
            : "left-1/2 top-full mt-2 -translate-x-1/2"
        )}
      >
        {text}
      </span>
    </span>
  );
}
