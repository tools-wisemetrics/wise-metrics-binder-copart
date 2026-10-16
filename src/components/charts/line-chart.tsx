"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import type { TooltipItem } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
    fill?: boolean;
    yAxisID?: "y" | "y1";
  }[];
  yLabel?: string;
  y1Label?: string;
  valueFormatter?: "number" | "currency" | "percent" | "compact" | "raw";
  height?: number;
}

const formatValue = (v: number, type?: string) => {
  if (type === "percent") return `${v.toFixed(1)}%`;
  if (type === "currency") return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  if (type === "compact") return new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(v);
  if (type === "raw") return String(v);
  return v.toLocaleString("pt-BR");
};

export function LineChart({
  labels,
  datasets,
  yLabel,
  y1Label,
  valueFormatter,
  height = 260,
}: LineChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ height }} className="rounded-xl bg-[#f4f7fb]" />;

  const dual = datasets.some((ds) => ds.yAxisID === "y1");
  const data = {
    labels,
    datasets: datasets.map((ds) => ({
      label: ds.label,
      data: ds.data,
      borderColor: ds.color,
      backgroundColor: ds.fill ? `${ds.color}15` : "transparent",
      fill: ds.fill ?? false,
      tension: 0.4,
      borderWidth: 2.5,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: ds.color,
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      yAxisID: ds.yAxisID ?? "y",
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
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
          label: (ctx: TooltipItem<"line">) => {
            return ` ${ctx.dataset.label}: ${formatValue(Number(ctx.parsed.y ?? 0), valueFormatter)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          font: { size: 11, weight: 700 as const },
          color: "#6c7685",
        },
      },
      y: {
        beginAtZero: true,
        min: 0,
        grace: 0,
        position: "left" as const,
        grid: { color: "#dfe6ee", lineWidth: 1 },
        border: { display: false, dash: [4, 4] },
        ticks: {
          font: { size: 11, weight: 700 as const },
          color: "#6c7685",
          callback: (value: number | string) =>
            valueFormatter ? formatValue(Number(value), valueFormatter) : value,
        },
        ...(yLabel ? { title: { display: true, text: yLabel, color: "#6c7685", font: { size: 11 } } } : {}),
      },
      ...(dual
        ? {
            y1: {
              beginAtZero: true,
              min: 0,
              grace: 0,
              position: "right" as const,
              grid: { drawOnChartArea: false },
              border: { display: false },
              ticks: {
                font: { size: 11, weight: 700 as const },
                color: "#6c7685",
                callback: (value: number | string) =>
                  valueFormatter ? formatValue(Number(value), valueFormatter) : value,
              },
              ...(y1Label ? { title: { display: true, text: y1Label, color: "#6c7685", font: { size: 11 } } } : {}),
            },
          }
        : {}),
    },
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
}
