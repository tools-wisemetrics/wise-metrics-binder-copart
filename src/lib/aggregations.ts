import type { ChannelPerformance, FunnelStage } from "@/lib/data/types";

export function totalChannelPerformance(rows: ChannelPerformance[]): ChannelPerformance {
  const gasto = rows.reduce((sum, row) => sum + row.gasto, 0);
  const entrantes = rows.reduce((sum, row) => sum + row.entrantes, 0);
  const habilitados = rows.reduce((sum, row) => sum + row.habilitados, 0);

  return {
    channel: "TOTAL",
    entrantes,
    habilitados,
    taxa_habilitacao: entrantes === 0 ? 0 : (habilitados / entrantes) * 100,
    custo_por_entrante: entrantes === 0 ? 0 : gasto / entrantes,
    custo_por_habilitado: habilitados === 0 ? 0 : gasto / habilitados,
    gasto,
  };
}

export function isMonotonicFunnel(stages: FunnelStage[]): boolean {
  for (let i = 1; i < stages.length; i += 1) {
    if (stages[i].value > stages[i - 1].value) return false;
  }
  return true;
}

export function assertNoForbiddenCopy(labels: string[], forbidden: readonly string[]): string[] {
  const hits: string[] = [];
  for (const label of labels) {
    for (const term of forbidden) {
      if (label.includes(term)) hits.push(`${label} ⊃ ${term}`);
    }
  }
  return hits;
}
