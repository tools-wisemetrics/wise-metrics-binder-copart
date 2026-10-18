import { DashboardFilters } from '@/lib/data/types';
import rawSnapshot from '../lib/data/raw-snapshot.json';
import { NewVisaoGeralMidia } from '@/lib/data/raw-data';

export const getPaidMediaEventsOK = async (filters: DashboardFilters): Promise<NewVisaoGeralMidia[]> => {
  const { start, end } = filters.dateRange;
  const rows = (rawSnapshot.new_visao_geral_midias ?? []) as NewVisaoGeralMidia[];

  return rows.filter((row) => row.date_start >= start && row.date_end <= end);
};
