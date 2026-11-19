'use client';

import { PageContent, SectionTitle } from '@/components/layout/page-header';
import { GoalVsActualChart, GoalVsActualPoint } from '@/components/paid-media/goalVsActualPoint';

import { usePacing } from '@/hooks/usePacing';
import { useEffect, useState } from 'react';
import { TablePancing } from '../../components/tables/tablePancing';
import { FilterYear } from '@/components/filters/filter-year';
import { CheckCircle2 } from 'lucide-react';

const MONTHS = [
  { number: 1, name: 'Janeiro' },
  { number: 2, name: 'Fevereiro' },
  { number: 3, name: 'Março' },
  { number: 4, name: 'Abril' },
  { number: 5, name: 'Maio' },
  { number: 6, name: 'Junho' },
  { number: 7, name: 'Julho' },
  { number: 8, name: 'Agosto' },
  { number: 9, name: 'Setembro' },
  { number: 10, name: 'Outubro' },
  { number: 11, name: 'Novembro' },
  { number: 12, name: 'Dezembro' },
];

const Pacing = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const {
    setMonth,
    setMonthTotalDays,
    setMonthDaysElapsed,
    getTotalNetBudgetInvestment,
    getTotalInvestment,
    getTableData,
  } = usePacing();
  const monthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  const chartData: GoalVsActualPoint[] = [
    {
      label: MONTHS[0].name,
      realized: 1000,
      goal: 5000,
    },
    {
      label: MONTHS[1].name,
      realized: 4000,
      goal: 5000,
    },
    {
      label: MONTHS[2].name,
      realized: 6000,
      goal: 5000,
    },
    {
      label: MONTHS[3].name,
      realized: 4000,
      goal: 5000,
    },
    {
      label: MONTHS[4].name,
      realized: 10000,
      goal: 5000,
    },
    {
      label: MONTHS[5].name,
      realized: 1000,
      goal: 5000,
    },
    {
      label: MONTHS[6].name,
      realized: 1000,
      goal: 5000,
    },
    {
      label: MONTHS[7].name,
      realized: 4000,
      goal: 5000,
    },
    {
      label: MONTHS[8].name,
      realized: getTotalInvestment(9),
      goal: getTotalNetBudgetInvestment(9),
    },
    {
      label: MONTHS[9].name,
      realized: getTotalInvestment(10),
      goal: getTotalNetBudgetInvestment(10),
    },
    {
      label: MONTHS[10].name,
      realized: getTotalInvestment(11),
      goal: getTotalNetBudgetInvestment(11),
    },
    {
      label: MONTHS[11].name,
      realized: getTotalInvestment(12),
      goal: getTotalNetBudgetInvestment(12),
    },
  ];

  useEffect(() => {
    setMonth(new Date().getMonth() + 1);
    setMonthTotalDays(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate());
    setMonthDaysElapsed(new Date().getDate());

    console.log(
      'Pacing loaded   ==========> ',
      new Date().getMonth() + 1,
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
      new Date().getDate(),
    );
  }, []);

  useEffect(() => {
    const selectedYear = localStorage.getItem('selectedYear');
    if (selectedYear) {
      console.log('Selected year from localStorage:', selectedYear);
    }
  }, []);

  return (
    <>
      <FilterYear setYear={setSelectedYear} />
      <PageContent>
        <div className='flex items-center justify-between mt-8 mb-8'>
          <div>
            <h2 className='text-xl font-black tracking-tight text-[#0b1f3a] border-b-2 border-[#00b8cf]'>
              Log Financeiro
            </h2>
          </div>
          <div className='bg-[#e8f8ef] px-3 py-1.5 rounded-xl border border-[#00a85a]/30 flex items-center gap-2'>
            <CheckCircle2 className='w-5 h-5 text-[#007342]' />
            <span className='font-semibold text-[#007342] mt-0.5'>Ano de {selectedYear}</span>
          </div>
        </div>

        <GoalVsActualChart data={chartData} />

        <div className='mb-12'></div>

        {MONTHS.map((month) => (
          <div key={month.number}>
            <SectionTitle>Mês de {month.name}</SectionTitle>
            <TablePancing tableData={getTableData({ month: month.number })} />

            <div className='mb-12'></div>
          </div>
        ))}
      </PageContent>
    </>
  );
};
export default Pacing;
