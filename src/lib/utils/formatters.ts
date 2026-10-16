// ============================================================================
// Copart Brasil — Formatters
// Brazilian locale formatting for currency, numbers, percentages
// ============================================================================

/**
 * Format number as Brazilian Real (R$)
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format number with Brazilian locale (dots as thousand separators)
 */
export function formatNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(0)}k`;
  }
  return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Format number with full precision (no abbreviation)
 */
export function formatNumberFull(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals).replace('.', ',')}%`;
}

/**
 * Format delta (change) with sign and percentage
 */
export function formatDelta(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2).replace('.', ',')}%`;
}

/**
 * Determine delta type based on metric semantics
 * For some metrics, decrease is good (e.g., bounce rate, cost)
 */
export function getDeltaType(
  value: number,
  invertedMetric: boolean = false
): 'good' | 'bad' | 'neutral' {
  if (value === 0) return 'neutral';
  if (invertedMetric) {
    return value < 0 ? 'good' : 'bad';
  }
  return value > 0 ? 'good' : 'bad';
}

/**
 * Format a compact metric value for KPI cards
 */
export function formatMetricValue(value: number, type: 'number' | 'currency' | 'percentage'): string {
  switch (type) {
    case 'currency':
      return formatBRL(value);
    case 'percentage':
      return formatPercentage(value);
    case 'number':
    default:
      return formatNumber(value);
  }
}
