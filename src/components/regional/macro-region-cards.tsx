"use client";

import React from "react";
import { formatBRL, formatNumberFull, formatPercentage } from "@/lib/utils/formatters";
import type { RegionalRow } from "@/lib/data/types";
import { InfoTip } from "@/components/layout/info-tip";
import { MapPin, TrendingUp, Users, Target } from "lucide-react";

export interface MacroRegionData {
  id: string;
  name: string;
  color: string;
  ufs: string[];
  entrantes: number;
  habilitados: number;
  taxa: number;
  shareEntrantes: number;
  population: number;
  perCapitaEntrantes: number;
  estSpend: number;
  estCph: number;
}

const MACRO_REGIONS_CONFIG: Record<
  string,
  { name: string; color: string; ufs: string[] }
> = {
  Sudeste: {
    name: "Sudeste",
    color: "#00b8cf",
    ufs: ["SP", "RJ", "MG", "ES"],
  },
  Sul: {
    name: "Sul",
    color: "#00a85a",
    ufs: ["PR", "SC", "RS"],
  },
  CentroOeste: {
    name: "Centro-Oeste",
    color: "#f59e0b",
    ufs: ["GO", "DF", "MT", "MS"],
  },
  Nordeste: {
    name: "Nordeste",
    color: "#8c5be8",
    ufs: ["BA", "PE", "CE", "MA", "PB", "RN", "AL", "SE", "PI"],
  },
  Norte: {
    name: "Norte",
    color: "#ec4899",
    ufs: ["AM", "PA", "AP", "TO", "RO", "RR", "AC"],
  },
};

export function MacroRegionCards({
  rows,
  totalSpend,
}: {
  rows: RegionalRow[];
  totalSpend: number;
}) {
  const totalNationalEntrantes = Math.max(
    1,
    rows.reduce((sum, r) => sum + r.entrantes, 0)
  );

  const macroData = React.useMemo(() => {
    const mapByUf = new Map(rows.map((r) => [r.geo, r]));

    return Object.entries(MACRO_REGIONS_CONFIG).map(([key, config]) => {
      let entrantes = 0;
      let habilitados = 0;
      let population = 0;

      config.ufs.forEach((uf) => {
        const row = mapByUf.get(uf);
        if (row) {
          entrantes += row.entrantes;
          habilitados += row.habilitados;
          population += row.population;
        }
      });

      const taxa = entrantes > 0 ? (habilitados / entrantes) * 100 : 0;
      const shareEntrantes = (entrantes / totalNationalEntrantes) * 100;
      const perCapitaEntrantes =
        population > 0 ? (entrantes / (population / 100_000)) : 0;
      const estSpend = totalSpend * (entrantes / totalNationalEntrantes);
      const estCph = habilitados > 0 ? estSpend / habilitados : 0;

      return {
        id: key,
        name: config.name,
        color: config.color,
        ufs: config.ufs,
        entrantes,
        habilitados,
        taxa,
        shareEntrantes,
        population,
        perCapitaEntrantes,
        estSpend,
        estCph,
      };
    });
  }, [rows, totalSpend, totalNationalEntrantes]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-[#0b1f3a] flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#00b8cf]" />
          Desempenho por Macro-Região do Brasil
        </h3>
        <span className="text-xs font-semibold text-[#6c7685]">
          5 Macro-Regiões IBGE
          <InfoTip text="Agrupamento das 27 UFs em Sudeste, Sul, Centro-Oeste, Nordeste e Norte. Investimento estimado proporcional ao volume de entrantes de cada região." />
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {macroData.map((reg) => (
          <div
            key={reg.id}
            className="rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm relative overflow-hidden transition-all hover:border-[#00b8cf]"
          >
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: reg.color }}
            />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-[#0b1f3a] uppercase tracking-wider">
                {reg.name}
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: reg.color }}
              >
                {formatPercentage(reg.shareEntrantes, 1)} share
              </span>
            </div>

            <div className="space-y-2 mt-3">
              <div>
                <p className="text-[10px] font-bold uppercase text-[#6c7685]">Entrantes</p>
                <p className="text-xl font-black text-[#0b1f3a]">
                  {formatNumberFull(reg.entrantes)}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#dfe6ee]">
                <span className="text-[#6c7685] font-semibold">Habilitados:</span>
                <span className="font-bold text-[#0b1f3a]">
                  {formatNumberFull(reg.habilitados)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6c7685] font-semibold">Tx Habilitação:</span>
                <span className="font-bold text-[#00a85a]">
                  {formatPercentage(reg.taxa, 1)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6c7685] font-semibold">Per 100k hab.:</span>
                <span className="font-bold text-[#153a73]">
                  {reg.perCapitaEntrantes.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#dfe6ee]">
                <span className="text-[#6c7685] font-semibold">CPH Estimado:</span>
                <span className="font-bold text-[#0b1f3a]">
                  {reg.estCph > 0 ? formatBRL(reg.estCph) : "N/D"}
                </span>
              </div>
            </div>

            <div className="mt-3 text-[10px] font-semibold text-[#8aa4be] truncate">
              UFs: {reg.ufs.join(", ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
