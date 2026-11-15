type TMediaBudgetRow = {
  unidade: string;
  meta: {
    entrada: number;
    verbaLiquida: number;
    saida: number;
    falta: number;
  };
  google: {
    entrada: number;
    verbaLiquida: number;
    saida: number;
    falta: number;
  };
};

type TTablePancingProps = {
  tableData: Array<TMediaBudgetRow>;
};

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function MoneyCell({
  value,
  total,
  highlight = false,
}: {
  value: number;
  total: number;
  highlight?: boolean;
}) {
  const color =
    highlight && value !== null && total !== undefined
      ? value < 0
        ? 'font-bold text-[#b2162e]' // Vermelho: zero ou negativo
        : value <= total * 0.1
          ? 'font-bold text-[#db8400]' // Amarelo: >= 90% do total
          : 'font-bold text-[#007342]' // Verde: demais casos (entre 0 e 90%)
      : 'text-[#0b1f3a]';

  return (
    <td className={`whitespace-nowrap px-4 py-3 text-right ${color}`}>
      {value === null ? '—' : currency.format(value)}
    </td>
  );
}

export function TablePancing({ tableData }: TTablePancingProps) {
  const headerClass =
    'whitespace-nowrap px-4 py-3 text-right text-[11px] font-bold uppercase tracking-[0.07em] text-[#6c7685]';

  const rows = tableData.filter((row) => row.unidade !== 'Total');

  const totals = rows.reduce(
    (acc, row) => ({
      meta: {
        entrada: acc.meta.entrada + (row.meta.entrada ?? 0),
        verbaLiquida: acc.meta.verbaLiquida + (row.meta.verbaLiquida ?? 0),
        saida: acc.meta.saida + (row.meta.saida ?? 0),
        falta: acc.meta.falta + (row.meta.falta ?? 0),
      },
      google: {
        entrada: acc.google.entrada + (row.google.entrada ?? 0),
        verbaLiquida: acc.google.verbaLiquida + (row.google.verbaLiquida ?? 0),
        saida: acc.google.saida + (row.google.saida ?? 0),
        falta: acc.google.falta + (row.google.falta ?? 0),
      },
    }),
    {
      meta: { entrada: 0, verbaLiquida: 0, saida: 0, falta: 0 },
      google: { entrada: 0, verbaLiquida: 0, saida: 0, falta: 0 },
    },
  );

  return (
    <div className='rounded-2xl border border-[#dfe6ee] bg-white p-5'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[1000px] border-collapse text-sm'>
          <thead>
            <tr className='border-b border-[#dfe6ee]'>
              <th
                rowSpan={2}
                scope='col'
                className='px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.07em] text-[#6c7685]'
              >
                UN
              </th>

              <th
                colSpan={4}
                scope='colgroup'
                className='px-4 py-3 text-center text-sm font-black text-[#0b1f3a]'
              >
                Meta Ads
              </th>

              <th
                colSpan={3}
                scope='colgroup'
                className='px-4 py-3 text-center text-sm font-black text-[#0b1f3a]'
              >
                Google Ads
              </th>
            </tr>

            <tr className='border-b border-[#dfe6ee] bg-[#f2f6fb]'>
              <th scope='col' className={headerClass}>
                Entrada (boleto)
              </th>
              <th scope='col' className={headerClass}>
                Verba líquida
              </th>
              <th scope='col' className={headerClass}>
                Saída (plataforma)
              </th>
              <th scope='col' className={headerClass}>
                O que falta?
              </th>
              <th scope='col' className={headerClass}>
                Entrada (boleto)
              </th>
              <th scope='col' className={headerClass}>
                Verba líquida
              </th>
              <th scope='col' className={headerClass}>
                Saída (plataforma)
              </th>
              <th scope='col' className={headerClass}>
                O que falta?
              </th>
            </tr>
          </thead>

          <tbody>
            {tableData.map((row) => (
              <tr
                key={row.unidade}
                className={`border-b border-[#dfe6ee] last:border-b-0 ${
                  row.unidade === 'Total' ? 'bg-[#f2f6fb] font-black' : ''
                }`}
              >
                <th scope='row' className='whitespace-nowrap px-4 py-3 text-left font-bold text-[#0b1f3a]'>
                  {row.unidade}
                </th>

                <MoneyCell value={row.meta.entrada} total={row.meta.verbaLiquida} />
                <MoneyCell value={row.meta.verbaLiquida} total={row.meta.verbaLiquida} />
                <MoneyCell value={row.meta.saida} total={row.meta.verbaLiquida} />
                <MoneyCell value={row.meta.falta} total={row.meta.verbaLiquida} highlight />

                <MoneyCell value={row.google.entrada} total={row.google.verbaLiquida} />
                <MoneyCell value={row.google.verbaLiquida} total={row.google.verbaLiquida} />
                <MoneyCell value={row.google.saida} total={row.google.verbaLiquida} />
                <MoneyCell value={row.google.falta} total={row.google.verbaLiquida} highlight />
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className='border-t border-[#dfe6ee] bg-[#f2f6fb] font-black'>
              <th scope='row' className='whitespace-nowrap px-4 py-3 text-left font-black text-[#0b1f3a]'>
                Total
              </th>

              <MoneyCell value={totals.meta.entrada} total={totals.meta.verbaLiquida} />
              <MoneyCell value={totals.meta.verbaLiquida} total={totals.meta.verbaLiquida} />
              <MoneyCell value={totals.meta.saida} total={totals.meta.verbaLiquida} />
              <MoneyCell value={totals.meta.falta} total={totals.meta.verbaLiquida} highlight />

              <MoneyCell value={totals.google.entrada} total={totals.google.verbaLiquida} />
              <MoneyCell value={totals.google.verbaLiquida} total={totals.google.verbaLiquida} />
              <MoneyCell value={totals.google.saida} total={totals.google.verbaLiquida} />
              <MoneyCell value={totals.google.falta} total={totals.google.verbaLiquida} highlight />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
