"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string | string[];
  }[];
  valueFormatter?: "number" | "currency" | "percent" | "compact" | "raw";
  horizontal?: boolean;
  height?: number;
  stacked?: boolean;
  onPointClick?: (label: string, shiftKey: boolean) => void;
}

const formatValue = (v: number, type?: string) => {
  if (type === "percent") return `${v.toFixed(1)}%`;
  if (type === "currency") return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  if (type === "compact") return new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(v);
  if (type === "raw") return String(v);
  return v.toLocaleString("pt-BR");
};

export function BarChart({
  labels,
  datasets,
  valueFormatter,
  horizontal = false,
  height = 260,
  stacked = false,
  onPointClick,
}: BarChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ height }} className="rounded-xl bg-[#f4f7fb]" />;

  const data = {
    labels,
    datasets: datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: Array.isArray(ds.color) ? ds.color.map(c => c + "dd") : ds.color + "dd",
      hoverBackgroundColor: ds.color,
      borderRadius: horizontal ? 4 : 6,
      borderSkipped: false,
      barThickness: datasets.length > 1 ? 16 : 28,
      ...(i > 0 ? { borderRadius: 4 } : {}),
    })),
  };

  const indexAxis = horizontal ? "y" as const : "x" as const;

  const options = {
    indexAxis,
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    onHover: (event: { native?: Event | null }, elements: unknown[]) => {
      const target = event.native?.target;
      if (target instanceof HTMLElement && onPointClick) {
        target.style.cursor = elements.length ? "pointer" : "default";
      }
    },
    onClick: (event: { native?: Event | null }, elements: Array<{ index: number }>) => {
      if (!onPointClick || elements.length === 0) return;
      const native = event.native;
      const shiftKey = native instanceof MouseEvent ? native.shiftKey : false;
      onPointClick(labels[elements[0].index], shiftKey);
    },
    plugins: {
      legend: {
        display: datasets.length > 1,
        position: "top" as const,
        align: "end" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          boxHeight: 8,
          font: { size: 12, weight: 600 },
          color: "#6c7685",
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "#0b1f3a",
        titleColor: "#fff",
        bodyColor: "#d9eaf5",
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (ctx: any) => {
            const raw = horizontal ? ctx.parsed.x : ctx.parsed.y;
            const v = formatValue(raw, valueFormatter);
            return ` ${ctx.dataset.label}: ${v}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked,
        ...(horizontal ? { beginAtZero: true, min: 0 } : {}),
        grid: horizontal ? { color: "#dfe6ee" } : { display: false },
        border: { display: false },
        ticks: {
          font: { size: 11, weight: 700 },
          color: "#6c7685",
          ...(horizontal && valueFormatter
            ? {
                callback: function(value: any) {
                  return formatValue(Number(value), valueFormatter);
                }
              }
            : {})
        },
      },
      y: {
        stacked,
        ...(!horizontal ? { beginAtZero: true, min: 0 } : {}),
        grid: horizontal ? { display: false } : { color: "#dfe6ee", lineWidth: 1 },
        border: { display: false },
        ticks: {
          font: { size: 11, weight: 700 },
          color: "#6c7685",
          ...(!horizontal && valueFormatter
            ? {
                callback: function(value: any) {
                  return formatValue(Number(value), valueFormatter);
                }
              }
            : {})
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
}
