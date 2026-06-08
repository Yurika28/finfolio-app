export const formatCurrency = (value: number, currency = 'USD'): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

export const formatLargeNumber = (value: number): string => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9)  return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6)  return `$${(value / 1e6).toFixed(2)}M`
  return formatCurrency(value)
}
