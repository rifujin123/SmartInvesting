const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatNumber(value: number | string | null | undefined): string {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return "0";
  return formatter.format(num);
}

export function formatCurrency(value: number | string | null | undefined): string {
  return `${formatNumber(value)} VND`;
}
