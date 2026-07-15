/**
 * Server-side price formatter for base currency (KWD).
 * Used in server components where React hooks aren't available.
 * Orders are always stored/displayed in the base currency.
 */
export function formatBasePrice(amount: number | string, currency: string = 'KWD'): string {
  const num = Number(amount)
  if (isNaN(num)) return `${currency} 0.000`
  
  const decimals = ['KWD', 'BHD', 'OMR'].includes(currency) ? 3 : 2
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  } catch {
    return `${num.toFixed(decimals)} ${currency}`
  }
}
