'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { InfoTip } from '@/components/layout/info-tip';
import { Database, ShieldCheck, TrendingUp, Filter, BarChart2 } from 'lucide-react';

import { formatBRL, formatNumberRounded, formatPercentage } from '@/lib/utils/formatters';
import type {
  PaidMediaEventsReport,
  OverviewKPIs,
  ChannelPerformance,
  MediaEfficiencyRow,
} from '@/lib/data/types';

import { NewVisaoGeralMidia } from '@/lib/data/raw-data';
import { DailyLineChart } from './daily-line-chart';

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
interface PaidMediaViewProps {
  paidEvents: PaidMediaEventsReport;
  kpis: OverviewKPIs;
  channelPerf: ChannelPerformance[];
  mediaEfficiency: MediaEfficiencyRow[];
  showFooter?: boolean;
  paidEventsOK?: NewVisaoGeralMidia[];
}

export function PaidMediaView({
  paidEvents,
  kpis,
  channelPerf,
  mediaEfficiency,
  showFooter,
  paidEventsOK = [],
}: PaidMediaViewProps) {
  const [selectedChannels, setSelectedChannels] = useState<Set<ChannelName>>(new Set(CHANNEL_NAMES));
  const [selectedEvents, setSelectedEvents] = useState<Set<EventName>>(new Set(EVENT_NAMES));

  const filterPaidEvents = (
    data: NewVisaoGeralMidia[],
    channels: Set<ChannelName>,
    events: Set<EventName>,
  ): NewVisaoGeralMidia[] => {
    return data.filter(
      // "Essa linha pertence a uma das plataformas que estão selecionadas?"
      (row) => channels.has(row.plataforma as ChannelName) && events.has(row.evento as EventName),
    );
  };

  const filteredPaidEvents = useMemo(
    () => filterPaidEvents(paidEventsOK, selectedChannels, selectedEvents),
    [paidEventsOK, selectedChannels, selectedEvents],
  );

  // ==========================================
  // Filter handlers
  // ==========================================
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

  const sumBy = (field: 'impressoes' | 'conversoes' | 'investimento' | 'cpa' | 'ctr') =>
    filteredPaidEvents.reduce((sum, row) => sum + (row[field] ?? 0), 0);

  const averageBy = (field: 'cpa' | 'ctr') =>
    filteredPaidEvents.length === 0 ? 0 : Number((sumBy(field) / filteredPaidEvents.length).toFixed(2));

  const getTotalImpressions = () => sumBy('impressoes');

  const getTotalConversions = () => sumBy('conversoes');

  const getTotalInvestment = () => sumBy('investimento');

  const getConversionsTax = (conversion: number, impression: number) => {
    if (impression === 0) return 0;
    return (conversion / impression) * 100;
  };

  const getCPA = () => averageBy('cpa');

  const getCTR = () => averageBy('ctr');

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
          <p className='text-2xl font-black text-[#0b1f3a] tracking-tight'>
            {formatNumberRounded(getTotalImpressions())}
          </p>
          <p className='text-[11px] font-semibold text-[#8aa4be] mt-1'>Soma dos canais</p>
        </div>
        {/* Impressões */}

        {/* Eventos*/}
        <div className='rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm'>
          <p className='text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1'>
            Eventos disparados
          </p>
          <p className='text-2xl font-black text-[#0b1f3a] tracking-tight'>
            {formatNumberRounded(getTotalConversions())}
          </p>
          <p className='text-[11px] font-semibold text-[#8aa4be] mt-1'>Eventos de conversão</p>
        </div>
        {/* Eventos*/}

        {/* Taxa de Conversão */}
        <div className='rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm'>
          <p className='text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1'>Tx Conversão</p>
          {/* <p className='text-2xl font-black text-[#0b1f3a] tracking-tight'>
            {formatRatioAsPercent(conversionRate)}
          </p> */}

          <p className='text-2xl font-black text-[#0b1f3a] tracking-tight'>
            {formatPercentage(getConversionsTax(getTotalConversions(), getTotalImpressions()))}
          </p>
          <p className='text-[11px] font-semibold text-[#8aa4be] mt-1'>Eventos / Impressões</p>
        </div>

        {/* CPA */}
        <div className='rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm'>
          <p className='text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1'>CPA</p>
          <p className='text-2xl font-black text-[#0b1f3a] tracking-tight'>
            {formatBRL(getTotalInvestment() / getTotalConversions())}
          </p>
          <p className='text-[11px] font-semibold text-[#8aa4be] mt-1'>Custo por evento</p>
        </div>

        {/* CPS */}
        <div className='rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm'>
          <p className='text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1'>CTR</p>
          {/* <p className='text-2xl font-black text-[#0b1f3a] tracking-tight'>
            {formatCurrency(costPerSession)}
          </p> */}
          <p className='text-2xl font-black text-[#0b1f3a] tracking-tight'>{formatPercentage(getCTR())}</p>
          <p className='text-[11px] font-semibold text-[#8aa4be] mt-1'>Taxa de cliques por impressões</p>
        </div>

        {/* Investimento */}
        <div className='rounded-2xl border border-[#dfe6ee] bg-white p-4 shadow-sm'>
          <p className='text-[10px] font-bold uppercase tracking-wider text-[#6c7685] mb-1'>Investimento</p>
          <p className='text-2xl font-black text-[#0b1f3a] tracking-tight'>
            {formatBRL(getTotalInvestment())}
          </p>
          <p className='text-[11px] font-semibold text-[#8aa4be] mt-1'>Mídia paga acumulada</p>
        </div>
      </div>

      <DailyLineChart data={filteredPaidEvents} />

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
