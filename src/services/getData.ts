import { DashboardFilters } from '@/lib/data/types';
import { rawSnapshot, NewVisaoGeralMidia } from '@/lib/data/raw-data';

export const getPaidMediaEventsOK = async (filters: DashboardFilters): Promise<NewVisaoGeralMidia[]> => {
  const { start, end } = filters.dateRange;
  const rows = rawSnapshot.new_visao_geral_midias ?? [];

  return rows.filter((row) => row.date_start >= start && row.date_end <= end);
};
