'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { CardWrapper } from '@/components/layout/page-header';
import { formatBRL } from '@/lib/utils/formatters';

export interface GoalVsActualPoint {
  label: string;
  realized: number;
  goal: number;
}

const GREEN = '#00b050';
const SLATE = '#44546a';
const MARKER_WIDTH = 44;

// Desenha a meta como um traço horizontal sobre a barra
function GoalMarker(props: { cx?: number; cy?: number; index?: number }) {
  const { cx, cy, index } = props;
  if (cx == null || cy == null) return null;
  return (
    <rect
      key={index}
      x={cx - (MARKER_WIDTH + 8) / 2}
      y={cy - 4}
      width={MARKER_WIDTH + 8}
      height={8}
      rx={1}
      fill={SLATE}
    />
  );
}

export function GoalVsActualChart({
  data,
  title = 'Análise de Meta x Realizado Mensal',
}: {
  data: GoalVsActualPoint[];
  title?: string;
}) {
  return (
    <CardWrapper>
      <div className='flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-[#dfe6ee]'>
        <div>
          <div className='flex items-center gap-2'>
            <TrendingUp className='w-4 h-4 text-[#00b8cf]' />
            <h3 className='text-sm font-black text-[#0b1f3a]'>
              Evolução Orçamento Mensal: Total geral das plataformas
            </h3>
          </div>
          <p className='text-xs text-[#6c7685] mt-0.5'>
            Comparativo mensal entre a verba planejada e investimento gasto.
          </p>
        </div>

        {/* Static Legend */}
        <div className='flex flex-wrap items-center gap-4 text-xs font-bold text-[#4a6080]'>
          <div className='flex items-center gap-1.5'>
            <span className='h-2.5 w-4 rounded bg-[#00b050]' />
            <span className='text-[#0b1f3a]'>Verba de Mídia Líquida</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='h-2.5 w-4 rounded bg-[#44546a]' />
            <span className='text-[#0b1f3a]'>Investimento</span>
          </div>
        </div>
      </div>

      <div style={{ height: 420 }} className='w-full select-none'>
        <ResponsiveContainer width='100%' height='100%'>
          <ComposedChart data={data} margin={{ top: 15, right: 25, left: 10, bottom: 10 }}>
            <CartesianGrid stroke='#e2e8f0' vertical={false} />
            <XAxis
              dataKey='label'
              tickLine={false}
              axisLine={{ stroke: '#dfe6ee' }}
              fontSize={11}
              angle={-45}
              textAnchor='end'
              height={70}
              interval={0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              domain={[0, 'auto']}
              tickFormatter={(v: number) => formatBRL(v)}
              width={95}
            />
            <Tooltip formatter={(v) => (typeof v === 'number' ? formatBRL(v) : String(v ?? ''))} />

            <Bar dataKey='realized' name='Investimento' fill={GREEN} barSize={40} />
            <Line
              dataKey='goal'
              name='Verba de Mídia Líquida'
              stroke='none'
              dot={<GoalMarker />}
              activeDot={false}
              legendType='plainline'
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </CardWrapper>
  );
}
