"use client";

import React, { useState } from "react";
import type { CampaignScorecard } from "@/lib/data/types";
import { formatBRL, formatNumberFull, formatPercentage } from "@/lib/utils/formatters";
import { CardWrapper } from "@/components/layout/page-header";
import { InfoTip } from "@/components/layout/info-tip";
import { Layers, CheckCircle2, AlertTriangle, XCircle, Search } from "lucide-react";

export function RegionalCampaignTable({
  scorecards,
}: {
  scorecards: CampaignScorecard[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Filter regional campaigns
  const filtered = React.useMemo(() => {
    return scorecards.filter((row) => {
      const matchSearch =
        search === "" ||
        row.campaign_name.toLowerCase().includes(search.toLowerCase()) ||
        row.channel.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || row.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [scorecards, search, statusFilter]);

  // Determine regional targeting tag for campaign name
  const getRegionalFocus = (name: string) => {
    const n = name.toUpperCase();
    if (n.includes("GOIÂNIA") || n.includes("GO") || n.includes("CENTRO")) return "Goiânia / Centro-Oeste";
    if (n.includes("SP") || n.includes("SÃO PAULO")) return "São Paulo / Sudeste";
    if (n.includes("RJ") || n.includes("RIO")) return "Rio de Janeiro / Sudeste";
    if (n.includes("SUL") || n.includes("CURITIBA")) return "Região Sul";
    if (n.includes("NORDESTE")) return "Região Nordeste";
    return "Cobertura Nacional / Hubs";
  };

  const getStatusBadge = (status: CampaignScorecard["status"]) => {
    if (status === "on_target") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00a85a] bg-[#00a85a]/10 px-2.5 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3" />
          No Alvo
        </span>
      );
    }
    if (status === "below_target") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#f59e0b] bg-[#f59e0b]/10 px-2.5 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3" />
          Atenção
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#cf3044] bg-[#cf3044]/10 px-2.5 py-0.5 rounded-full">
        <XCircle className="w-3 h-3" />
        Crítico
      </span>
    );
  };

  return (
    <CardWrapper title="Campanhas de Mídia com Direcionamento Regional" subtitle="Desempenho operacional de mídia cruzado por regiões e polos estratégicos da Copart">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-[#dfe6ee]">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#6c7685] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar campanha ou região..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#dfe6ee] bg-[#f4f7fb] text-xs font-semibold text-[#0b1f3a] focus:outline-none focus:border-[#00b8cf]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-xl border border-[#dfe6ee] bg-[#f4f7fb] px-3 text-xs font-semibold text-[#0b1f3a] focus:outline-none focus:border-[#00b8cf]"
          >
            <option value="ALL">Todos os status</option>
            <option value="on_target">No Alvo</option>
            <option value="below_target">Atenção</option>
            <option value="critical">Crítico</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-[#6c7685]">
          Exibindo {filtered.length} de {scorecards.length} campanhas
          <InfoTip text="Campanhas extraídas do Google Ads e Meta Ads. Mostra o valor investido, resultados nativos (cadastros/leads/conversas), CTR, CPC e Custo por Resultado." />
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#dfe6ee] text-[10px] font-black uppercase tracking-wider text-[#6c7685]">
              <th className="py-3 px-3">Campanha</th>
              <th className="py-3 px-3">Canal</th>
              <th className="py-3 px-3">Foco Regional</th>
              <th className="py-3 px-3 text-right">Investimento</th>
              <th className="py-3 px-3 text-right">Impressões</th>
              <th className="py-3 px-3 text-right">Cliques</th>
              <th className="py-3 px-3 text-right">CTR</th>
              <th className="py-3 px-3 text-right">Resultados</th>
              <th className="py-3 px-3 text-right">Custo / Result.</th>
              <th className="py-3 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dfe6ee]">
            {filtered.map((row, idx) => {
              const regFocus = getRegionalFocus(row.campaign_name);
              const cpa = row.entrantes > 0 ? row.spend / row.entrantes : 0;

              return (
                <tr key={idx} className="hover:bg-[#f4f7fb] transition">
                  <td className="py-3 px-3 max-w-[280px]">
                    <p className="text-xs font-bold text-[#0b1f3a] truncate" title={row.campaign_name}>
                      {row.campaign_name}
                    </p>
                    <p className="text-[10px] text-[#6c7685] font-semibold">
                      Unidade: {row.campaign_type}
                    </p>
                  </td>

                  <td className="py-3 px-3 text-xs font-bold text-[#153a73]">
                    {row.channel}
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-[11px] font-bold text-[#00b8cf] bg-[#00b8cf]/10 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      {regFocus}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-xs text-right font-black text-[#0b1f3a]">
                    {formatBRL(row.spend)}
                  </td>

                  <td className="py-3 px-3 text-xs text-right font-semibold text-[#344255]">
                    {row.impressions ? formatNumberFull(row.impressions) : "—"}
                  </td>

                  <td className="py-3 px-3 text-xs text-right font-semibold text-[#344255]">
                    {row.clicks ? formatNumberFull(row.clicks) : "—"}
                  </td>

                  <td className="py-3 px-3 text-xs text-right font-semibold text-[#344255]">
                    {row.ctr !== null ? formatPercentage(row.ctr, 2) : "—"}
                  </td>

                  <td className="py-3 px-3 text-xs text-right font-black text-[#00a85a]">
                    {formatNumberFull(row.entrantes)}
                  </td>

                  <td className="py-3 px-3 text-xs text-right font-bold text-[#0b1f3a]">
                    {cpa > 0 ? formatBRL(cpa) : "—"}
                  </td>

                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {getStatusBadge(row.status)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </CardWrapper>
  );
}
