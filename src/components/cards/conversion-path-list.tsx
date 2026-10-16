"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Filter, ChevronDown, X } from "lucide-react";
import type { ChannelJourneyShare } from "@/lib/data/types";
import { BarChart } from "@/components/charts/bar-chart";
import { TreemapChart } from "@/components/charts/treemap-chart";
import { formatNumberFull, formatPercentage } from "@/lib/utils/formatters";

interface ConversionPathListProps {
  origins: ChannelJourneyShare[];
}

const CHANNEL_COLORS: Record<string, string> = {
  Direto: "#6c7685",
  "Busca orgânica": "#00a85a",
  "Busca paga": "#4285f4",
  "Cross-network": "#0b1f3a",
  "Social orgânico": "#e1306c",
  "Outros pagos": "#c77a00",
  "Social pago": "#0668E1",
  Display: "#fbbc04",
  "Assistente de IA": "#00b8cf",
  Referral: "#8c5be8",
  "E-mail": "#8c5be8",
  "Não atribuído": "#94a3b8",
  "Vídeo orgânico": "#cf3044",
};

function getChipColor(channel: string): string {
  if (CHANNEL_COLORS[channel]) return CHANNEL_COLORS[channel];
  const match = Object.keys(CHANNEL_COLORS).find((key) =>
    channel.toLowerCase().includes(key.toLowerCase())
  );
  return match ? CHANNEL_COLORS[match] : "#6c7685";
}

function pickChannels(current: string[], name: string, shift: boolean): string[] {
  if (shift) {
    if (current.length === 0) return [name];
    if (current.includes(name)) return current.filter((item) => item !== name);
    return [...current, name];
  }
  if (current.length === 1 && current[0] === name) return [];
  return [name];
}

function toggleChannel(current: string[], name: string): string[] {
  if (current.length === 0) return [name];
  if (current.includes(name)) return current.filter((item) => item !== name);
  return [...current, name];
}

function selectionLabel(selected: string[]) {
  if (selected.length === 0) return "Todos os canais";
  if (selected.length === 1) return selected[0];
  if (selected.length === 2) return selected.join(", ");
  return `${selected.length} canais`;
}

export function ConversionPathList({ origins }: ConversionPathListProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointer(event: MouseEvent) {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    }
    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", onPointer);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [menuOpen]);

  const channelOptions = useMemo(
    () => [...new Set(origins.map((row) => row.channel))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [origins]
  );

  const searched = useMemo(() => {
    if (!searchQuery.trim()) return origins;
    const q = searchQuery.toLowerCase();
    return origins.filter((row) => row.channel.toLowerCase().includes(q));
  }, [origins, searchQuery]);

  const filtered = useMemo(() => {
    if (selected.length === 0) return searched;
    return searched.filter((row) => selected.includes(row.channel));
  }, [searched, selected]);

  const selectedUsers = filtered.reduce((sum, row) => sum + row.journeys, 0);
  const barRows = selected.length === 0 ? searched : filtered;

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-[#dfe6ee] rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685] mb-1">Novos usuários (origem)</p>
          <p className="text-2xl font-black text-[#0b1f3a]">{formatNumberFull(selectedUsers)}</p>
        </div>
        <div className="bg-white border border-[#dfe6ee] rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685] mb-1">Canais de origem</p>
          <p className="text-2xl font-black text-[#0b1f3a]">{filtered.length}</p>
          {selected.length > 0 && (
            <p className="text-xs text-[#6c7685] mt-1">de {origins.length} no first-user GA4</p>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#dfe6ee] rounded-2xl p-5 mb-8">
        <h3 className="text-sm font-black text-[#0b1f3a] mb-3">Canais de origem mais frequentes</h3>
        <ol className="space-y-2">
          {filtered.slice(0, 5).map((row, i) => (
            <li key={row.channel} className="text-sm text-[#344255]">
              <span className="font-black text-[#0b1f3a] mr-2">{i + 1}.</span>
              {row.channel} <span className="text-[#6c7685]">({formatNumberFull(row.journeys)})</span>
            </li>
          ))}
        </ol>
      </div>

      <h2 className="text-base font-black text-[#0b1f3a] mb-4">Participação no primeiro acesso</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {searched.map((row) => (
          <button
            type="button"
            key={row.channel}
            onClick={(event) => setSelected(pickChannels(selected, row.channel, event.shiftKey))}
            className={cn(
              "text-left bg-white border rounded-2xl p-4 transition-all",
              selected.length === 0
                ? "border-[#dfe6ee] hover:border-[#00b8cf]/40"
                : selected.includes(row.channel)
                  ? "border-[#00b8cf] ring-2 ring-[#00b8cf]/20"
                  : "border-[#dfe6ee] opacity-40 hover:opacity-100"
            )}
          >
            <p className="text-sm font-black text-[#0b1f3a]">{row.channel}</p>
            <p className="text-xs text-[#6c7685] mt-1">
              {formatNumberFull(row.journeys)} novos usuários ({formatPercentage(row.share)})
            </p>
          </button>
        ))}
      </div>

      <h2 className="text-base font-black text-[#0b1f3a] mb-4">Canais de primeiro acesso</h2>

      <div className="bg-white border border-[#dfe6ee] rounded-2xl p-4 mb-6">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-bold text-[#0b1f3a] mb-0 w-full"
        >
          <Filter className="w-4 h-4 text-[#00b8cf]" />
          Filtros
          <ChevronDown
            className={cn(
              "w-4 h-4 text-[#6c7685] transition-transform duration-200 ml-auto",
              showFilters && "rotate-180"
            )}
          />
        </button>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.07em] font-bold text-[#6c7685] block mb-1.5">
                Buscar
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6c7685]" />
                <input
                  type="text"
                  placeholder="Canal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-[#dfe6ee] rounded-xl bg-[#f8fbff] focus:outline-none focus:ring-2 focus:ring-[#00b8cf]/30 focus:border-[#00b8cf] transition-all"
                />
              </div>
            </div>
            <div ref={menuRef} className="relative">
              <label className="text-[10px] uppercase tracking-[0.07em] font-bold text-[#6c7685] block mb-1.5">
                Canal de origem
              </label>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setMenuOpen((open) => !open);
                }}
                className="w-full px-3 py-2 text-sm border border-[#dfe6ee] rounded-xl bg-[#f8fbff] text-left font-semibold text-[#0b1f3a] flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-[#00b8cf]/30 focus:border-[#00b8cf]"
                aria-haspopup="listbox"
                aria-expanded={menuOpen}
                aria-multiselectable="true"
              >
                <span className="truncate">{selectionLabel(selected)}</span>
                <ChevronDown className={cn("w-4 h-4 text-[#6c7685] shrink-0 transition-transform", menuOpen && "rotate-180")} />
              </button>
              {menuOpen && (
                <div
                  role="listbox"
                  aria-multiselectable="true"
                  className="absolute z-30 mt-1 w-full max-h-64 overflow-auto rounded-xl border border-[#dfe6ee] bg-white p-2 shadow-lg"
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-semibold text-[#0b1f3a] hover:bg-[#f4f7fb] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.length === 0}
                      onChange={() => setSelected([])}
                      className="accent-[#00b8cf]"
                    />
                    Todos os canais
                  </label>
                  {channelOptions.map((channel) => (
                    <label
                      key={channel}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-semibold text-[#344255] hover:bg-[#f4f7fb] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(channel)}
                        onChange={() => setSelected(toggleChannel(selected, channel))}
                        className="accent-[#00b8cf]"
                      />
                      {channel}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {selected.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {selected.map((channel) => (
              <button
                key={channel}
                type="button"
                onClick={() => setSelected(toggleChannel(selected, channel))}
                className="inline-flex items-center gap-1 rounded-full bg-[#e5f8f8] text-[#007a7a] text-[11px] font-bold px-2.5 py-1"
              >
                {channel}
                <X className="w-3 h-3" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelected([])}
              className="text-[11px] font-bold text-[#6c7685] hover:text-[#0b1f3a]"
            >
              Limpar
            </button>
          </div>
        )}
      </div>

      {searched.length === 0 ? (
        <div className="bg-white border border-[#dfe6ee] rounded-2xl p-12 text-center">
          <p className="text-[#6c7685] font-semibold">Nenhuma origem encontrada com os filtros selecionados.</p>
          <p className="text-[#6c7685] text-sm mt-1">Tente ajustar os filtros acima.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-3 bg-white border border-[#dfe6ee] rounded-2xl p-5">
            <h3 className="text-sm font-black text-[#0b1f3a]">Treemap do primeiro acesso</h3>
            <p className="text-xs text-[#6c7685] mt-0.5 mb-4">
              Clique para filtrar as barras · Shift+clique para somar canais
            </p>
            <TreemapChart
              items={searched.map((row) => ({
                name: row.channel,
                value: row.journeys,
                color: getChipColor(row.channel),
                share: row.share,
              }))}
              selected={selected}
              onPick={(name, shift) => setSelected(pickChannels(selected, name, shift))}
              height={360}
            />
          </div>
          <div className="xl:col-span-2 bg-white border border-[#dfe6ee] rounded-2xl p-5">
            <h3 className="text-sm font-black text-[#0b1f3a]">Volume por canal</h3>
            <p className="text-xs text-[#6c7685] mt-0.5 mb-4">Novos usuários (first-user GA4)</p>
            <BarChart
              labels={barRows.map((row) => row.channel)}
              datasets={[{
                label: "Novos usuários",
                data: barRows.map((row) => row.journeys),
                color: barRows.map((row) => getChipColor(row.channel)),
              }]}
              valueFormatter="compact"
              horizontal
              height={Math.max(280, barRows.length * 28)}
              onPointClick={(label, shift) => setSelected(pickChannels(selected, label, shift))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
