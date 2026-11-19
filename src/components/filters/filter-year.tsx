const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

export function FilterYear({ setYear }: { setYear: (year: number) => void }) {
  return (
    <div className='sticky top-0 z-20 border-b border-[#dfe6ee] bg-white/95 backdrop-blur-md'>
      <div className='px-4 sm:px-8 py-5'>
        <div className='max-w-[1400px] mx-auto flex flex-col gap-3'>
          <div className='flex flex-col lg:flex-row lg:items-end gap-3'>
            <label className='flex flex-col gap-1 text-[10px] uppercase tracking-widest font-bold text-[#6c7685] min-w-[150px]'>
              Período
              <select
                className='h-9 rounded-lg border border-[#dfe6ee] bg-[#f4f7fb] pl-2 pr-20 text-sm font-semibold text-[#0b1f3a]'
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
