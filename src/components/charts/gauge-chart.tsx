'use client';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { formatNumber } from '@/lib/utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

interface GaugeChartProps {
  value: number;
  max: number;
  title: string;
  color?: string;
}

export function GaugeChart({ value, max, title, color = '#00b8cf' }: GaugeChartProps) {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  
  const data = {
    labels: ['Progresso', 'Restante'],
    datasets: [
      {
        data: [value, Math.max(0, max - value)],
        backgroundColor: [color, '#e2e8f0'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
        cutout: '80%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const val = context.raw;
            return `${label}: ${formatNumber(val)}`;
          }
        }
      }
    },
  };

  return (
    <div className="relative h-[150px] w-full flex flex-col items-center justify-end pb-4">
      <div className="absolute inset-0 top-0 h-[200px]">
        <Doughnut data={data} options={options} />
      </div>
      <div className="absolute top-[60px] text-center w-full">
        <p className="text-3xl font-black text-foreground">{percentage}%</p>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {formatNumber(value)} / {formatNumber(max)}
        </p>
      </div>
    </div>
  );
}
