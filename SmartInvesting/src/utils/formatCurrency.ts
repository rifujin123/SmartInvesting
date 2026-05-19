/**
 * Format a number as VND currency.
 * Compact: 1.500.000₫ → "1,5 tr₫"   Standard: "1.500.000 ₫"
 */
export const formatVnd = (value: number, compact = false): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value);
};

/** "1.500.000" */
export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('vi-VN').format(value);

/** "+1.500.000" or "-1.500.000" */
export const formatSignedNumber = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatNumber(value)}`;
};

/** "+12.5%" or "-3.2%" */
export const formatPercent = (value: number, decimals = 1): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

/** "15/05/2026" */
export const formatDate = (date: string | Date): string =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    typeof date === 'string' ? new Date(date) : date,
  );

/** "15/05" */
export const formatShortDate = (date: string | Date): string =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(
    typeof date === 'string' ? new Date(date) : date,
  );

/** "Tháng 5, 2026" */
export const formatMonthYear = (date: Date = new Date()): string =>
  new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(date);
