"use client";

import { useState } from "react";
import type { AlertThreshold } from "@/lib/data/types";

export function AlertThresholdControls({ thresholds }: { thresholds: AlertThreshold[] }) {
  const [values, setValues] = useState(thresholds);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {values.map((item) => (
        <label key={item.id} className="bg-white border border-[#dfe6ee] rounded-2xl p-5">
          <p className="text-sm font-black text-[#0b1f3a] mb-2">{item.metric}</p>
          <p className="text-xs text-[#6c7685] mb-3">Limite atual: {item.maxDropPercent}%</p>
          <input
            type="range"
            min={5}
            max={40}
            value={item.maxDropPercent}
            onChange={(e) => {
              const next = Number(e.target.value);
              setValues((prev) => prev.map((row) => (row.id === item.id ? { ...row, maxDropPercent: next } : row)));
            }}
            className="w-full"
          />
          <p className="text-xs font-semibold text-[#153a73] mt-2">{item.maxDropPercent}% gera alerta acionável</p>
        </label>
      ))}
    </div>
  );
}
