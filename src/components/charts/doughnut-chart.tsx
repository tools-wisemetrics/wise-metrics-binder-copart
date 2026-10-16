"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

import { cn } from "@/lib/utils";

interface DoughnutChartProps {
  labels: string[];
  data: number[];
  colors: string[];
  centerLabel?: string;
  centerValue?: string;
  height?: number;
  legendPosition?: "right" | "bottom";
}

export function DoughnutChart({
  labels,
  data,
  colors,
  centerLabel,
  centerValue,
  height = 260,
  legendPosition = "right",
}: DoughnutChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ height }} className="rounded-xl bg-[#f4f7fb]" />;

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors.map((c) => (c.startsWith("#") && c.length === 7 ? c + "dd" : c)),
        hoverBackgroundColor: colors,
        borderColor: "#fff",
        borderWidth: 3,
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    layout: {
      padding: 0,
    },
    plugins: {
      legend: {
        display: false, // We use a custom HTML legend instead
      },
      tooltip: {
        backgroundColor: "#0b1f3a",
        titleColor: "#fff",
        bodyColor: "#d9eaf5",
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (ctx: any) => {
            const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : "0.0";
            return ` ${ctx.label}: ${ctx.parsed.toLocaleString("pt-BR")} (${pct}%)`;
          },
        },
      },
    },
  };

  const total = data.reduce((a, b) => a + b, 0);

  return (
    <div 
      className={cn(
        "flex", 
        legendPosition === "right" ? "flex-row items-center" : "flex-col"
      )} 
      style={{ height }}
    >
      <div className="relative flex-1 h-full min-w-0">
        <Doughnut data={chartData} options={options} />
        {centerValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl sm:text-2xl font-black text-[#0b1f3a] leading-none">{centerValue}</span>
            {centerLabel && <span className="text-[10px] sm:text-xs text-[#6c7685] font-semibold mt-1 uppercase tracking-wider">{centerLabel}</span>}
          </div>
        )}
      </div>

      <div 
        className={cn(
          "flex gap-2 overflow-y-auto no-scrollbar",
          legendPosition === "right" 
            ? "flex-col justify-center pl-4 ml-2 border-l border-[#dfe6ee] max-w-[45%] shrink-0 max-h-full" 
            : "flex-row flex-wrap justify-center pt-4 mt-2"
        )}
      >
        {labels.map((label, i) => {
           const pct = total > 0 ? ((data[i] / total) * 100).toFixed(0) : 0;
           return (
             <div key={`${label}-${i}`} className="flex items-center gap-2 text-[11px] font-semibold text-[#344255]">
               <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[i] }} />
               <span className="truncate">{label} — {pct}%</span>
             </div>
           );
        })}
      </div>
    </div>
  );
}
