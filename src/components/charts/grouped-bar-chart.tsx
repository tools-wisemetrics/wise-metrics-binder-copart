'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatNumber } from '@/lib/utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface GroupedBarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
  height?: number;
}

export function GroupedBarChart({ data, height = 300 }: GroupedBarChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          color: '#6c7685',
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw;
            return ` ${context.dataset.label}: ${formatNumber(val)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#dfe6ee',
        },
        ticks: {
          color: '#6c7685',
          callback: (value: any) => formatNumber(value),
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6c7685',
        }
      }
    },
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <Bar options={options} data={data} />
    </div>
  );
}
