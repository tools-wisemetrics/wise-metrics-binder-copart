"use client";

import { useMemo, useState } from "react";
import { LineChart } from "@/components/charts/line-chart";
import { InfoTip } from "@/components/layout/info-tip";
import { COLORS } from "@/lib/constants";
import type { EvolutionSeriesPoint } from "@/lib/data/types";

const KPI_OPTIONS = [
  { id: "entrantes", label: "Entrantes (Copart)", color: COLORS.teal },
  { id: "habilitados", label: "Habilitados (Copart)", color: COLORS.blue },
  { id: "pageViewsGa4", label: "Usuários ativos (GA4)", color: COLORS.green },
  { id: "pageViewsVender", label: "Page views vender (Excel)", color: "#8c5be8" },
  { id: "pageViewsComprar", label: "Page views comprar (Excel)", color: "#c77a00" },
  { id: "leads", label: "Leads Select (semana)", color: "#25d366" },
] as const;

type KpiId = (typeof KPI_OPTIONS)[number]["id"];

function seriesOf(points: EvolutionSeriesPoint[], id: KpiId): number[] {
  return points.map((point) => point[id]);
}

export function EvolutionChart({
  points,
  height = 280,
}: {
  points: EvolutionSeriesPoint[];
  height?: number;
}) {
  const [primary, setPrimary] = useState<KpiId>("entrantes");
  const [cross, setCross] = useState<KpiId | "none">("none");
  const labels = useMemo(() => points.map((point) => point.label), [points]);
  const primaryMeta = KPI_OPTIONS.find((opt) => opt.id === primary)!;
  const crossMeta = KPI_OPTIONS.find((opt) => opt.id === cross);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">
          KPI
          <select
            value={primary}
            onChange={(e) => setPrimary(e.target.value as KpiId)}
            className="h-9 rounded-lg border border-[#dfe6ee] bg-[#f4f7fb] px-2 text-sm font-semibold text-[#0b1f3a]"
          >
            {KPI_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">
          Cruzar
          <select
            value={cross}
            onChange={(e) => setCross(e.target.value as KpiId | "none")}
            className="h-9 rounded-lg border border-[#dfe6ee] bg-[#f4f7fb] px-2 text-sm font-semibold text-[#0b1f3a]"
          >
            <option value="none">Nenhuma</option>
            {KPI_OPTIONS.filter((opt) => opt.id !== primary).map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </label>
        <InfoTip text="Entrantes e habilitados vêm do Excel Copart (dia). Page views vender/comprar são GA4 da aba Select. Usuários ativos são GA4 ago/2026. Leads aparecem no último dia de cada semana. Recortes sem overlap ficam em zero." />
      </div>
      <LineChart
        labels={labels}
        datasets={[
          { label: primaryMeta.label, data: seriesOf(points, primary), color: primaryMeta.color, fill: true, yAxisID: "y" },
          ...(crossMeta
            ? [{ label: crossMeta.label, data: seriesOf(points, crossMeta.id), color: crossMeta.color, yAxisID: "y1" as const }]
            : []),
        ]}
        yLabel={primaryMeta.label}
        y1Label={crossMeta?.label}
        height={height}
      />
    </div>
  );
}
