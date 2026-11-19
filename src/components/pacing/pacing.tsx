'use client';

import { PageContent, SectionTitle } from '@/components/layout/page-header';
import { GoalCardPacing } from '@/components/cards/goal-card-pacing';
import { InfoTip } from '@/components/layout/info-tip';
import { Database, ShieldCheck } from 'lucide-react';

import { usePacing } from '@/hooks/usePacing';
import { useEffect } from 'react';
import { TablePancing } from '../tables/tablePancing';

const Pacing = () => {
  const {
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
  } = usePacing();

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

  return (
    <>
      <SectionTitle>Geral de Mídia</SectionTitle>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8'>
        <GoalCardPacing
          key={'all'}
          title={'Todas'}
          current={getTotalInvestment()}
          target={getTotalNetBudgetInvestment()}
          percentage={getBudgetConsumedPercentage(getTotalInvestment(), getTotalNetBudgetInvestment())}
          description={getDescription(
            getTotalInvestment(),
            getTotalNetBudgetInvestment(),
            getProjection(getTotalInvestment()),
          )}
          descriptionType={getStatus(
            getTotalInvestment(),
            getTotalNetBudgetInvestment(),
            getProjection(getTotalInvestment()),
          )}
        />
      </div>

      <SectionTitle>Por Plataforma</SectionTitle>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8'>
        <GoalCardPacing
          key={'meta'}
          title={'Meta'}
          current={getTotalInvestment(undefined, 'plataforma', 'Meta')}
          target={getTotalNetBudgetInvestment(undefined, 'plataforma', 'Meta')}
          percentage={getBudgetConsumedPercentage(
            getTotalInvestment(undefined, 'plataforma', 'Meta'),
            getTotalNetBudgetInvestment(undefined, 'plataforma', 'Meta'),
          )}
          description={getDescription(
            getTotalInvestment(undefined, 'plataforma', 'Meta'),
            getTotalNetBudgetInvestment(undefined, 'plataforma', 'Meta'),
            getProjection(getTotalInvestment(undefined, 'plataforma', 'Meta')),
          )}
          descriptionType={getStatus(
            getTotalInvestment(undefined, 'plataforma', 'Meta'),
            getTotalNetBudgetInvestment(undefined, 'plataforma', 'Meta'),
            getProjection(getTotalInvestment(undefined, 'plataforma', 'Meta')),
          )}
        />

        <GoalCardPacing
          key={'google-ads'}
          title={'Google Ads'}
          current={getTotalInvestment(undefined, 'plataforma', 'Google Ads')}
          target={getTotalNetBudgetInvestment(undefined, 'plataforma', 'Google Ads')}
          percentage={getBudgetConsumedPercentage(
            getTotalInvestment(undefined, 'plataforma', 'Google Ads'),
            getTotalNetBudgetInvestment(undefined, 'plataforma', 'Google Ads'),
          )}
          description={getDescription(
            getTotalInvestment(undefined, 'plataforma', 'Google Ads'),
            getTotalNetBudgetInvestment(undefined, 'plataforma', 'Google Ads'),
            getProjection(getTotalInvestment(undefined, 'plataforma', 'Google Ads')),
          )}
          descriptionType={getStatus(
            getTotalInvestment(undefined, 'plataforma', 'Google Ads'),
            getTotalNetBudgetInvestment(undefined, 'plataforma', 'Google Ads'),
            getProjection(getTotalInvestment(undefined, 'plataforma', 'Google Ads')),
          )}
        />
      </div>

      <SectionTitle>Unidade de Negócio</SectionTitle>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8'>
        <GoalCardPacing
          key={'leilao'}
          title={'Leilão'}
          current={getTotalInvestment(undefined, 'unNegocio', 'Leilão')}
          target={getTotalNetBudgetInvestment(undefined, 'unNegocio', 'Leilão')}
          percentage={getBudgetConsumedPercentage(
            getTotalInvestment(undefined, 'unNegocio', 'Leilão'),
            getTotalNetBudgetInvestment(undefined, 'unNegocio', 'Leilão'),
          )}
          description={getDescription(
            getTotalInvestment(undefined, 'unNegocio', 'Leilão'),
            getTotalNetBudgetInvestment(undefined, 'unNegocio', 'Leilão'),
            getProjection(getTotalInvestment(undefined, 'unNegocio', 'Leilão')),
          )}
          descriptionType={getStatus(
            getTotalInvestment(undefined, 'unNegocio', 'Leilão'),
            getTotalNetBudgetInvestment(undefined, 'unNegocio', 'Leilão'),
            getProjection(getTotalInvestment(undefined, 'unNegocio', 'Leilão')),
          )}
        />

        <GoalCardPacing
          key={'select'}
          title={'Select'}
          current={getTotalInvestment(undefined, 'unNegocio', 'Select')}
          target={getTotalNetBudgetInvestment(undefined, 'unNegocio', 'Select')}
          percentage={getBudgetConsumedPercentage(
            getTotalInvestment(undefined, 'unNegocio', 'Select'),
            getTotalNetBudgetInvestment(undefined, 'unNegocio', 'Select'),
          )}
          description={getDescription(
            getTotalInvestment(undefined, 'unNegocio', 'Select'),
            getTotalNetBudgetInvestment(undefined, 'unNegocio', 'Select'),
            getProjection(getTotalInvestment(undefined, 'unNegocio', 'Select')),
          )}
          descriptionType={getStatus(
            getTotalInvestment(undefined, 'unNegocio', 'Select'),
            getTotalNetBudgetInvestment(undefined, 'unNegocio', 'Select'),
            getProjection(getTotalInvestment(undefined, 'unNegocio', 'Select')),
          )}
        />

        <GoalCardPacing
          key={'comitentes'}
          title={'Comitentes'}
          current={getTotalInvestment(undefined, 'unNegocio', 'Comitentes')}
          target={getTotalNetBudgetInvestment(undefined, 'unNegocio', 'Comitentes')}
          percentage={getBudgetConsumedPercentage(
            getTotalInvestment(undefined, 'unNegocio', 'Comitentes'),
            getTotalNetBudgetInvestment(undefined, 'unNegocio', 'Comitentes'),
          )}
          description={getDescription(
            getTotalInvestment(undefined, 'unNegocio', 'Comitentes'),
            getTotalNetBudgetInvestment(undefined, 'unNegocio', 'Comitentes'),
            getProjection(getTotalInvestment(undefined, 'unNegocio', 'Comitentes')),
          )}
          descriptionType={getStatus(
            getTotalInvestment(undefined, 'unNegocio', 'Comitentes'),
            getTotalNetBudgetInvestment(undefined, 'unNegocio', 'Comitentes'),
            getProjection(getTotalInvestment(undefined, 'unNegocio', 'Comitentes')),
          )}
        />
      </div>

      <SectionTitle>Verba Extra</SectionTitle>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8'>
        <GoalCardPacing
          key={'totalVerbaExtra'}
          title={'Verba Extra'}
          current={getTotalExtraFunds('investimento')}
          target={getTotalExtraFunds('budgetInvLiquido')}
          percentage={getBudgetConsumedPercentage(
            getTotalExtraFunds('investimento'),
            getTotalExtraFunds('budgetInvLiquido'),
          )}
          description={getDescription(
            getTotalExtraFunds('investimento'),
            getTotalExtraFunds('budgetInvLiquido'),
            getProjection(getTotalExtraFunds('investimento')),
          )}
          descriptionType={getStatus(
            getTotalExtraFunds('investimento'),
            getTotalExtraFunds('budgetInvLiquido'),
            getProjection(getTotalExtraFunds('investimento')),
          )}
        />

        <GoalCardPacing
          key={'totalVerbaExtraMetaAds'}
          title={'Verba Extra Meta Ads'}
          current={getTotalExtraFunds('investimento', 'plataforma', 'Meta')}
          target={getTotalExtraFunds('budgetInvLiquido', 'plataforma', 'Meta')}
          percentage={getBudgetConsumedPercentage(
            getTotalExtraFunds('investimento', 'plataforma', 'Meta'),
            getTotalExtraFunds('budgetInvLiquido', 'plataforma', 'Meta'),
          )}
          description={getDescription(
            getTotalExtraFunds('investimento', 'plataforma', 'Meta'),
            getTotalExtraFunds('budgetInvLiquido', 'plataforma', 'Meta'),
            getProjection(getTotalExtraFunds('investimento', 'plataforma', 'Meta')),
          )}
          descriptionType={getStatus(
            getTotalExtraFunds('investimento', 'plataforma', 'Meta'),
            getTotalExtraFunds('budgetInvLiquido', 'plataforma', 'Meta'),
            getProjection(getTotalExtraFunds('investimento', 'plataforma', 'Meta')),
          )}
        />

        <GoalCardPacing
          key={'totalVerbaExtraGoogleAds'}
          title={'Verba Extra Google Ads'}
          current={getTotalExtraFunds('investimento', 'plataforma', 'Google Ads')}
          target={getTotalExtraFunds('budgetInvLiquido', 'plataforma', 'Google Ads')}
          percentage={getBudgetConsumedPercentage(
            getTotalExtraFunds('investimento', 'plataforma', 'Google Ads'),
            getTotalExtraFunds('budgetInvLiquido', 'plataforma', 'Google Ads'),
          )}
          description={getDescription(
            getTotalExtraFunds('investimento', 'plataforma', 'Google Ads'),
            getTotalExtraFunds('budgetInvLiquido', 'plataforma', 'Google Ads'),
            getProjection(getTotalExtraFunds('investimento', 'plataforma', 'Google Ads')),
          )}
          descriptionType={getStatus(
            getTotalExtraFunds('investimento', 'plataforma', 'Google Ads'),
            getTotalExtraFunds('budgetInvLiquido', 'plataforma', 'Google Ads'),
            getProjection(getTotalExtraFunds('investimento', 'plataforma', 'Google Ads')),
          )}
        />
      </div>

      <SectionTitle>Controle Financeiro - Mês Atual</SectionTitle>
      <TablePancing tableData={getTableData({ month: new Date().getMonth() + 1 })} />
    </>
  );
};
export default Pacing;
