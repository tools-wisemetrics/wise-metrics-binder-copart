'use client';

import { PageContent, SectionTitle } from '@/components/layout/page-header';
import { GoalCardPacing } from '@/components/cards/goal-card-pacing';
import { InfoTip } from '@/components/layout/info-tip';
import { Database, ShieldCheck } from 'lucide-react';

import { usePacing } from '@/hooks/usePacing';
import { useEffect } from 'react';
import { TablePancing } from '../tables/tablePancing';
import { GoalTableCardPacing } from '../cards/goal-table-card-pacing';

const Pacing = () => {
  const {
    setMonth,
    setMonthTotalDays,
    setMonthDaysElapsed,
    getAveragePacing,
    getProjection,
    getBudgetConsumedPercentage,
    getStatus,
    getDescription,
    getTableData,
    getTotalExtraFunds,
    getTotal,
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

  const tableBusinessLeilao = [
    {
      key: 'leilao',
      title: 'Total',
      current: getTotal('investimento', undefined, [{ type: 'unNegocio', value: 'Leilão' }]),
      target: getTotal('budgetInvLiquido', undefined, [{ type: 'unNegocio', value: 'Leilão' }]),
      percentage: getBudgetConsumedPercentage(
        getTotal('investimento', undefined, [{ type: 'unNegocio', value: 'Leilão' }]),
        getTotal('budgetInvLiquido', undefined, [{ type: 'unNegocio', value: 'Leilão' }]),
      ),
      description: getDescription(
        getTotal('investimento', undefined, [{ type: 'unNegocio', value: 'Leilão' }]),
        getTotal('budgetInvLiquido', undefined, [{ type: 'unNegocio', value: 'Leilão' }]),
        getProjection(getTotal('investimento', undefined, [{ type: 'unNegocio', value: 'Leilão' }])),
      ),
      descriptionType: getStatus(
        getTotal('investimento', undefined, [{ type: 'unNegocio', value: 'Leilão' }]),
        getTotal('budgetInvLiquido', undefined, [{ type: 'unNegocio', value: 'Leilão' }]),
        getProjection(getTotal('investimento', undefined, [{ type: 'unNegocio', value: 'Leilão' }])),
      ),
    },
    {
      key: 'leilaoMeta',
      title: 'Leilão no Meta',
      current: getTotal('investimento', undefined, [
        { type: 'unNegocio', value: 'Leilão' },
        { type: 'plataforma', value: 'Meta' },
      ]),
      target: getTotal('budgetInvLiquido', undefined, [
        { type: 'unNegocio', value: 'Leilão' },
        { type: 'plataforma', value: 'Meta' },
      ]),
      percentage: getBudgetConsumedPercentage(
        getTotal('investimento', undefined, [
          { type: 'unNegocio', value: 'Leilão' },
          { type: 'plataforma', value: 'Meta' },
        ]),
        getTotal('budgetInvLiquido', undefined, [
          { type: 'unNegocio', value: 'Leilão' },
          { type: 'plataforma', value: 'Meta' },
        ]),
      ),
      description: getDescription(
        getTotal('investimento', undefined, [
          { type: 'unNegocio', value: 'Leilão' },
          { type: 'plataforma', value: 'Meta' },
        ]),
        getTotal('budgetInvLiquido', undefined, [
          { type: 'unNegocio', value: 'Leilão' },
          { type: 'plataforma', value: 'Meta' },
        ]),
        getProjection(
          getTotal('investimento', undefined, [
            { type: 'unNegocio', value: 'Leilão' },
            { type: 'plataforma', value: 'Meta' },
          ]),
        ),
      ),
      descriptionType: getStatus(
        getTotal('investimento', undefined, [
          { type: 'unNegocio', value: 'Leilão' },
          { type: 'plataforma', value: 'Meta' },
        ]),
        getTotal('budgetInvLiquido', undefined, [
          { type: 'unNegocio', value: 'Leilão' },
          { type: 'plataforma', value: 'Meta' },
        ]),
        getProjection(
          getTotal('investimento', undefined, [
            { type: 'unNegocio', value: 'Leilão' },
            { type: 'plataforma', value: 'Meta' },
          ]),
        ),
      ),
    },
    {
      key: 'leilaoGoogleAds',
      title: 'Leilão no Google Ads',
      current: getTotal('investimento', undefined, [
        { type: 'unNegocio', value: 'Leilão' },
        { type: 'plataforma', value: 'Google Ads' },
      ]),
      target: getTotal('budgetInvLiquido', undefined, [
        { type: 'unNegocio', value: 'Leilão' },
        { type: 'plataforma', value: 'Google Ads' },
      ]),
      percentage: getBudgetConsumedPercentage(
        getTotal('investimento', undefined, [
          { type: 'unNegocio', value: 'Leilão' },
          { type: 'plataforma', value: 'Google Ads' },
        ]),
        getTotal('budgetInvLiquido', undefined, [
          { type: 'unNegocio', value: 'Leilão' },
          { type: 'plataforma', value: 'Google Ads' },
        ]),
      ),
      description: getDescription(
        getTotal('investimento', undefined, [
          { type: 'unNegocio', value: 'Leilão' },
          { type: 'plataforma', value: 'Google Ads' },
        ]),
        getTotal('budgetInvLiquido', undefined, [
          { type: 'unNegocio', value: 'Leilão' },
          { type: 'plataforma', value: 'Google Ads' },
        ]),
        getProjection(
          getTotal('investimento', undefined, [
            { type: 'unNegocio', value: 'Leilão' },
            { type: 'plataforma', value: 'Google Ads' },
          ]),
        ),
      ),
      descriptionType: getStatus(
        getTotal('investimento', undefined, [
          { type: 'unNegocio', value: 'Leilão' },
          { type: 'plataforma', value: 'Google Ads' },
        ]),
        getTotal('budgetInvLiquido', undefined, [
          { type: 'unNegocio', value: 'Leilão' },
          { type: 'plataforma', value: 'Google Ads' },
        ]),
        getProjection(
          getTotal('investimento', undefined, [
            { type: 'unNegocio', value: 'Leilão' },
            { type: 'plataforma', value: 'Google Ads' },
          ]),
        ),
      ),
    },
  ];

  const tableBusinessSelect = [
    {
      key: 'select',
      title: 'Total',
      current: getTotal('investimento', undefined, [{ type: 'unNegocio', value: 'Select' }]),
      target: getTotal('budgetInvLiquido', undefined, [{ type: 'unNegocio', value: 'Select' }]),
      percentage: getBudgetConsumedPercentage(
        getTotal('investimento', undefined, [{ type: 'unNegocio', value: 'Select' }]),
        getTotal('budgetInvLiquido', undefined, [{ type: 'unNegocio', value: 'Select' }]),
      ),
      description: getDescription(
        getTotal('investimento', undefined, [{ type: 'unNegocio', value: 'Select' }]),
        getTotal('budgetInvLiquido', undefined, [{ type: 'unNegocio', value: 'Select' }]),
        getProjection(getTotal('investimento', undefined, [{ type: 'unNegocio', value: 'Select' }])),
      ),
      descriptionType: getStatus(
        getTotal('investimento', undefined, [{ type: 'unNegocio', value: 'Select' }]),
        getTotal('budgetInvLiquido', undefined, [{ type: 'unNegocio', value: 'Select' }]),
        getProjection(getTotal('investimento', undefined, [{ type: 'unNegocio', value: 'Select' }])),
      ),
    },
    {
      key: 'selectMeta',
      title: 'Select no Meta',
      current: getTotal('investimento', undefined, [
        { type: 'unNegocio', value: 'Select' },
        { type: 'plataforma', value: 'Meta' },
      ]),
      target: getTotal('budgetInvLiquido', undefined, [
        { type: 'unNegocio', value: 'Select' },
        { type: 'plataforma', value: 'Meta' },
      ]),
      percentage: getBudgetConsumedPercentage(
        getTotal('investimento', undefined, [
          { type: 'unNegocio', value: 'Select' },
          { type: 'plataforma', value: 'Meta' },
        ]),
        getTotal('budgetInvLiquido', undefined, [
          { type: 'unNegocio', value: 'Select' },
          { type: 'plataforma', value: 'Meta' },
        ]),
      ),
      description: getDescription(
        getTotal('investimento', undefined, [
          { type: 'unNegocio', value: 'Select' },
          { type: 'plataforma', value: 'Meta' },
        ]),
        getTotal('budgetInvLiquido', undefined, [
          { type: 'unNegocio', value: 'Select' },
          { type: 'plataforma', value: 'Meta' },
        ]),
        getProjection(
          getTotal('investimento', undefined, [
            { type: 'unNegocio', value: 'Select' },
            { type: 'plataforma', value: 'Meta' },
          ]),
        ),
      ),
      descriptionType: getStatus(
        getTotal('investimento', undefined, [
          { type: 'unNegocio', value: 'Select' },
          { type: 'plataforma', value: 'Meta' },
        ]),
        getTotal('budgetInvLiquido', undefined, [
          { type: 'unNegocio', value: 'Select' },
          { type: 'plataforma', value: 'Meta' },
        ]),
        getProjection(
          getTotal('investimento', undefined, [
            { type: 'unNegocio', value: 'Select' },
            { type: 'plataforma', value: 'Meta' },
          ]),
        ),
      ),
    },
    {
      key: 'selectGoogleAds',
      title: 'Select no Google Ads',
      current: getTotal('investimento', undefined, [
        { type: 'unNegocio', value: 'Select' },
        { type: 'plataforma', value: 'Google Ads' },
      ]),
      target: getTotal('budgetInvLiquido', undefined, [
        { type: 'unNegocio', value: 'Select' },
        { type: 'plataforma', value: 'Google Ads' },
      ]),
      percentage: getBudgetConsumedPercentage(
        getTotal('investimento', undefined, [
          { type: 'unNegocio', value: 'Select' },
          { type: 'plataforma', value: 'Google Ads' },
        ]),
        getTotal('budgetInvLiquido', undefined, [
          { type: 'unNegocio', value: 'Select' },
          { type: 'plataforma', value: 'Google Ads' },
        ]),
      ),
      description: getDescription(
        getTotal('investimento', undefined, [
          { type: 'unNegocio', value: 'Select' },
          { type: 'plataforma', value: 'Google Ads' },
        ]),
        getTotal('budgetInvLiquido', undefined, [
          { type: 'unNegocio', value: 'Select' },
          { type: 'plataforma', value: 'Google Ads' },
        ]),
        getProjection(
          getTotal('investimento', undefined, [
            { type: 'unNegocio', value: 'Select' },
            { type: 'plataforma', value: 'Google Ads' },
          ]),
        ),
      ),
      descriptionType: getStatus(
        getTotal('investimento', undefined, [
          { type: 'unNegocio', value: 'Select' },
          { type: 'plataforma', value: 'Google Ads' },
        ]),
        getTotal('budgetInvLiquido', undefined, [
          { type: 'unNegocio', value: 'Select' },
          { type: 'plataforma', value: 'Google Ads' },
        ]),
        getProjection(
          getTotal('investimento', undefined, [
            { type: 'unNegocio', value: 'Select' },
            { type: 'plataforma', value: 'Google Ads' },
          ]),
        ),
      ),
    },
  ];

  return (
    <>
      <SectionTitle>Geral de Mídia</SectionTitle>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8'>
        <GoalCardPacing
          key={'all'}
          title={'Todas'}
          current={getTotal('investimento')}
          target={getTotal('budgetInvLiquido')}
          percentage={getBudgetConsumedPercentage(getTotal('investimento'), getTotal('budgetInvLiquido'))}
          description={getDescription(
            getTotal('investimento'),
            getTotal('budgetInvLiquido'),
            getProjection(getTotal('investimento')),
          )}
          descriptionType={getStatus(
            getTotal('investimento'),
            getTotal('budgetInvLiquido'),
            getProjection(getTotal('investimento')),
          )}
        />
      </div>

      <SectionTitle>Por Plataforma</SectionTitle>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8'>
        <GoalCardPacing
          key={'meta'}
          title={'Meta'}
          current={getTotal('investimento', undefined, [{ type: 'plataforma', value: 'Meta' }])}
          target={getTotal('budgetInvLiquido', undefined, [{ type: 'plataforma', value: 'Meta' }])}
          percentage={getBudgetConsumedPercentage(
            getTotal('investimento', undefined, [{ type: 'plataforma', value: 'Meta' }]),
            getTotal('budgetInvLiquido', undefined, [{ type: 'plataforma', value: 'Meta' }]),
          )}
          description={getDescription(
            getTotal('investimento', undefined, [{ type: 'plataforma', value: 'Meta' }]),
            getTotal('budgetInvLiquido', undefined, [{ type: 'plataforma', value: 'Meta' }]),
            getProjection(getTotal('investimento', undefined, [{ type: 'plataforma', value: 'Meta' }])),
          )}
          descriptionType={getStatus(
            getTotal('investimento', undefined, [{ type: 'plataforma', value: 'Meta' }]),
            getTotal('budgetInvLiquido', undefined, [{ type: 'plataforma', value: 'Meta' }]),
            getProjection(getTotal('investimento', undefined, [{ type: 'plataforma', value: 'Meta' }])),
          )}
        />

        <GoalCardPacing
          key={'google-ads'}
          title={'Google Ads'}
          current={getTotal('investimento', undefined, [{ type: 'plataforma', value: 'Google Ads' }])}
          target={getTotal('budgetInvLiquido', undefined, [{ type: 'plataforma', value: 'Google Ads' }])}
          percentage={getBudgetConsumedPercentage(
            getTotal('investimento', undefined, [{ type: 'plataforma', value: 'Google Ads' }]),
            getTotal('budgetInvLiquido', undefined, [{ type: 'plataforma', value: 'Google Ads' }]),
          )}
          description={getDescription(
            getTotal('investimento', undefined, [{ type: 'plataforma', value: 'Google Ads' }]),
            getTotal('budgetInvLiquido', undefined, [{ type: 'plataforma', value: 'Google Ads' }]),
            getProjection(getTotal('investimento', undefined, [{ type: 'plataforma', value: 'Google Ads' }])),
          )}
          descriptionType={getStatus(
            getTotal('investimento', undefined, [{ type: 'plataforma', value: 'Google Ads' }]),
            getTotal('budgetInvLiquido', undefined, [{ type: 'plataforma', value: 'Google Ads' }]),
            getProjection(getTotal('investimento', undefined, [{ type: 'plataforma', value: 'Google Ads' }])),
          )}
        />
      </div>

      <SectionTitle>Unidade de Negócio</SectionTitle>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 mt-8'>
        <div>
          <h3 className='font-semibold mb-2 w-fit ml-1'>Leilão</h3>
          <GoalTableCardPacing items={tableBusinessLeilao} />
        </div>
        <div>
          <h3 className='font-semibold mb-2 w-fit ml-1'>Select</h3>
          <GoalTableCardPacing items={tableBusinessSelect} />
        </div>
      </div>

      <SectionTitle>Controle Financeiro - Mês Atual</SectionTitle>
      <TablePancing tableData={getTableData({ month: new Date().getMonth() + 1 })} />
    </>
  );
};
export default Pacing;
