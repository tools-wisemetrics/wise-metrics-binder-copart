import React, { useMemo, useState } from 'react';
import snapshotJson from '../lib/data/raw-snapshot.json';

type TPacing = {
  id: string;
  ano: number;
  mes: number;
  anoMes: string;
  unNegocio: string;
  plataforma: string;
  tipoCampanha: string;
  flVerbaExtra: number;
  budgetInvBruto: number;
  budgetInvLiquido: number;
  investimento: number;
  dtAtualizacao: string | null;
  totalDiasMes: number;
  diasDecorridos: number;
  saldoRestante: number;
  diasRestantes: number;
};

const rawSnapshot: Array<TPacing> = snapshotJson.pacing_midia_paga;

export const usePacing = () => {
  const [month, setMonth] = useState(0);
  const [monthTotalDays, setMonthTotalDays] = useState(0);
  const [monthDaysElapsed, setMonthDaysElapsed] = useState(0);
  const [tableData, setTableData] = useState<Array<Record<string, string>>>([]);
  //const [monthDaysRemaining, setMonthDaysRemaining] = useState(0);

  //   const totalNetBudgetInvestment = useMemo(() => {
  //     return rawSnapshot.reduce(
  //       (total, item) => (item.mes === month ? total + item.budgetInvLiquido : total),
  //       0,
  //     );
  //   }, [month]);

  //   const totalInvestment = useMemo(() => {
  //     return rawSnapshot.reduce((total, item) => (item.mes === month ? total + item.investimento : total), 0);
  //   }, [month]);

  //   const dailyAveragePacing = useMemo(() => {
  //     return totalNetBudgetInvestment / monthTotalDays;
  //   }, [monthTotalDays, totalNetBudgetInvestment]);

  //   const currentDailyAveragePacing = useMemo(() => {
  //     return totalInvestment / monthDaysElapsed;
  //   }, [monthDaysElapsed, totalInvestment]);

  //   const projection = useMemo(() => {
  //     return (totalInvestment / monthDaysElapsed) * monthTotalDays;
  //   }, [monthDaysElapsed, totalInvestment, monthTotalDays]);

  //   const budgetConsumedPercentage = useMemo(() => {
  //     return (totalInvestment / totalNetBudgetInvestment) * 100;
  //   }, [totalInvestment, totalNetBudgetInvestment]);

  const getTotalNetBudgetInvestment = (type?: keyof TPacing, value?: string | number) => {
    return rawSnapshot.reduce((total, item) => {
      const sameMonth = item.mes === month;
      const matchesFilter = type === undefined || item[type] === value;

      if (sameMonth && matchesFilter) {
        return total + item.budgetInvLiquido;
      }

      return total;
    }, 0);
  };

  const getTotalInvestment = (type?: keyof TPacing, value?: string | number) => {
    return rawSnapshot.reduce((total, item) => {
      const sameMonth = item.mes === month;
      const matchesFilter = type === undefined || item[type] === value;

      if (sameMonth && matchesFilter) {
        return total + item.investimento;
      }

      return total;
    }, 0);
  };

  const getTotalExtraFunds = (propTotal: keyof TPacing, propCompare?: keyof TPacing, value?: string) => {
    return rawSnapshot.reduce((total, item) => {
      const sameMonth = item.mes === month && item.flVerbaExtra === 1;
      const matchesFilter = propCompare === undefined || item[propCompare] === value;

      if (sameMonth && matchesFilter) {
        return total + (item[propTotal] as number);
      }

      return total;
    }, 0);
  };

  const getAveragePacing = (total: number, type: string) => {
    return total / (type === 'current' ? monthDaysElapsed : monthTotalDays);
  };

  const getProjection = (totalInvestment: number) => {
    return (totalInvestment / monthDaysElapsed) * monthTotalDays;
  };

  const getBudgetConsumedPercentage = (totalInvestment: number, totalNetBudgetInvestment: number) => {
    return (totalInvestment / totalNetBudgetInvestment) * 100;
  };

  const getStatus = (totalInvestment: number, totalNetBudgetInvestment: number, projection: number) => {
    if (totalInvestment > totalNetBudgetInvestment) {
      return 'red';
    } else if (projection > totalNetBudgetInvestment || projection >= totalNetBudgetInvestment * 0.9) {
      return 'yellow';
    } else {
      return 'green';
    }
  };

  const getDescription = (totalInvestment: number, totalNetBudgetInvestment: number, projection: number) => {
    if (totalInvestment > totalNetBudgetInvestment) {
      return 'Teto ultrapassado';
    } else if (projection > totalNetBudgetInvestment) {
      return 'Projeção acima do teto';
    } else if (projection >= totalNetBudgetInvestment * 0.9) {
      return 'Alerta, projeção próxima do teto';
    } else {
      return 'Dentro da meta';
    }
  };

  const getTotalTable = (business: string, column: keyof TPacing, platform: string) => {
    return rawSnapshot.reduce(
      (total, item) =>
        item.mes === month && item.unNegocio === business && item.plataforma === platform
          ? total + (item[column] as number)
          : total,
      0,
    );
  };

  const getTableData = () => {
    return [
      {
        unidade: 'Select',
        meta: {
          entrada: getTotalTable('Select', 'budgetInvBruto', 'Meta'),
          verbaLiquida: getTotalTable('Select', 'budgetInvLiquido', 'Meta'),
          saida: getTotalTable('Select', 'investimento', 'Meta'),
          falta:
            getTotalTable('Select', 'budgetInvLiquido', 'Meta') -
            getTotalTable('Select', 'investimento', 'Meta'),
        },
        google: {
          entrada: getTotalTable('Select', 'budgetInvBruto', 'Google Ads'),
          verbaLiquida: getTotalTable('Select', 'budgetInvLiquido', 'Google Ads'),
          saida: getTotalTable('Select', 'investimento', 'Google Ads'),
          falta:
            getTotalTable('Select', 'budgetInvLiquido', 'Google Ads') -
            getTotalTable('Select', 'investimento', 'Google Ads'),
        },
      },

      {
        unidade: 'Leilão',
        meta: {
          entrada: getTotalTable('Leilão', 'budgetInvBruto', 'Meta'),
          verbaLiquida: getTotalTable('Leilão', 'budgetInvLiquido', 'Meta'),
          saida: getTotalTable('Leilão', 'investimento', 'Meta'),
          falta:
            getTotalTable('Leilão', 'budgetInvLiquido', 'Meta') -
            getTotalTable('Leilão', 'investimento', 'Meta'),
        },
        google: {
          entrada: getTotalTable('Leilão', 'budgetInvBruto', 'Google Ads'),
          verbaLiquida: getTotalTable('Leilão', 'budgetInvLiquido', 'Google Ads'),
          saida: getTotalTable('Leilão', 'investimento', 'Google Ads'),
          falta:
            getTotalTable('Leilão', 'budgetInvLiquido', 'Google Ads') -
            getTotalTable('Leilão', 'investimento', 'Google Ads'),
        },
      },

      {
        unidade: 'Comitentes',
        meta: {
          entrada: getTotalTable('Comitentes', 'budgetInvBruto', 'Meta'),
          verbaLiquida: getTotalTable('Comitentes', 'budgetInvLiquido', 'Meta'),
          saida: getTotalTable('Comitentes', 'investimento', 'Meta'),
          falta:
            getTotalTable('Comitentes', 'budgetInvLiquido', 'Meta') -
            getTotalTable('Comitentes', 'investimento', 'Meta'),
        },
        google: {
          entrada: getTotalTable('Comitentes', 'budgetInvBruto', 'Google Ads'),
          verbaLiquida: getTotalTable('Comitentes', 'budgetInvLiquido', 'Google Ads'),
          saida: getTotalTable('Comitentes', 'investimento', 'Google Ads'),
          falta:
            getTotalTable('Comitentes', 'budgetInvLiquido', 'Google Ads') -
            getTotalTable('Comitentes', 'investimento', 'Google Ads'),
        },
      },
    ];
  };

  return {
    setMonth,
    setMonthTotalDays,
    setMonthDaysElapsed,
    getTotalNetBudgetInvestment,
    getTotalInvestment,
    getAveragePacing,
    getProjection,
    getBudgetConsumedPercentage,
    getStatus,
    getDescription,
    getTableData,
    getTotalExtraFunds,
  };
};
