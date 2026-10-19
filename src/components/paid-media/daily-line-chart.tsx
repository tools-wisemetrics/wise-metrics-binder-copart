'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
} from 'recharts';
import { CardWrapper } from '@/components/layout/page-header';
import {
  formatBRL,
  formatNumberFull,
  formatNumber,
  formatNumberRounded,
  formatPercentage,
} from '@/lib/utils/formatters';
import { TrendingUp, Target, Calendar, Percent } from 'lucide-react';
import type { NewVisaoGeralMidia } from '@/lib/data/raw-data';

export interface DailyTrendDataPoint {
  date: string;
  conversions: number;
  investment: number;
  impressions?: number;
  cpa: number;
  conversionRate?: string;
}

const PT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/**
 * Formata datas ISO (ex: "2026-10-17") para label legível (ex: "17 Out")
 */
function formatDateLabel(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10);
    const monthName = PT_MONTHS[month - 1] || parts[1];
    return `${String(day).padStart(2, '0')} ${monthName}`;
  }
  return dateStr;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
    payload?: DailyTrendDataPoint;
  }>;
  label?: string;
}

function DailyChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className='w-[270px] overflow-hidden rounded-xl border border-[#1a3050] bg-[#0b1f3a] p-3 text-white shadow-2xl text-xs'>
      <div className='flex items-center gap-1.5 border-b border-[#1a3050] pb-2 mb-2.5 font-black text-white'>
        <Calendar className='w-3.5 h-3.5 text-[#00b8cf]' />
        <span>{label}</span>
      </div>

      <div className='space-y-2'>
        {/* Conversões */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 text-[#d9eaf5]'>
            <span className='h-2.5 w-2.5 rounded-full bg-[#00b8cf]' />
            <span>Conversões:</span>
          </div>
          <span className='font-black text-white'>{formatNumberRounded(data.conversions)}</span>
        </div>

        {/* Investimento */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 text-[#d9eaf5]'>
            <span className='h-2.5 w-2.5 rounded-full bg-[#8b5cf6]' />
            <span>Investimento:</span>
          </div>
          <span className='font-black text-[#8b5cf6]'>{formatBRL(data.investment)}</span>
        </div>

        {/* Métricas Calculadas: Taxa de Conversão e CPA */}
        <div className='border-t border-[#1a3050] pt-2 mt-2 space-y-1.5'>
          {/* Taxa de Conversão */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1.5 text-[#8aa4be] text-[11px] font-semibold'>
              <Percent className='w-3 h-3 text-[#10b981]' />
              <span>Taxa de Conversão:</span>
            </div>
            <span className='font-bold text-[#10b981]'>
              {data.conversionRate ??
                (data.impressions && data.impressions > 0
                  ? `${((data.conversions / data.impressions) * 100).toFixed(2)}%`
                  : '0.00%')}
            </span>
          </div>

          {/* CPA Médio */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1.5 text-[#8aa4be] text-[11px] font-semibold'>
              <Target className='w-3 h-3 text-[#00b8cf]' />
              <span>CPA Médio do Dia:</span>
            </div>
            <span className='font-bold text-[#34d399]'>{formatBRL(data.cpa)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export type PaidMediaInputItem = NewVisaoGeralMidia | DailyTrendDataPoint;

interface DailyLineChartProps {
  data?: PaidMediaInputItem[];
}

export function DailyLineChart({ data }: DailyLineChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Processa e agrega os dados dinamicamente por dia
  const chartData = useMemo<DailyTrendDataPoint[]>(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const firstItem = data[0];

    // Se já estiver no formato pré-agregado DailyTrendDataPoint
    if ('date' in firstItem && 'conversions' in firstItem && !('date_start' in firstItem)) {
      return data as DailyTrendDataPoint[];
    }

    // Agrupamento por dia a partir de NewVisaoGeralMidia
    const grouped: Record<
      string,
      {
        dateLabel: string;
        conversions: number;
        investment: number;
        impressions: number;
      }
    > = {};

    (data as NewVisaoGeralMidia[]).forEach((item) => {
      const rawDate = item.date_start || item.date_end;
      if (!rawDate) return;

      if (!grouped[rawDate]) {
        grouped[rawDate] = {
          dateLabel: formatDateLabel(rawDate),
          conversions: 0,
          investment: 0,
          impressions: 0,
        };
      }

      grouped[rawDate].conversions += Number(item.conversoes ?? 0);
      grouped[rawDate].investment += Number(item.investimento ?? 0);
      grouped[rawDate].impressions += Number(item.impressoes ?? 0);
    });

    const sortedDates = Object.keys(grouped).sort();
    if (sortedDates.length === 0) {
      return [];
    }

    return sortedDates.map((dateKey) => {
      const item = grouped[dateKey];
      const cpa = item.conversions > 0 ? item.investment / item.conversions : 0;
      const conversionRate =
        item.impressions > 0 ? `${((item.conversions / item.impressions) * 100).toFixed(2)}%` : '0.00%';

      return {
        date: item.dateLabel,
        conversions: Math.round(item.conversions * 10) / 10,
        investment: Math.round(item.investment * 100) / 100,
        impressions: item.impressions,
        cpa: Math.round(cpa * 100) / 100,
        conversionRate,
      };
    });
  }, [data]);

  if (!mounted) {
    return (
      <CardWrapper>
        <div style={{ height: 420 }} className='w-full rounded-xl bg-[#f4f7fb] animate-pulse' />
      </CardWrapper>
    );
  }

  return (
    <CardWrapper>
      {/* Header & Static Legend */}
      <div className='flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-[#dfe6ee]'>
        <div>
          <div className='flex items-center gap-2'>
            <TrendingUp className='w-4 h-4 text-[#00b8cf]' />
            <h3 className='text-sm font-black text-[#0b1f3a]'>
              Evolução Diária: Conversões vs. Investimento
            </h3>
          </div>
          <p className='text-xs text-[#6c7685] mt-0.5'>
            Comparativo diário entre o volume de conversões (eixo esquerdo) e investimento aplicado (eixo
            direito).
          </p>
        </div>

        {/* Static Legend */}
        <div className='flex flex-wrap items-center gap-4 text-xs font-bold text-[#4a6080]'>
          <div className='flex items-center gap-1.5'>
            <span className='h-2.5 w-4 rounded bg-[#00b8cf]' />
            <span className='text-[#0b1f3a]'>Conversões (Eixo Esquerdo)</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='h-2.5 w-4 rounded bg-[#8b5cf6]' />
            <span className='text-[#0b1f3a]'>Investimento R$ (Eixo Direito)</span>
          </div>
        </div>
      </div>

      {/* Se não houver dados */}
      {chartData.length === 0 ? (
        <div
          style={{ height: 420 }}
          className='flex flex-col items-center justify-center text-center p-6 bg-[#f8fafc] rounded-xl border border-dashed border-[#dfe6ee]'
        >
          <TrendingUp className='w-8 h-8 text-[#8aa4be] mb-2' />
          <p className='text-sm font-bold text-[#0b1f3a]'>Nenhum dado encontrado para o período</p>
          <p className='text-xs text-[#6c7685] mt-1'>
            Passe um array com os registros de mídia paga para renderizar o gráfico.
          </p>
        </div>
      ) : (
        /* Recharts Dual Y-Axis Container */
        <div style={{ height: 420 }} className='w-full select-none pt-2'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart data={chartData} margin={{ top: 15, right: 25, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id='cyanGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#00b8cf' stopOpacity={0.25} />
                  <stop offset='95%' stopColor='#00b8cf' stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' vertical={false} />

              {/* Eixo X: Dias */}
              <XAxis
                dataKey='date'
                stroke='#6c7685'
                fontSize={11}
                fontWeight={600}
                tickLine={false}
                axisLine={{ stroke: '#dfe6ee' }}
                dy={8}
              />

              {/* Eixo Y da Esquerda: Conversões */}
              <YAxis
                yAxisId='left'
                orientation='left'
                stroke='#00b8cf'
                fontSize={11}
                fontWeight={700}
                tickLine={false}
                axisLine={{ stroke: '#00b8cf' }}
                tickFormatter={(val: number) => formatNumber(val)}
                domain={[0, 'auto']}
                label={{
                  value: 'Conversões (un)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#00b8cf',
                  fontSize: 10,
                  fontWeight: 700,
                  dy: 45,
                }}
              />

              {/* Eixo Y da Direita: Investimento (R$) */}
              <YAxis
                yAxisId='right'
                orientation='right'
                stroke='#8b5cf6'
                fontSize={11}
                fontWeight={700}
                tickLine={false}
                axisLine={{ stroke: '#8b5cf6' }}
                tickFormatter={(val: number) => `R$ ${formatNumber(val)}`}
                domain={[0, 'auto']}
                label={{
                  value: 'Investimento (R$)',
                  angle: 90,
                  position: 'insideRight',
                  fill: '#8b5cf6',
                  fontSize: 10,
                  fontWeight: 700,
                  dy: 45,
                }}
              />

              <Tooltip content={<DailyChartTooltip />} />

              {/* Área sombreada suave para Conversões */}
              <Area
                yAxisId='left'
                type='monotone'
                dataKey='conversions'
                fill='url(#cyanGradient)'
                stroke='none'
              />

              {/* Linha 1: Conversões */}
              <Line
                yAxisId='left'
                type='monotone'
                dataKey='conversions'
                name='Conversões'
                stroke='#00b8cf'
                strokeWidth={3}
                dot={{ r: 3, fill: '#0b1f3a', stroke: '#00b8cf', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#00b8cf', stroke: '#ffffff', strokeWidth: 2 }}
              />

              {/* Linha 2: Investimento */}
              <Line
                yAxisId='right'
                type='monotone'
                dataKey='investment'
                name='Investimento'
                stroke='#8b5cf6'
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0b1f3a', stroke: '#8b5cf6', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </CardWrapper>
  );
}
