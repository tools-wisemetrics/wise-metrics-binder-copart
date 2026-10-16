"use client";

import React, { useState, useMemo } from "react";
import type { RegionalRow } from "@/lib/data/types";
import { formatBRL, formatNumberFull, formatPercentage } from "@/lib/utils/formatters";
import { CardWrapper } from "@/components/layout/page-header";
import { InfoTip } from "@/components/layout/info-tip";
import { Search, ArrowUpDown, ShieldCheck } from "lucide-react";

const UF_TO_MACRO: Record<string, string> = {
  SP: "Sudeste",
  RJ: "Sudeste",
  MG: "Sudeste",
  ES: "Sudeste",
  PR: "Sul",
  SC: "Sul",
  RS: "Sul",
  GO: "Centro-Oeste",
  DF: "Centro-Oeste",
  MT: "Centro-Oeste",
  MS: "Centro-Oeste",
  BA: "Nordeste",
  PE: "Nordeste",
  CE: "Nordeste",
  MA: "Nordeste",
  PB: "Nordeste",
  RN: "Nordeste",
  AL: "Nordeste",
  SE: "Nordeste",
  PI: "Nordeste",
  AM: "Norte",
  PA: "Norte",
  AP: "Norte",
  TO: "Norte",
  RO: "Norte",
  RR: "Norte",
  AC: "Norte",
  OUTROS: "Outros / Não atribuído",
  VAZIAS: "Sem UF",
};

type SortField =
  | "label"
  | "entrantes"
  | "habilitados"
  | "taxa_habilitacao"
  | "perCapitaEntrantes"
  | "perCapitaHabilitados"
  | "estSpend"
  | "estCph";

export function RegionalUfMasterTable({
  rows,
  totalSpend,
}: {
  rows: RegionalRow[];
  totalSpend: number;
}) {
  const [search, setSearch] = useState("");
  const [macroFilter, setMacroFilter] = useState("ALL");
  const [sortField, setSortField] = useState<SortField>("entrantes");
  const [sortAsc, setSortAsc] = useState(false);

  const totalNationalEntrantes = Math.max(
    1,
    rows.reduce((sum, r) => sum + r.entrantes, 0)
  );

  // Augment rows with estimated spend & CPH
  const augmentedRows = useMemo(() => {
    return rows.map((r) => {
      const estSpend = totalSpend * (r.entrantes / totalNationalEntrantes);
      const estCph = r.habilitados > 0 ? estSpend / r.habilitados : 0;
      const macro = UF_TO_MACRO[r.geo] || "Outros";
      return {
        ...r,
        macro,
        estSpend,
        estCph,
      };
    });
  }, [rows, totalSpend, totalNationalEntrantes]);

  // Filter and sort
  const filteredAndSorted = useMemo(() => {
    return augmentedRows
      .filter((r) => {
        const matchSearch =
          search === "" ||
          r.label.toLowerCase().includes(search.toLowerCase()) ||
          r.geo.toLowerCase().includes(search.toLowerCase());
        const matchMacro = macroFilter === "ALL" || r.macro === macroFilter;
        return matchSearch && matchMacro;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === "string") {
          valA = (valA as string).toLowerCase();
          valB = (valB as string).toLowerCase();
        }
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [augmentedRows, search, macroFilter, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <CardWrapper
      title="Tabela Mestra de Performance por Estado (27 UFs + Outros)"
      subtitle="Dados completos de entrantes, habilitados, taxa de conversão, volume per capita por 100k hab. e investimento estimado"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-[#dfe6ee]">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#6c7685] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filtrar estado ou sigla (ex: SP, GO)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#dfe6ee] bg-[#f4f7fb] text-xs font-semibold text-[#0b1f3a] focus:outline-none focus:border-[#00b8cf]"
            />
          </div>

          {/* Macro Region Filter */}
          <select
            value={macroFilter}
            onChange={(e) => setMacroFilter(e.target.value)}
            className="h-9 rounded-xl border border-[#dfe6ee] bg-[#f4f7fb] px-3 text-xs font-semibold text-[#0b1f3a] focus:outline-none focus:border-[#00b8cf]"
          >
            <option value="ALL">Todas as Macro-Regiões</option>
            <option value="Sudeste">Sudeste</option>
            <option value="Sul">Sul</option>
            <option value="Centro-Oeste">Centro-Oeste</option>
            <option value="Nordeste">Nordeste</option>
            <option value="Norte">Norte</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-[#6c7685]">
          Exibindo {filteredAndSorted.length} registros
          <InfoTip text="Extração Copart set/2026. UFs com volume zero no arquivo da Copart são indicadas como 'Zero no recorte'. Per capita utiliza a estimativa populacional do IBGE 2024." />
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#dfe6ee] text-[10px] font-black uppercase tracking-wider text-[#6c7685]">
              <th className="py-3 px-3 cursor-pointer select-none" onClick={() => handleSort("label")}>
                <div className="flex items-center gap-1">
                  Estado / UF <ArrowUpDown className="w-3 h-3 text-[#00b8cf]" />
                </div>
              </th>
              <th className="py-3 px-3">Região</th>
              <th
                className="py-3 px-3 text-right cursor-pointer select-none"
                onClick={() => handleSort("entrantes")}
              >
                <div className="flex items-center justify-end gap-1">
                  Entrantes <ArrowUpDown className="w-3 h-3 text-[#00b8cf]" />
                </div>
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer select-none"
                onClick={() => handleSort("habilitados")}
              >
                <div className="flex items-center justify-end gap-1">
                  Habilitados <ArrowUpDown className="w-3 h-3 text-[#00b8cf]" />
                </div>
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer select-none"
                onClick={() => handleSort("taxa_habilitacao")}
              >
                <div className="flex items-center justify-end gap-1">
                  Tx Habilitação <ArrowUpDown className="w-3 h-3 text-[#00b8cf]" />
                </div>
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer select-none"
                onClick={() => handleSort("perCapitaEntrantes")}
              >
                <div className="flex items-center justify-end gap-1">
                  Per 100k Hab. <ArrowUpDown className="w-3 h-3 text-[#00b8cf]" />
                </div>
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer select-none"
                onClick={() => handleSort("estSpend")}
              >
                <div className="flex items-center justify-end gap-1">
                  Gasto Est. <ArrowUpDown className="w-3 h-3 text-[#00b8cf]" />
                </div>
              </th>
              <th
                className="py-3 px-3 text-right cursor-pointer select-none"
                onClick={() => handleSort("estCph")}
              >
                <div className="flex items-center justify-end gap-1">
                  CPH Est. <ArrowUpDown className="w-3 h-3 text-[#00b8cf]" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Origem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dfe6ee]">
            {filteredAndSorted.map((row) => (
              <tr key={row.geo} className="hover:bg-[#f4f7fb] transition">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-6 rounded-md bg-[#0b1f3a] text-white font-black text-xs flex items-center justify-center">
                      {row.geo}
                    </span>
                    <span className="font-bold text-xs text-[#0b1f3a]">{row.label}</span>
                  </div>
                </td>

                <td className="py-3 px-3 text-xs font-semibold text-[#6c7685]">
                  {row.macro}
                </td>

                <td className="py-3 px-3 text-xs text-right font-black text-[#0b1f3a]">
                  {formatNumberFull(row.entrantes)}
                </td>

                <td className="py-3 px-3 text-xs text-right font-bold text-[#00a85a]">
                  {formatNumberFull(row.habilitados)}
                </td>

                <td className="py-3 px-3 text-xs text-right font-bold text-[#153a73]">
                  {row.taxa_habilitacao > 0 ? formatPercentage(row.taxa_habilitacao, 1) : "—"}
                </td>

                <td className="py-3 px-3 text-xs text-right font-semibold text-[#344255]">
                  {row.perCapitaEntrantes > 0 ? row.perCapitaEntrantes.toFixed(1) : "—"}
                </td>

                <td className="py-3 px-3 text-xs text-right font-bold text-[#0b1f3a]">
                  {row.estSpend > 0 ? formatBRL(row.estSpend) : "—"}
                </td>

                <td className="py-3 px-3 text-xs text-right font-bold text-[#344255]">
                  {row.estCph > 0 ? formatBRL(row.estCph) : "—"}
                </td>

                <td className="py-3 px-3 text-center">
                  {row.source === "copart_excel" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#007342] bg-[#e8f8ef] px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Copart
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-[#8aa4be]">
                      Zero no recorte
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardWrapper>
  );
}
