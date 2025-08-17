export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function formatCurrencyCompact(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (num >= 1000000) {
    return `R$ ${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `R$ ${(num / 1000).toFixed(1)}K`;
  }
  return formatCurrency(num);
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^\d.-]/g, "")) || 0;
}
