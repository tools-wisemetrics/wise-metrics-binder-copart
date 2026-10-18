'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { InfoTip } from '@/components/layout/info-tip';
import { CardWrapper } from '@/components/layout/page-header';
import { formatBRL, formatNumberFull, formatPercentage } from '@/lib/utils/formatters';
import type {
  PaidMediaEventsReport,
  OverviewKPIs,
  ChannelPerformance,
  MediaEfficiencyRow,
} from '@/lib/data/types';
import { Database, ShieldCheck, TrendingUp, Filter, BarChart2 } from 'lucide-react';
import { NewVisaoGeralMidia } from '@/lib/data/raw-data';

// PRecisa alterar, para Meta Ads e Google ADs
const CHANNEL_NAMES = ['Meta Ads', 'Google Ads'] as const;
type ChannelName = (typeof CHANNEL_NAMES)[number];

// Alterar aqui tbm os eventos do filtro
const EVENT_NAMES = ['cadastro_site', 'lead_vmc', 'login_site'] as const;
type EventName = (typeof EVENT_NAMES)[number];

// Aqui tbm mudar para Impressoes e conversoes apenas que serão linha com área. MAs também quero uma linha diferente
// que tenha o INvestimento como no dash do cloud
const CHANNEL_COLORS: Record<ChannelName, string> = {
  'Meta Ads': '#3b82f6',
  'Google Ads': '#8b5cf6',
};

// Esse sessions na verdade sera impressions
const SESSIONS_BY_CHANNEL: Record<ChannelName, number> = {
  'Meta Ads': 8000,
  'Google Ads': 4000,
};
// Deixar totalmente com variaveis dinamicas
const EVENTS_BY_CHANNEL: Record<ChannelName, Record<EventName, number>> = {
  'Meta Ads': {
    cadastro_site: 868,
    lead_vmc: 258,
    login_site: 123,
  },
  'Google Ads': {
    cadastro_site: 245,
    lead_vmc: 225,
    login_site: 50,
  },
};

const TOTAL_INVESTMENT = 22000;
const TOTAL_SESSIONS = SESSIONS_BY_CHANNEL['Meta Ads'] + SESSIONS_BY_CHANNEL['Google Ads'];

const INVESTMENT_BY_CHANNEL: Record<ChannelName, number> = {
  'Meta Ads': TOTAL_INVESTMENT * (SESSIONS_BY_CHANNEL['Meta Ads'] / TOTAL_SESSIONS),
  'Google Ads': TOTAL_INVESTMENT * (SESSIONS_BY_CHANNEL['Google Ads'] / TOTAL_SESSIONS),
};

// criar um array que contenha os dias de acordo com o new_visao_geral
// e que responda ao filtro de data no começo. SEE for possivel ter alguma funcao que troque de dia para semana
const WEEK_LABELS = ['01–07 Ago', '08–14 Ago', '15–21 Ago', '22–28 Ago', '29–31 Ago'];
// apagar essa tristeza aqui
const WEEK_WEIGHTS = [0.215, 0.235, 0.245, 0.21, 0.095];

// provavelemte apagar pq esta fazendo o proporcional
function distributeAcrossWeeks(monthlyTotal: number, seed: number): number[] {
  return WEEK_WEIGHTS.map((weight, weekIndex) => {
    const jitter = 1 + Math.sin(weekIndex * 2.7 + seed * 0.0001) * 0.06;
    return Math.round(monthlyTotal * weight * jitter);
  });
}

// Pre-compute weekly datasets
const WEEKLY_EVENTS: Record<string, Record<string, number[]>> = {};
const WEEKLY_SESSIONS: Record<string, number[]> = {};
const WEEKLY_INVESTMENT: Record<string, number[]> = {};

CHANNEL_NAMES.forEach((channelName) => {
  WEEKLY_EVENTS[channelName] = {};
  EVENT_NAMES.forEach((eventName) => {
    const monthlyEvents = EVENTS_BY_CHANNEL[channelName][eventName];
    WEEKLY_EVENTS[channelName][eventName] = distributeAcrossWeeks(monthlyEvents, monthlyEvents);
  });
  WEEKLY_SESSIONS[channelName] = distributeAcrossWeeks(
    SESSIONS_BY_CHANNEL[channelName],
    SESSIONS_BY_CHANNEL[channelName] * 1.3,
  );
  WEEKLY_INVESTMENT[channelName] = WEEK_WEIGHTS.map((weight) => INVESTMENT_BY_CHANNEL[channelName] * weight);
});

interface PaidMediaViewProps {
  paidEvents: PaidMediaEventsReport;
  kpis: OverviewKPIs;
  channelPerf: ChannelPerformance[];
  mediaEfficiency: MediaEfficiencyRow[];
  showFooter?: boolean;
  paidEventsOK: NewVisaoGeralMidia[];
}

export function PaidMediaView({
  paidEvents,
  kpis,
  channelPerf,
  mediaEfficiency,
  showFooter,
  paidEventsOK,
}: PaidMediaViewProps) {
  const [selectedChannels, setSelectedChannels] = useState<Set<ChannelName>>(new Set(CHANNEL_NAMES));
  const [selectedEvents, setSelectedEvents] = useState<Set<EventName>>(new Set(EVENT_NAMES));

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
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Filter handlers
  const toggleChannel = (channelName: ChannelName) => {
    setSelectedChannels((previous) => {
      const next = new Set(previous);
      if (next.has(channelName)) {
        if (next.size > 1) next.delete(channelName);
      } else {
        next.add(channelName);
      }
      return next;
    });
  };

  const toggleEvent = (eventName: EventName) => {
    setSelectedEvents((previous) => {
      const next = new Set(previous);
      if (next.has(eventName)) {
        if (next.size > 1) next.delete(eventName);
      } else {
        next.add(eventName);
      }
      return next;
    });
  };

  const selectAllChannels = () => setSelectedChannels(new Set(CHANNEL_NAMES));
  const selectAllEvents = () => setSelectedEvents(new Set(EVENT_NAMES));

  // Compute aggregated dataset based on selection and data scale
  const aggregates = useMemo(() => {
    let totalSessions = 0;
    let totalEvents = 0;
    let totalInvestment = 0;
    const weeklyEvents = [0, 0, 0, 0, 0];
    const weeklySessions = [0, 0, 0, 0, 0];
    const weeklyInvestment = [0, 0, 0, 0, 0];
    const perChannel: Record<
      string,
      {
        events: number;
        sessions: number;
        investment: number;
        weeklyEvents: number[];
        weeklySessions: number[];
        weeklyInvestment: number[];
      }
    > = {};
    const perEvent: Record<string, { events: number; sessions: number; investment: number }> = {};

    selectedChannels.forEach((channelName) => {
      let channelEvents = 0;
      const channelWeeklyEvents = [0, 0, 0, 0, 0];
      selectedEvents.forEach((eventName) => {
        const scaledEvents = Math.round(EVENTS_BY_CHANNEL[channelName][eventName] * dataScale);
        channelEvents += scaledEvents;
        totalEvents += scaledEvents;
        WEEKLY_EVENTS[channelName][eventName].forEach((weekValue, weekIndex) => {
          const scaledWeekValue = Math.round(weekValue * dataScale);
          weeklyEvents[weekIndex] += scaledWeekValue;
          channelWeeklyEvents[weekIndex] += scaledWeekValue;
        });
        if (!perEvent[eventName]) perEvent[eventName] = { events: 0, sessions: 0, investment: 0 };
        perEvent[eventName].events += scaledEvents;
      });

      const channelSessions = Math.round(SESSIONS_BY_CHANNEL[channelName] * dataScale);
      const channelInvestment = INVESTMENT_BY_CHANNEL[channelName] * dataScale;

      totalSessions += channelSessions;
      totalInvestment += channelInvestment;

      WEEKLY_SESSIONS[channelName].forEach(
        (weekValue, weekIndex) => (weeklySessions[weekIndex] += Math.round(weekValue * dataScale)),
      );
      WEEKLY_INVESTMENT[channelName].forEach(
        (weekValue, weekIndex) => (weeklyInvestment[weekIndex] += weekValue * dataScale),
      );

      perChannel[channelName] = {
        events: channelEvents,
        sessions: channelSessions,
        investment: channelInvestment,
        weeklyEvents: channelWeeklyEvents,
        weeklySessions: WEEKLY_SESSIONS[channelName].map((weekValue) => Math.round(weekValue * dataScale)),
        weeklyInvestment: WEEKLY_INVESTMENT[channelName].map((weekValue) => weekValue * dataScale),
      };
    });

    Object.keys(perEvent).forEach((eventName) => {
      perEvent[eventName].sessions = totalSessions;
      perEvent[eventName].investment = totalInvestment;
    });

    return {
      totalSessions,
      totalEvents,
      totalInvestment,
      weeklyEvents,
      weeklySessions,
      weeklyInvestment,
      perChannel,
      perEvent,
    };
  }, [selectedChannels, selectedEvents, dataScale]);

  let maxEventsValue = Math.max(...aggregates.weeklyEvents) * 1.15;
  if (maxEventsValue === 0) maxEventsValue = 1;

  // Investimento (R$) usa eixo secundário à direita por ter escala diferente dos eventos
  let maxInvestmentValue = Math.max(...aggregates.weeklyInvestment) * 1.15;
  if (maxInvestmentValue === 0) maxInvestmentValue = 1;

  const filteredEvents = useMemo(
    () =>
      paidEventsOK.filter(
        (row) => selectedChannels.has(row.plataforma) && selectedEvents.has(row.evento as EventName),
      ),
    [paidEventsOK, selectedChannels, selectedEvents],
  );

  const sumBy = (field: 'impressoes' | 'conversoes' | 'investimento' | 'cpa' | 'ctr') =>
    filteredEvents.reduce((sum, row) => sum + row[field], 0);

  const averageBy = (field: 'cpa' | 'ctr') =>
    filteredEvents.length === 0 ? 0 : Number((sumBy(field) / filteredEvents.length).toFixed(2));

  const getTotalImpressions = () => sumBy('impressoes');

  const getTotalConversions = () => sumBy('conversoes');

  const getTotalInvestment = () => sumBy('investimento');

  const getConversionsTax = (conversion: number, impression: number) => {
    if (impression === 0) return '0.00%';
    return ((conversion / impression) * 100).toFixed(2) + '%';
  };

  const getCPA = () => averageBy('cpa');

  const getCTR = () => averageBy('ctr') + '%';

  useEffect(() => {
    console.log('Total Impressions:', { selectedChannels, selectedEvents });
  }, [selectedEvents, selectedChannels]);

  return (
    <div className='space-y-6'>
      {/* Dynamic Filter Card matching copart-dashboard styling */}
      <div className='rounded-2xl border border-[#dfe6ee] bg-white p-5 shadow-sm'>
        <div className='flex items-center gap-2 mb-4 pb-3 border-b border-[#dfe6ee]'>
          <Filter className='w-4 h-4 text-[#00b8cf]' />
          <h3 className='text-xs font-black uppercase tracking-wider text-[#0b1f3a]'>
            Filtros interativos de Mídia Paga
          </h3>
          <InfoTip text='Filtre os canais e eventos nativos do GA4. Os indicadores, gráficos e tabelas atualizam em tempo real.' />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Channels Filter */}
          <div>
            <p className='text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-2'>
              Canais selecionados
            </p>
            <div className='flex flex-wrap gap-2'>
              <button
                onClick={selectAllChannels}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedChannels.size === CHANNEL_NAMES.length
                    ? 'bg-[#0b1f3a] text-white shadow-sm'
                    : 'bg-[#f4f7fb] text-[#4a6080] hover:bg-[#dfe6ee]'
                }`}
              >
                Todos os canais
              </button>
              {CHANNEL_NAMES.map((channelName) => {
                const isSelected = selectedChannels.has(channelName);
                const color = CHANNEL_COLORS[channelName];
                return (
                  <button
                    key={channelName}
                    onClick={() => toggleChannel(channelName)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'text-[#0b1f3a] bg-white shadow-sm'
                        : 'bg-[#f4f7fb] border-transparent text-[#6c7685] hover:bg-[#dfe6ee]'
                    }`}
                    style={
                      isSelected
                        ? {
                            borderColor: color,
                            borderLeftWidth: '4px',
                          }
                        : {}
                    }
                  >
                    {channelName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Events Filter */}
          <div>
            <p className='text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-2'>
              Eventos GA4 selecionados
            </p>
            <div className='flex flex-wrap gap-1.5'>
              <button
                onClick={selectAllEvents}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedEvents.size === EVENT_NAMES.length
                    ? 'bg-[#00b8cf] text-[#0b1f3a] shadow-sm'
                    : 'bg-[#f4f7fb] text-[#4a6080] hover:bg-[#dfe6ee]'
                }`}
              >
                Todos os eventos
              </button>
              {EVENT_NAMES.map((eventName) => {
                const isSelected = selectedEvents.has(eventName);
                return (
                  <button
                    key={eventName}
                    onClick={() => toggleEvent(eventName)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#0b1f3a] text-white shadow-sm'
                        : 'bg-[#f4f7fb] text-[#6c7685] hover:bg-[#dfe6ee]'
                    }`}
                  >
                    {eventName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Strip (6 Cards) */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4'>
        {/* Impressões */}
        <div className='rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm'>
          <p className='text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1'>Impressões</p>
          {/* <p className='text-2xl font-black text-[#0b1f3a] tracking-tight'>{formatCurrency(costPerEvent)}</p> */}
          <p className='text-2xl font-black text-[#0b1f3a] tracking-tight'>{getTotalImpressions()}</p>
          <p className='text-[11px] font-semibold text-[#8aa4be] mt-1'>Soma dos canais</p>
        </div>
        {/* Impressões */}

        {/* Eventos*/}
        <div className='rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm'>
          <p className='text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1'>
            Eventos disparados
          </p>
          <p className='text-2xl font-black text-[#0b1f3a] tracking-tight'>{getTotalConversions()}</p>
          <p className='text-[11px] font-semibold text-[#8aa4be] mt-1'></p>
        </div>
        {/* Eventos*/}

        {/* Taxa de Conversão */}
        <div className='rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm'>
          <p className='text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1'>Tx Conversão</p>
          {/* <p className='text-2xl font-black text-[#0b1f3a] tracking-tight'>
            {formatRatioAsPercent(conversionRate)}
          </p> */}

          <p className='text-2xl font-black text-[#0b1f3a] tracking-tight'>
            {getConversionsTax(getTotalConversions(), getTotalImpressions())}
          </p>
          <p className='text-[11px] font-semibold text-[#8aa4be] mt-1'>Eventos / Impressões</p>
        </div>

        {/* CPA */}
        <div className='rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm'>
          <p className='text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1'>CPA</p>
          <p className='text-2xl font-black text-[#0b1f3a] tracking-tight'>{getCPA()}</p>
          <p className='text-[11px] font-semibold text-[#8aa4be] mt-1'>Custo por evento</p>
        </div>

        {/* CPS */}
        <div className='rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm'>
          <p className='text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1'>CTR</p>
          {/* <p className='text-2xl font-black text-[#0b1f3a] tracking-tight'>
            {formatCurrency(costPerSession)}
          </p> */}
          <p className='text-2xl font-black text-[#0b1f3a] tracking-tight'>{getCTR()}</p>
          <p className='text-[11px] font-semibold text-[#8aa4be] mt-1'>Taxa de cliques por impressões</p>
        </div>

        {/* Investimento */}
        <div className='rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm'>
          <p className='text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1'>Investimento</p>
          <p className='text-2xl font-black text-[#0b1f3a] tracking-tight'>{getTotalInvestment()}</p>
          <p className='text-[11px] font-semibold text-[#8aa4be] mt-1'>Mídia paga acumulada</p>
        </div>
      </div>

      {/* Footer Banner matching copart-dashboard governance cards */}
      {showFooter && (
        <div className='p-5 rounded-2xl bg-[#0b1f3a] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-[#00b8cf]/20 flex items-center justify-center text-[#00b8cf]'>
              <Database className='w-5 h-5' />
            </div>
            <div>
              <span className='font-black text-sm'>Central de Inteligência de Mídia Paga</span>
              <p className='text-xs text-[#d9eaf5] mt-0.5'>
                Binder × WiseMetrics · Copart Brasil · Extrações GA4 + Google Ads + Meta Ads
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 text-xs font-semibold text-[#8aa4be]'>
            <ShieldCheck className='w-4 h-4 text-[#00b8cf]' />
            <span>Base sincronizada</span>
          </div>
        </div>
      )}
    </div>
  );
}
