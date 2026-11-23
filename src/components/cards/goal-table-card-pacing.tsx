import { cn } from '@/lib/utils';

type TGoalTableCardPacingProps = {
  key: string;
  title: string;
  current: number;
  target: number;
  percentage: number;
  description: string;
  descriptionType: string;
};

export function GoalTableCardPacing({ items }: { items: Array<TGoalTableCardPacingProps> }) {
  return (
    <div
      className={cn(
        'bg-white border border-[#dfe6ee] rounded-2xl p-5 flex flex-col gap-8',
        'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0b1f3a]/5 transition-all duration-200',
      )}
    >
      {items.map((item) => (
        <div key={item.key}>
          <p className='text-[11px] uppercase tracking-[0.07em] font-bold text-[#6c7685] mb-2'>
            {item.title}
          </p>

          <div className='flex items-baseline gap-2 mb-3'>
            <span className='text-[32px] font-black text-[#0b1f3a] leading-none tracking-tight'>
              {item.current.toLocaleString('pt-BR')}
            </span>
            <span className='text-lg text-[#6c7685] font-semibold'>
              / {item.target.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className='h-3 bg-[#e9eef5] rounded-full overflow-hidden mb-2'>
            <div
              className='h-full rounded-full transition-all duration-700 ease-out'
              style={{
                width: `${Math.min(item.percentage, 100)}%`,
                background: `linear-gradient(90deg, ${item.descriptionType === 'green' ? '#007342' : item.descriptionType === 'red' ? '#b2162e' : '#fae842'}, ${item.descriptionType === 'green' ? '#007342' : item.descriptionType === 'red' ? '#b2162e' : '#db8400'}cc)`,
              }}
            />
          </div>

          <div className='flex items-center justify-between'>
            <span className='text-sm font-black text-[#0b1f3a]'>{item.percentage.toFixed(1)}% da meta</span>

            <span
              className={cn(
                'flex items-center gap-0.5 text-xs font-bold rounded-full px-2 py-0.5',
                item.descriptionType === 'green' && 'text-[#007342] bg-[#e8f8ef]',
                item.descriptionType === 'red' && 'text-[#b2162e] bg-[#fdecee]',
                item.descriptionType === 'yellow' && 'text-[#db8400] bg-[#f0f2f5]',
              )}
            >
              {item.description}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
