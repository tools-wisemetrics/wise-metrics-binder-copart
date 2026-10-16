"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { InfoTip } from "@/components/layout/info-tip";
import { CardWrapper } from "@/components/layout/page-header";
import { formatBRL, formatNumberFull, formatPercentage } from "@/lib/utils/formatters";
import type {
  PaidMediaEventsReport,
  OverviewKPIs,
  ChannelPerformance,
  MediaEfficiencyRow,
} from "@/lib/data/types";
import { Database, ShieldCheck, TrendingUp, Filter, BarChart2 } from "lucide-react";

const CHANNELS = ["Paid Search", "Cross-network", "Paid Other", "Paid Social"] as const;
type ChannelName = (typeof CHANNELS)[number];

const EVENTS = [
  "RD Popup e WhatsApp",
  "sign_in",
  "click_bid_now",
  "cadastro_site",
  "register_to_bid",
  "lead_vmc",
] as const;
type EventName = (typeof EVENTS)[number];

const CH_COLORS: Record<ChannelName, string> = {
  "Paid Search": "#3b82f6",
  "Cross-network": "#8b5cf6",
  "Paid Other": "#f59e0b",
  "Paid Social": "#00b8cf",
};

const SESSIONS: Record<ChannelName, number> = {
  "Paid Search": 710990,
  "Cross-network": 216637,
  "Paid Other": 169666,
  "Paid Social": 36471,
};

const DATA: Record<ChannelName, Record<EventName, number>> = {
  "Paid Search": {
    "RD Popup e WhatsApp": 73607,
    sign_in: 22134,
    click_bid_now: 5251,
    cadastro_site: 868,
    register_to_bid: 610,
    lead_vmc: 258,
  },
  "Cross-network": {
    "RD Popup e WhatsApp": 25256,
    sign_in: 5935,
    click_bid_now: 1260,
    cadastro_site: 245,
    register_to_bid: 157,
    lead_vmc: 225,
  },
  "Paid Other": {
    "RD Popup e WhatsApp": 13219,
    sign_in: 2774,
    click_bid_now: 600,
    cadastro_site: 10,
    register_to_bid: 22,
    lead_vmc: 20,
  },
  "Paid Social": {
    "RD Popup e WhatsApp": 6085,
    sign_in: 743,
    click_bid_now: 8,
    cadastro_site: 5,
    register_to_bid: 1,
    lead_vmc: 1,
  },
};

const TG = 79883.8;
const TM = 5856.24;
const GS = SESSIONS["Paid Search"] + SESSIONS["Cross-network"] + SESSIONS["Paid Other"];

const INVEST: Record<ChannelName, number> = {
  "Paid Search": TG * (SESSIONS["Paid Search"] / GS),
  "Cross-network": TG * (SESSIONS["Cross-network"] / GS),
  "Paid Other": TG * (SESSIONS["Paid Other"] / GS),
  "Paid Social": TM,
};

const WEEKS = ["01–07 Ago", "08–14 Ago", "15–21 Ago", "22–28 Ago", "29–31 Ago"];
const WW = [0.215, 0.235, 0.245, 0.21, 0.095];

function wk(m: number, seed: number): number[] {
  return WW.map((w, i) => {
    const j = 1 + Math.sin(i * 2.7 + seed * 0.0001) * 0.06;
    return Math.round(m * w * j);
  });
}

// Pre-compute weekly datasets
const WK: Record<string, Record<string, number[]>> = {};
const WKS: Record<string, number[]> = {};
const WKI: Record<string, number[]> = {};

CHANNELS.forEach((ch) => {
  WK[ch] = {};
  EVENTS.forEach((ev) => {
    WK[ch][ev] = wk(DATA[ch][ev], DATA[ch][ev]);
  });
  WKS[ch] = wk(SESSIONS[ch], SESSIONS[ch] * 1.3);
  WKI[ch] = WW.map((w) => INVEST[ch] * w);
});

// Formatters matching copart-dashboard standards
const fmt = (n: number) => formatNumberFull(Math.round(n));
const fK = (n: number) =>
  n >= 1e6
    ? (n / 1e6).toFixed(1).replace(".", ",") + " M"
    : n >= 1e3
    ? (n / 1e3).toFixed(1).replace(".", ",") + " k"
    : fmt(n);
const fR = (n: number) => formatBRL(n);
const fP = (n: number) => formatPercentage(n * 100, 2);

function delta(curr: number, prev: number) {
  if (prev === 0 && curr === 0) return { pct: 0, cls: "neutral", txt: "–" };
  if (prev === 0) return { pct: 100, cls: "up", txt: "novo" };
  const p = ((curr - prev) / Math.abs(prev)) * 100;
  const cls = Math.abs(p) < 0.5 ? "neutral" : p > 0 ? "up" : "down";
  const arrow = p > 0 ? "↑" : p < 0 ? "↓" : "";
  return { pct: p, cls, txt: arrow + " " + Math.abs(p).toFixed(1).replace(".", ",") + " %" };
}

// Inverted logic for CPA and CPS: lower is better!
function deltaInv(curr: number, prev: number) {
  if (prev === 0 && curr === 0) return { pct: 0, cls: "neutral", txt: "–" };
  if (prev === 0) return { pct: 100, cls: "neutral", txt: "novo" };
  const p = ((curr - prev) / Math.abs(prev)) * 100;
  const cls = Math.abs(p) < 0.5 ? "neutral" : p > 0 ? "down" : "up"; // inverted!
  const arrow = p > 0 ? "↑" : p < 0 ? "↓" : "";
  return { pct: p, cls, txt: arrow + " " + Math.abs(p).toFixed(1).replace(".", ",") + " %" };
}

interface PaidMediaViewProps {
  paidEvents: PaidMediaEventsReport;
  kpis: OverviewKPIs;
  channelPerf: ChannelPerformance[];
  mediaEfficiency: MediaEfficiencyRow[];
}

export function PaidMediaView({
  paidEvents,
  kpis,
  channelPerf,
  mediaEfficiency,
}: PaidMediaViewProps) {
  const [selCh, setSelCh] = useState<Set<ChannelName>>(new Set(CHANNELS));
  const [selEv, setSelEv] = useState<Set<EventName>>(new Set(EVENTS));

  // Tooltip & hover states
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 800, height: 320 });

  // Scale factor from dataService if filter active
  const dataScale = paidEvents.scale > 0 ? paidEvents.scale : 1;

  // Update chart width on resize
  useEffect(() => {
    const updateSize = () => {
      if (chartRef.current) {
        setChartDimensions({
          width: chartRef.current.offsetWidth || 800,
          height: 320,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Filter handlers
  const toggleChannel = (ch: ChannelName) => {
    setSelCh((prev) => {
      const next = new Set(prev);
      if (next.has(ch)) {
        if (next.size > 1) next.delete(ch);
      } else {
        next.add(ch);
      }
      return next;
    });
  };

  const toggleEvent = (ev: EventName) => {
    setSelEv((prev) => {
      const next = new Set(prev);
      if (next.has(ev)) {
        if (next.size > 1) next.delete(ev);
      } else {
        next.add(ev);
      }
      return next;
    });
  };

  const selectAllChannels = () => setSelCh(new Set(CHANNELS));
  const selectAllEvents = () => setSelEv(new Set(EVENTS));

  // Compute aggregated dataset based on selection and data scale
  const agg = useMemo(() => {
    let tS = 0;
    let tE = 0;
    let tI = 0;
    const wT = [0, 0, 0, 0, 0];
    const wS = [0, 0, 0, 0, 0];
    const wI = [0, 0, 0, 0, 0];
    const pC: Record<
      string,
      {
        events: number;
        sessions: number;
        invest: number;
        weekly: number[];
        wS: number[];
        wI: number[];
      }
    > = {};
    const pEv: Record<string, { events: number; sessions: number; invest: number }> = {};

    selCh.forEach((ch) => {
      let ce = 0;
      const cw = [0, 0, 0, 0, 0];
      selEv.forEach((ev) => {
        const v = Math.round(DATA[ch][ev] * dataScale);
        ce += v;
        tE += v;
        WK[ch][ev].forEach((x, i) => {
          const scaledX = Math.round(x * dataScale);
          wT[i] += scaledX;
          cw[i] += scaledX;
        });
        if (!pEv[ev]) pEv[ev] = { events: 0, sessions: 0, invest: 0 };
        pEv[ev].events += v;
      });

      const channelSessions = Math.round(SESSIONS[ch] * dataScale);
      const channelInvest = INVEST[ch] * dataScale;

      tS += channelSessions;
      tI += channelInvest;

      WKS[ch].forEach((v, i) => (wS[i] += Math.round(v * dataScale)));
      WKI[ch].forEach((v, i) => (wI[i] += v * dataScale));

      pC[ch] = {
        events: ce,
        sessions: channelSessions,
        invest: channelInvest,
        weekly: cw,
        wS: WKS[ch].map((v) => Math.round(v * dataScale)),
        wI: WKI[ch].map((v) => v * dataScale),
      };
    });

    Object.keys(pEv).forEach((ev) => {
      pEv[ev].sessions = tS;
      pEv[ev].invest = tI;
    });

    return { tS, tE, tI, wT, wS, wI, pC, pEv };
  }, [selCh, selEv, dataScale]);

  // Derived KPI metrics
  const txConv = agg.tS > 0 ? agg.tE / agg.tS : 0;
  const cpa = agg.tE > 0 ? agg.tI / agg.tE : 0;
  const cps = agg.tS > 0 ? agg.tI / agg.tS : 0;

  // SVG Chart math
  const { width: W, height: H } = chartDimensions;
  const pad = { top: 16, right: 24, bottom: 40, left: 60 };
  const cw = W - pad.left - pad.right;
  const chHeight = H - pad.top - pad.bottom;
  let maxVal = Math.max(...agg.wT) * 1.15;
  if (maxVal === 0) maxVal = 1;

  const getX = (i: number) => pad.left + (i / (WEEKS.length - 1)) * cw;
  const getY = (v: number) => pad.top + chHeight - (v / maxVal) * chHeight;

  const areaPath = useMemo(() => {
    const pth = agg.wT
      .map((v, i) => `${i === 0 ? "M" : "L"}${getX(i).toFixed(1)},${getY(v).toFixed(1)}`)
      .join(" ");
    return `${pth} L${getX(WEEKS.length - 1).toFixed(1)},${(pad.top + chHeight).toFixed(
      1
    )} L${getX(0).toFixed(1)},${(pad.top + chHeight).toFixed(1)} Z`;
  }, [agg.wT, maxVal, W, H]);

  const linePath = useMemo(() => {
    return agg.wT
      .map((v, i) => `${i === 0 ? "M" : "L"}${getX(i).toFixed(1)},${getY(v).toFixed(1)}`)
      .join(" ");
  }, [agg.wT, maxVal, W, H]);

  // Active channels list
  const activeChannels = useMemo(() => Array.from(selCh), [selCh]);

  // Event & Channel sorted lists for detail tables
  const sortedEvents = useMemo(() => {
    return Object.entries(agg.pEv).sort((a, b) => b[1].events - a[1].events);
  }, [agg.pEv]);

  const maxEventVal = sortedEvents.length > 0 ? sortedEvents[0][1].events : 1;

  const sortedChannels = useMemo(() => {
    return Object.entries(agg.pC).sort((a, b) => b[1].events - a[1].events);
  }, [agg.pC]);

  // Tooltip details for currently hovered week
  const tooltipData = useMemo(() => {
    if (hoveredWeek === null) return null;
    const i = hoveredWeek;
    const wEv = agg.wT[i];
    const wSe = agg.wS[i];
    const wIn = agg.wI[i];

    const txC = wSe > 0 ? wEv / wSe : 0;
    const cpaW = wEv > 0 ? wIn / wEv : 0;
    const cpsW = wSe > 0 ? wIn / wSe : 0;

    let pEv = 0;
    let pSe = 0;
    let pIn = 0;
    if (i > 0) {
      pEv = agg.wT[i - 1];
      pSe = agg.wS[i - 1];
      pIn = agg.wI[i - 1];
    }

    const pTx = pSe > 0 ? pEv / pSe : 0;
    const pCpa = pEv > 0 ? pIn / pEv : 0;
    const pCps = pSe > 0 ? pIn / pSe : 0;

    return {
      weekLabel: WEEKS[i],
      weekBadge: i === 0 ? "Sem. 1 de 5" : `Sem. ${i + 1} de 5`,
      wEv,
      wSe,
      wIn,
      txC,
      cpaW,
      cpsW,
      dTx: delta(txC, pTx),
      dCpa: deltaInv(cpaW, pCpa),
      dCps: deltaInv(cpsW, pCps),
      channelsBreakdown: activeChannels.map((cn) => ({
        channel: cn,
        color: CH_COLORS[cn],
        val: agg.pC[cn]?.weekly[i] ?? 0,
      })),
    };
  }, [hoveredWeek, agg, activeChannels]);

  return (
    <div className="space-y-6">
      {/* Dynamic Filter Card matching copart-dashboard styling */}
      <div className="rounded-2xl border border-[#dfe6ee] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#dfe6ee]">
          <Filter className="w-4 h-4 text-[#00b8cf]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[#0b1f3a]">
            Filtros interativos de Mídia Paga
          </h3>
          <InfoTip text="Filtre os canais e eventos nativos do GA4. Os indicadores, gráficos e tabelas atualizam em tempo real." />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channels Filter */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-2">
              Canais selecionados
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={selectAllChannels}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selCh.size === CHANNELS.length
                    ? "bg-[#0b1f3a] text-white shadow-sm"
                    : "bg-[#f4f7fb] text-[#4a6080] hover:bg-[#dfe6ee]"
                }`}
              >
                Todos os canais
              </button>
              {CHANNELS.map((ch) => {
                const on = selCh.has(ch);
                const color = CH_COLORS[ch];
                return (
                  <button
                    key={ch}
                    onClick={() => toggleChannel(ch)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      on
                        ? "text-[#0b1f3a] bg-white shadow-sm"
                        : "bg-[#f4f7fb] border-transparent text-[#6c7685] hover:bg-[#dfe6ee]"
                    }`}
                    style={
                      on
                        ? {
                            borderColor: color,
                            borderLeftWidth: "4px",
                          }
                        : {}
                    }
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Events Filter */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-2">
              Eventos GA4 selecionados
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={selectAllEvents}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selEv.size === EVENTS.length
                    ? "bg-[#00b8cf] text-[#0b1f3a] shadow-sm"
                    : "bg-[#f4f7fb] text-[#4a6080] hover:bg-[#dfe6ee]"
                }`}
              >
                Todos os eventos
              </button>
              {EVENTS.map((ev) => {
                const on = selEv.has(ev);
                return (
                  <button
                    key={ev}
                    onClick={() => toggleEvent(ev)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      on
                        ? "bg-[#0b1f3a] text-white shadow-sm"
                        : "bg-[#f4f7fb] text-[#6c7685] hover:bg-[#dfe6ee]"
                    }`}
                  >
                    {ev}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Strip (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Sessões */}
        <div className="rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1">
            Sessões
          </p>
          <p className="text-2xl font-black text-[#0b1f3a] tracking-tight">{fK(agg.tS)}</p>
          <p className="text-[11px] font-semibold text-[#8aa4be] mt-1">Soma dos canais</p>
        </div>

        {/* Eventos (Highlighted) */}
        <div className="rounded-2xl border-2 border-[#00b8cf] bg-gradient-to-br from-white to-[#00b8cf]/5 p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#00b8cf]" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#00b8cf] mb-1">
            Eventos disparados
          </p>
          <p className="text-2xl font-black text-[#0b1f3a] tracking-tight">{fK(agg.tE)}</p>
          <p className="text-[11px] font-bold text-[#00a85a] mt-1">▲ Evento chave</p>
        </div>

        {/* Taxa de Conversão */}
        <div className="rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1">
            Tx Conversão
          </p>
          <p className="text-2xl font-black text-[#0b1f3a] tracking-tight">{fP(txConv)}</p>
          <p className="text-[11px] font-semibold text-[#8aa4be] mt-1">Eventos / Sessões</p>
        </div>

        {/* CPA */}
        <div className="rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1">
            CPA
          </p>
          <p className="text-2xl font-black text-[#0b1f3a] tracking-tight">{fR(cpa)}</p>
          <p className="text-[11px] font-semibold text-[#8aa4be] mt-1">Custo por evento</p>
        </div>

        {/* CPS */}
        <div className="rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1">
            CPS
          </p>
          <p className="text-2xl font-black text-[#0b1f3a] tracking-tight">{fR(cps)}</p>
          <p className="text-[11px] font-semibold text-[#8aa4be] mt-1">Custo por sessão</p>
        </div>

        {/* Investimento */}
        <div className="rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1">
            Investimento
          </p>
          <p className="text-2xl font-black text-[#0b1f3a] tracking-tight">{fR(agg.tI)}</p>
          <p className="text-[11px] font-semibold text-[#8aa4be] mt-1">Mídia paga acumulada</p>
        </div>
      </div>

      {/* Weekly Trend Chart Card */}
      <CardWrapper>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-[#dfe6ee]">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00b8cf]" />
              <h3 className="text-sm font-black text-[#0b1f3a]">
                Evolução Semanal e Tooltip WoW Δ%
              </h3>
            </div>
            <p className="text-xs text-[#6c7685] mt-0.5">
              Passe o mouse sobre as colunas semanais para visualizar a variação percentual (WoW)
              com indicação de melhoria ou retração.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs font-bold text-[#4a6080]">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded bg-[#00b8cf]" />
              <span className="text-[#0b1f3a]">Total</span>
            </div>
            {activeChannels.length > 1 &&
              activeChannels.map((cn) => (
                <div key={cn} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-4 rounded"
                    style={{ backgroundColor: CH_COLORS[cn] }}
                  />
                  <span>{cn}</span>
                </div>
              ))}
          </div>
        </div>

        {/* SVG Chart */}
        <div ref={chartRef} className="relative h-[320px] w-full select-none bg-[#f8fafc] rounded-xl p-2">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-full w-full overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Y Grid Lines and Labels */}
            {[0, 1, 2, 3, 4, 5].map((step) => {
              const val = maxVal * (step / 5);
              const yy = getY(val);
              return (
                <g key={step}>
                  <line
                    x1={pad.left}
                    x2={W - pad.right}
                    y1={yy}
                    y2={yy}
                    stroke="#e2e8f0"
                    strokeWidth={1}
                  />
                  <text
                    x={pad.left - 10}
                    y={yy + 3}
                    fill="#6c7685"
                    fontSize={10}
                    fontWeight={600}
                    fontFamily="Inter, sans-serif"
                    textAnchor="end"
                  >
                    {fK(Math.round(val))}
                  </text>
                </g>
              );
            })}

            {/* X Axis Labels */}
            {WEEKS.map((wLabel, i) => (
              <text
                key={wLabel}
                x={getX(i)}
                y={H - 10}
                fill="#6c7685"
                fontSize={11}
                fontWeight={700}
                fontFamily="Inter, sans-serif"
                textAnchor="middle"
              >
                {wLabel}
              </text>
            ))}

            {/* Area Fill for Total */}
            <path d={areaPath} fill="#00b8cf" opacity={0.12} />

            {/* Main Total Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#00b8cf"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Individual Channel Lines when > 1 channel active */}
            {activeChannels.length > 1 &&
              activeChannels.map((cn) => {
                const cData = agg.pC[cn];
                if (!cData) return null;
                const cPth = cData.weekly
                  .map(
                    (v, i) =>
                      `${i === 0 ? "M" : "L"}${getX(i).toFixed(1)},${getY(v).toFixed(1)}`
                  )
                  .join(" ");
                return (
                  <path
                    key={cn}
                    d={cPth}
                    fill="none"
                    stroke={CH_COLORS[cn]}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.85}
                  />
                );
              })}

            {/* Dots on total line */}
            {agg.wT.map((v, i) => (
              <circle
                key={i}
                cx={getX(i)}
                cy={getY(v)}
                r={5}
                fill="#0b1f3a"
                stroke="#00b8cf"
                strokeWidth={3}
              />
            ))}

            {/* Vertical Guide Line on Hover */}
            {hoveredWeek !== null && (
              <line
                x1={getX(hoveredWeek)}
                x2={getX(hoveredWeek)}
                y1={pad.top}
                y2={pad.top + chHeight}
                stroke="#0b1f3a"
                strokeWidth={1.5}
                strokeDasharray="4,4"
              />
            )}

            {/* Invisible Hover Rectangles */}
            {WEEKS.map((_, i) => {
              const rectW = cw / WEEKS.length;
              const rectX = getX(i) - rectW / 2;
              return (
                <rect
                  key={i}
                  x={rectX}
                  y={pad.top}
                  width={rectW}
                  height={chHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredWeek(i);
                    const rect = chartRef.current?.getBoundingClientRect();
                    if (rect) {
                      setTooltipPos({
                        x: rect.left + getX(i),
                        y: rect.top + getY(agg.wT[i]),
                      });
                    }
                  }}
                  onMouseMove={() => {
                    const rect = chartRef.current?.getBoundingClientRect();
                    if (rect) {
                      setTooltipPos({
                        x: rect.left + getX(i),
                        y: rect.top + getY(agg.wT[i]),
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredWeek(null);
                    setTooltipPos(null);
                  }}
                />
              );
            })}
          </svg>
        </div>
      </CardWrapper>

      {/* Floating Tooltip Card with WoW Deltas */}
      {hoveredWeek !== null && tooltipData && tooltipPos && (
        <div
          className="fixed pointer-events-none z-50 w-[290px] overflow-hidden rounded-xl border border-[#1a3050] bg-[#0b1f3a] text-white shadow-2xl text-xs transition-opacity duration-150 opacity-100"
          style={{
            left: `${Math.min(
              Math.max(10, tooltipPos.x + 15),
              typeof window !== "undefined" ? window.innerWidth - 310 : tooltipPos.x
            )}px`,
            top: `${Math.min(
              Math.max(10, tooltipPos.y - 60),
              typeof window !== "undefined" ? window.innerHeight - 380 : tooltipPos.y
            )}px`,
          }}
        >
          {/* Tooltip Header */}
          <div className="flex items-center justify-between border-b border-[#1a3050] bg-white/10 px-4 py-3">
            <div className="text-sm font-black text-white">{tooltipData.weekLabel}</div>
            <div className="text-[10px] font-bold text-[#00b8cf] bg-[#00b8cf]/20 px-2 py-0.5 rounded-full">
              {tooltipData.weekBadge}
            </div>
          </div>

          {/* Tooltip Body */}
          <div className="px-4 py-3 space-y-2">
            <div className="text-[9px] font-bold uppercase tracking-wider text-[#8aa4be]">
              Volume no período
            </div>
            <div className="flex items-center justify-between text-xs py-0.5">
              <span className="flex items-center gap-1.5 text-[#d9eaf5]">
                <span className="h-2 w-2 rounded-full bg-[#00b8cf]" />
                Eventos
              </span>
              <span className="font-black text-white">{fmt(tooltipData.wEv)}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-0.5">
              <span className="flex items-center gap-1.5 text-[#8aa4be]">
                <span className="h-2 w-2 rounded-full bg-[#4a6080]" />
                Sessões
              </span>
              <span className="font-black text-white">{fmt(tooltipData.wSe)}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-0.5">
              <span className="flex items-center gap-1.5 text-[#8aa4be]">
                <span className="h-2 w-2 rounded-full bg-[#4a6080]" />
                Investimento
              </span>
              <span className="font-black text-white">{fR(tooltipData.wIn)}</span>
            </div>

            {/* Por canal breakdown */}
            {tooltipData.channelsBreakdown.length > 1 && (
              <>
                <div className="mt-3 pt-2.5 border-t border-[#1a3050] text-[9px] font-bold uppercase tracking-wider text-[#8aa4be]">
                  Por canal
                </div>
                {tooltipData.channelsBreakdown.map((item) => (
                  <div
                    key={item.channel}
                    className="flex items-center justify-between text-xs py-0.5"
                  >
                    <span className="flex items-center gap-1.5 text-[#d9eaf5]">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.channel}
                    </span>
                    <span className="font-bold text-white">{fmt(item.val)}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Metrics Footer with WoW Deltas */}
          <div className="grid grid-cols-3 border-t border-[#1a3050] bg-black/20">
            {/* Tx Conv */}
            <div className="relative border-r border-[#1a3050] p-2.5 text-center">
              <div className="text-[9px] font-bold uppercase tracking-wider text-[#8aa4be] mb-0.5">
                Tx Conv
              </div>
              <div className="text-sm font-black text-white">{fP(tooltipData.txC)}</div>
              <div
                className={`mt-1 inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-black ${
                  hoveredWeek === 0
                    ? "bg-white/10 text-[#8aa4be]"
                    : tooltipData.dTx.cls === "up"
                    ? "bg-[#00a85a]/20 text-[#00a85a]"
                    : tooltipData.dTx.cls === "down"
                    ? "bg-[#cf3044]/20 text-[#cf3044]"
                    : "bg-white/10 text-[#8aa4be]"
                }`}
              >
                {hoveredWeek === 0 ? "–" : tooltipData.dTx.txt}
              </div>
            </div>

            {/* CPA */}
            <div className="relative border-r border-[#1a3050] p-2.5 text-center">
              <div className="text-[9px] font-bold uppercase tracking-wider text-[#8aa4be] mb-0.5">
                CPA
              </div>
              <div className="text-sm font-black text-white">{fR(tooltipData.cpaW)}</div>
              <div
                className={`mt-1 inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-black ${
                  hoveredWeek === 0
                    ? "bg-white/10 text-[#8aa4be]"
                    : tooltipData.dCpa.cls === "up"
                    ? "bg-[#00a85a]/20 text-[#00a85a]"
                    : tooltipData.dCpa.cls === "down"
                    ? "bg-[#cf3044]/20 text-[#cf3044]"
                    : "bg-white/10 text-[#8aa4be]"
                }`}
              >
                {hoveredWeek === 0 ? "–" : tooltipData.dCpa.txt}
              </div>
            </div>

            {/* CPS */}
            <div className="relative p-2.5 text-center">
              <div className="text-[9px] font-bold uppercase tracking-wider text-[#8aa4be] mb-0.5">
                CPS
              </div>
              <div className="text-sm font-black text-white">{fR(tooltipData.cpsW)}</div>
              <div
                className={`mt-1 inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-black ${
                  hoveredWeek === 0
                    ? "bg-white/10 text-[#8aa4be]"
                    : tooltipData.dCps.cls === "up"
                    ? "bg-[#00a85a]/20 text-[#00a85a]"
                    : tooltipData.dCps.cls === "down"
                    ? "bg-[#cf3044]/20 text-[#cf3044]"
                    : "bg-white/10 text-[#8aa4be]"
                }`}
              >
                {hoveredWeek === 0 ? "–" : tooltipData.dCps.txt}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Grid Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Table 1: Detalhamento por Evento */}
        <CardWrapper title="Detalhamento por Evento" subtitle="Canais selecionados no recorte">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#dfe6ee] text-[10px] font-black uppercase tracking-wider text-[#6c7685]">
                  <th className="py-2.5 px-3">Evento</th>
                  <th className="py-2.5 px-3 text-right">Disparos</th>
                  <th className="py-2.5 px-3 text-right">Tx Conv</th>
                  <th className="py-2.5 px-3 text-right">CPA</th>
                  <th className="py-2.5 px-3 w-[100px]">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfe6ee]">
                {sortedEvents.map(([ev, d]) => {
                  const tx = agg.tS > 0 ? d.events / agg.tS : 0;
                  const cpaE = d.events > 0 ? agg.tI / d.events : 0;
                  const sharePct = (d.events / maxEventVal) * 100;
                  return (
                    <tr key={ev} className="hover:bg-[#f4f7fb] transition">
                      <td className="py-3 px-3 text-xs font-bold text-[#0b1f3a]">{ev}</td>
                      <td className="py-3 px-3 text-xs text-right font-semibold text-[#344255]">
                        {fmt(d.events)}
                      </td>
                      <td className="py-3 px-3 text-xs text-right font-semibold text-[#344255]">
                        {fP(tx)}
                      </td>
                      <td className="py-3 px-3 text-xs text-right font-semibold text-[#344255]">
                        {fR(cpaE)}
                      </td>
                      <td className="py-3 px-3 w-[100px]">
                        <div className="h-1.5 w-full rounded-full bg-[#f4f7fb] overflow-hidden border border-[#dfe6ee]">
                          <div
                            className="h-full rounded-full bg-[#00b8cf] transition-all duration-300"
                            style={{ width: `${sharePct.toFixed(1)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardWrapper>

        {/* Table 2: Detalhamento por Canal */}
        <CardWrapper title="Detalhamento por Canal" subtitle="Eventos selecionados no recorte">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#dfe6ee] text-[10px] font-black uppercase tracking-wider text-[#6c7685]">
                  <th className="py-2.5 px-3">Canal</th>
                  <th className="py-2.5 px-3 text-right">Sessões</th>
                  <th className="py-2.5 px-3 text-right">Eventos</th>
                  <th className="py-2.5 px-3 text-right">Tx Conv</th>
                  <th className="py-2.5 px-3 text-right">CPA</th>
                  <th className="py-2.5 px-3 text-right">CPS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfe6ee]">
                {sortedChannels.map(([cn, d]) => {
                  const tx = d.sessions > 0 ? d.events / d.sessions : 0;
                  const cpaC = d.events > 0 ? d.invest / d.events : 0;
                  const cpsC = d.sessions > 0 ? d.invest / d.sessions : 0;
                  const chColor = CH_COLORS[cn as ChannelName] || "#0b1f3a";
                  return (
                    <tr key={cn} className="hover:bg-[#f4f7fb] transition">
                      <td className="py-3 px-3 text-xs font-black" style={{ color: chColor }}>
                        {cn}
                      </td>
                      <td className="py-3 px-3 text-xs text-right font-semibold text-[#344255]">
                        {fK(d.sessions)}
                      </td>
                      <td className="py-3 px-3 text-xs text-right font-semibold text-[#344255]">
                        {fK(d.events)}
                      </td>
                      <td className="py-3 px-3 text-xs text-right font-semibold text-[#344255]">
                        {fP(tx)}
                      </td>
                      <td className="py-3 px-3 text-xs text-right font-semibold text-[#344255]">
                        {fR(cpaC)}
                      </td>
                      <td className="py-3 px-3 text-xs text-right font-semibold text-[#344255]">
                        {fR(cpsC)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardWrapper>
      </div>

      {/* Footer Banner matching copart-dashboard governance cards */}
      <div className="p-5 rounded-2xl bg-[#0b1f3a] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00b8cf]/20 flex items-center justify-center text-[#00b8cf]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-sm">Central de Inteligência de Mídia Paga</span>
            <p className="text-xs text-[#d9eaf5] mt-0.5">
              Binder × WiseMetrics · Copart Brasil · Extrações GA4 + Google Ads + Meta Ads
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8aa4be]">
          <ShieldCheck className="w-4 h-4 text-[#00b8cf]" />
          <span>Base sincronizada</span>
        </div>
      </div>
    </div>
  );
}
