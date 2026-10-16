"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CHANNEL_LABELS,
  CHANNELS,
  DEFAULT_DATE_RANGE,
  GEO_OPTIONS,
} from "@/lib/constants";
import { coerceUnitForScope, unitScopeForPath } from "@/lib/filters";

type BizMode = "ALL" | "leilao" | "select";

function channelsForUnit(unit: string): readonly string[] {
  if (unit === "leilao_compra") return ["META", "GOOGLE", "ORGANIC", "DIRECT", "TIKTOK"];
  if (unit === "select_venda") return ["META", "BLIP", "RD_STATION"];
  if (unit === "select_compra") return ["META", "GOOGLE", "ORGANIC", "BLIP"];
  return CHANNELS;
}

function dropInvalidChannel(params: URLSearchParams, unit: string) {
  const current = params.get("channel");
  if (current && current !== "ALL" && !channelsForUnit(unit).includes(current)) {
    params.delete("channel");
  }
}

function modeFromUnit(unit: string): BizMode {
  if (unit === "leilao_compra") return "leilao";
  if (unit === "select_venda" || unit === "select_compra") return "select";
  return "ALL";
}

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scope = unitScopeForPath(pathname);

  const start = searchParams.get("start") || DEFAULT_DATE_RANGE.start;
  const end = searchParams.get("end") || DEFAULT_DATE_RANGE.end;
  const rawUnit = searchParams.get("unit") || "ALL";
  const unit = coerceUnitForScope(scope, rawUnit);
  const channel = searchParams.get("channel") || "ALL";
  const geo = searchParams.get("geo") || "ALL";
  const mode = modeFromUnit(unit);

  function push(next: URLSearchParams) {
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL" || value === "") params.delete(key);
    else params.set(key, value);
    if (key === "unit") {
      params.delete("funnel");
      params.delete("campaign");
      dropInvalidChannel(params, coerceUnitForScope(scope, value === "ALL" ? "ALL" : value));
    }
    push(params);
  }

  function setMode(next: BizMode) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("funnel");
    params.delete("campaign");
    if (next === "ALL") params.delete("unit");
    else if (next === "leilao") params.set("unit", "leilao_compra");
    else params.set("unit", unit === "select_compra" ? "select_compra" : "select_venda");
    dropInvalidChannel(params, params.get("unit") || "ALL");
    push(params);
  }

  const channelOptions = channelsForUnit(unit);
  const channelValue = channelOptions.includes(channel) || channel === "ALL" ? channel : "ALL";

  const banner =
    scope === "leilao"
      ? { text: "Tela de Leilão — data e canal abaixo; o negócio já veio da barra lateral", bg: "bg-[#0b1f3a]", fg: "text-white" }
      : scope === "select"
        ? {
            text:
              unit === "select_compra"
                ? "Tela Select / Compra"
                : unit === "select_venda"
                  ? "Tela Select / Venda"
                  : "Tela Select — Venda e Compra visíveis, não se somam",
            bg: "bg-[#007342]",
            fg: "text-white",
          }
        : mode === "leilao"
          ? { text: "Você está vendo Leilão", bg: "bg-[#0b1f3a]", fg: "text-white" }
          : mode === "select"
            ? { text: unit === "select_compra" ? "Você está vendo Copart Select / Compra" : "Você está vendo Copart Select / Venda", bg: "bg-[#007342]", fg: "text-white" }
            : { text: "Comparativo — Leilão e Select juntos, spend não se soma", bg: "bg-[#f4f7fb]", fg: "text-[#0b1f3a]" };

  const seg = (active: boolean, activeClass: string) =>
    `h-9 px-4 rounded-lg text-sm font-black transition-colors ${active ? activeClass : "bg-white text-[#6c7685] border border-[#dfe6ee]"}`;

  return (
    <div className="sticky top-0 z-20 border-b border-[#dfe6ee] bg-white/95 backdrop-blur-md">
      <div className={`${banner.bg} ${banner.fg} px-4 sm:px-8 py-1.5 text-xs font-bold tracking-wide`}>
        {banner.text}
      </div>
      <div className="px-4 sm:px-8 py-3">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-3">
          {scope === "free" && (
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">Negócio</span>
                <div className="flex gap-1">
                  <button type="button" className={seg(mode === "ALL", "bg-[#6c7685] text-white")} onClick={() => setMode("ALL")}>Comparativo</button>
                  <button type="button" className={seg(mode === "leilao", "bg-[#0b1f3a] text-white")} onClick={() => setMode("leilao")}>Leilão</button>
                  <button type="button" className={seg(mode === "select", "bg-[#00a85a] text-white")} onClick={() => setMode("select")}>Select</button>
                </div>
              </div>
              {mode === "select" && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">Funil Select</span>
                  <div className="flex gap-1">
                    <button type="button" className={seg(unit === "select_venda", "bg-[#00a85a] text-white")} onClick={() => setParam("unit", "select_venda")}>Venda</button>
                    <button type="button" className={seg(unit === "select_compra", "bg-[#00b8cf] text-white")} onClick={() => setParam("unit", "select_compra")}>Compra</button>
                  </div>
                </div>
              )}
            </div>
          )}
          {scope === "select" && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">Funil Select</span>
              <div className="flex gap-1">
                <button type="button" className={seg(unit === "ALL", "bg-[#6c7685] text-white")} onClick={() => setParam("unit", "ALL")}>Os dois</button>
                <button type="button" className={seg(unit === "select_venda", "bg-[#00a85a] text-white")} onClick={() => setParam("unit", "select_venda")}>Venda</button>
                <button type="button" className={seg(unit === "select_compra", "bg-[#00b8cf] text-white")} onClick={() => setParam("unit", "select_compra")}>Compra</button>
              </div>
            </div>
          )}
          <div className="flex flex-col lg:flex-row lg:items-end gap-3">
            <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest font-bold text-[#6c7685] min-w-0">
              Início
              <input type="date" value={start} onChange={(e) => setParam("start", e.target.value)} className="h-9 rounded-lg border border-[#dfe6ee] bg-[#f4f7fb] px-2 text-sm font-semibold text-[#0b1f3a]" />
            </label>
            <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest font-bold text-[#6c7685] min-w-0">
              Fim
              <input type="date" value={end} onChange={(e) => setParam("end", e.target.value)} className="h-9 rounded-lg border border-[#dfe6ee] bg-[#f4f7fb] px-2 text-sm font-semibold text-[#0b1f3a]" />
            </label>
            <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest font-bold text-[#6c7685] min-w-[150px]">
              Canal
              <select value={channelValue} onChange={(e) => setParam("channel", e.target.value)} className="h-9 rounded-lg border border-[#dfe6ee] bg-[#f4f7fb] px-2 text-sm font-semibold text-[#0b1f3a]">
                <option value="ALL">Todos</option>
                {channelOptions.map((id) => (
                  <option key={id} value={id}>{CHANNEL_LABELS[id]}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[10px] uppercase tracking-widest font-bold text-[#6c7685] min-w-[140px]">
              Região
              <select value={geo} onChange={(e) => setParam("geo", e.target.value)} className="h-9 rounded-lg border border-[#dfe6ee] bg-[#f4f7fb] px-2 text-sm font-semibold text-[#0b1f3a]">
                {GEO_OPTIONS.map((g) => (
                  <option key={g.id} value={g.id}>{g.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
