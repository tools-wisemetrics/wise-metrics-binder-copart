"use client";

import React, { useMemo, useState } from "react";
import { BrazilHeatMap } from "@/components/charts/brazil-heatmap";
import { InfoTip } from "@/components/layout/info-tip";
import { formatBRL, formatNumberFull, formatPercentage } from "@/lib/utils/formatters";
import type { RegionalRow, CampaignScorecard, MediaEfficiencyRow } from "@/lib/data/types";
import { MacroRegionCards } from "@/components/regional/macro-region-cards";
import { RegionalCampaignTable } from "@/components/regional/regional-campaign-table";
import { RegionalUfMasterTable } from "@/components/regional/regional-uf-master-table";
import { RegionalInsightsCard } from "@/components/regional/regional-insights-card";
import { CardWrapper } from "@/components/layout/page-header";
import { MapPin, Trophy, Users, TrendingUp, DollarSign, Award, Layers } from "lucide-react";

type MapKpi = "entrantes" | "habilitados" | "taxa";
type Mode = "volume" | "per_capita";

interface RegionalExplorerProps {
  rows: RegionalRow[];
  scorecards?: CampaignScorecard[];
  mediaEfficiency?: MediaEfficiencyRow[];
}

export function RegionalExplorer({
  rows,
  scorecards = [],
  mediaEfficiency = [],
}: RegionalExplorerProps) {
  const [kpi, setKpi] = useState<MapKpi>("entrantes");
  const [mode, setMode] = useState<Mode>("volume");

  // Calculate total spend from campaigns
  const totalSpend = useMemo(() => {
    return scorecards.reduce((sum, c) => sum + (c.spend || 0), 0);
  }, [scorecards]);

  // Aggregate summary metrics
  const totalEntrantes = useMemo(
    () => rows.reduce((sum, r) => sum + r.entrantes, 0),
    [rows]
  );
  const totalHabilitados = useMemo(
    () => rows.reduce((sum, r) => sum + r.habilitados, 0),
    [rows]
  );
  const avgTaxa = totalEntrantes > 0 ? (totalHabilitados / totalEntrantes) * 100 : 0;

  // Leader states
  const topVolumeState = useMemo(() => {
    const sorted = [...rows].sort((a, b) => b.entrantes - a.entrantes);
    return sorted[0] || { label: "N/D", entrantes: 0, geo: "" };
  }, [rows]);

  const topPerCapitaState = useMemo(() => {
    const sorted = [...rows].sort(
      (a, b) => b.perCapitaEntrantes - a.perCapitaEntrantes
    );
    return sorted[0] || { label: "N/D", perCapitaEntrantes: 0, geo: "" };
  }, [rows]);

  const mapped = useMemo(() => {
    return rows.map((row) => {
      const volume =
        kpi === "entrantes"
          ? row.entrantes
          : kpi === "habilitados"
          ? row.habilitados
          : row.taxa_habilitacao;
      const perCapita =
        kpi === "entrantes"
          ? row.perCapitaEntrantes
          : kpi === "habilitados"
          ? row.perCapitaHabilitados
          : row.taxa_habilitacao;
      const value = mode === "per_capita" && kpi !== "taxa" ? perCapita : volume;
      return { ...row, entrantes: value };
    });
  }, [rows, kpi, mode]);

  const ranking = useMemo(() => {
    return rows.filter(
      (row) =>
        (row.geo !== "OUTROS" && row.geo !== "VAZIAS") ||
        row.entrantes > 0 ||
        row.habilitados > 0
    );
  }, [rows]);

  return (
    <div className="space-y-8">
      {/* KPI Executive Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Entrantes */}
        <div className="rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1">
            <Users className="w-3.5 h-3.5 text-[#00b8cf]" />
            Total Entrantes
          </div>
          <p className="text-2xl font-black text-[#0b1f3a]">
            {formatNumberFull(totalEntrantes)}
          </p>
          <p className="text-[11px] font-semibold text-[#8aa4be] mt-1">27 UFs + Outros</p>
        </div>

        {/* Total Habilitados */}
        <div className="rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#00a85a]" />
            Total Habilitados
          </div>
          <p className="text-2xl font-black text-[#0b1f3a]">
            {formatNumberFull(totalHabilitados)}
          </p>
          <p className="text-[11px] font-semibold text-[#00a85a] mt-1">Habilitação oficial</p>
        </div>

        {/* Taxa de Habilitação */}
        <div className="rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1">
            <Award className="w-3.5 h-3.5 text-[#153a73]" />
            Taxa Média Habilitação
          </div>
          <p className="text-2xl font-black text-[#0b1f3a]">
            {formatPercentage(avgTaxa, 1)}
          </p>
          <p className="text-[11px] font-semibold text-[#153a73] mt-1">Média nacional</p>
        </div>

        {/* UF Líder Volume */}
        <div className="rounded-2xl border-2 border-[#00b8cf] bg-gradient-to-br from-white to-[#00b8cf]/5 p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#00b8cf] mb-1">
            <Trophy className="w-3.5 h-3.5 text-[#00b8cf]" />
            Líder Absoluto
          </div>
          <p className="text-xl font-black text-[#0b1f3a]">
            {topVolumeState.geo} ({formatNumberFull(topVolumeState.entrantes)})
          </p>
          <p className="text-[11px] font-bold text-[#00b8cf] mt-1">
            {formatPercentage(
              totalEntrantes > 0 ? (topVolumeState.entrantes / totalEntrantes) * 100 : 0,
              1
            )}{" "}
            do volume
          </p>
        </div>

        {/* UF Líder Per Capita */}
        <div className="rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#f59e0b]" />
            Líder Per Capita
          </div>
          <p className="text-xl font-black text-[#0b1f3a]">
            {topPerCapitaState.geo} ({topPerCapitaState.perCapitaEntrantes.toFixed(1)})
          </p>
          <p className="text-[11px] font-semibold text-[#6c7685] mt-1">por 100 mil hab.</p>
        </div>

        {/* Gasto Mídia Regional */}
        <div className="rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1">
            <DollarSign className="w-3.5 h-3.5 text-[#00b8cf]" />
            Verba Alocada
          </div>
          <p className="text-2xl font-black text-[#0b1f3a]">
            {formatBRL(totalSpend)}
          </p>
          <p className="text-[11px] font-semibold text-[#8aa4be] mt-1">Campanhas regionais</p>
        </div>
      </div>

      {/* Macro-Region Cards */}
      <MacroRegionCards rows={rows} totalSpend={totalSpend} />

      {/* Strategic Regional Insights */}
      <RegionalInsightsCard />

      {/* Heatmap & Ranking Interactive Explorer */}
      <CardWrapper title="Explorador Geográfico & Mapa de Calor do Brasil" subtitle="Cruzamento por estado (27 UFs) com filtros de métricas e escalonamento de volume">
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-4 p-3 bg-[#f4f7fb] rounded-xl border border-[#dfe6ee]">
            <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">
              KPI do mapa
              <select
                value={kpi}
                onChange={(e) => setKpi(e.target.value as MapKpi)}
                className="h-9 rounded-lg border border-[#dfe6ee] bg-white px-3 text-xs font-bold text-[#0b1f3a] focus:outline-none focus:border-[#00b8cf]"
              >
                <option value="entrantes">Entrantes</option>
                <option value="habilitados">Habilitados</option>
                <option value="taxa">Taxa de habilitação</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">
              Escala de Exibição
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
                className="h-9 rounded-lg border border-[#dfe6ee] bg-white px-3 text-xs font-bold text-[#0b1f3a] focus:outline-none focus:border-[#00b8cf]"
              >
                <option value="volume">Volume absoluto</option>
                <option value="per_capita">Per capita (por 100 mil hab.)</option>
              </select>
            </label>

            <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-[#6c7685]">
              <span>UFs com dado de cadastro/habilitação Copart ERP</span>
              <InfoTip text="O Excel Copart traz entrantes e habilitados por estado. UFs com volume zero na extração são indicadas como 'Zero no recorte'. Per capita utiliza IBGE 2024." />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BrazilHeatMap rows={mapped} />

            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {ranking.map((row) => (
                <div
                  key={row.geo}
                  className="bg-white border border-[#dfe6ee] rounded-xl p-3 flex items-center justify-between gap-4 hover:border-[#00b8cf] transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-7 rounded-md bg-[#0b1f3a] text-white font-black text-xs flex items-center justify-center">
                      {row.geo}
                    </span>
                    <div>
                      <p className="font-bold text-[#0b1f3a] text-xs">{row.label}</p>
                      <p className="text-[10px] text-[#6c7685]">
                        {row.source === "empty"
                          ? "Zero no recorte"
                          : formatPercentage(row.taxa_habilitacao) + " habilitação"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-[#0b1f3a] text-sm">
                      {kpi === "taxa"
                        ? formatPercentage(row.taxa_habilitacao)
                        : formatNumberFull(
                            mode === "per_capita"
                              ? kpi === "habilitados"
                                ? row.perCapitaHabilitados
                                : row.perCapitaEntrantes
                              : kpi === "habilitados"
                                ? row.habilitados
                                : row.entrantes
                          )}
                    </p>
                    {mode === "volume" && kpi !== "taxa" && (
                      <p className="text-[10px] text-[#6c7685] font-semibold">
                        {formatNumberFull(row.habilitados)} hab.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardWrapper>

      {/* Regional Campaigns Table */}
      {scorecards.length > 0 && <RegionalCampaignTable scorecards={scorecards} />}

      {/* Master State Table */}
      <RegionalUfMasterTable rows={rows} totalSpend={totalSpend} />
    </div>
  );
}
