/** Dynamic currency formatter, shared by every overview component. */
export function formatCurrency(value: number, currencyCode: string = "KWD") {
  return new Intl.NumberFormat("en-KW", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value)
}

/** Compact number formatter for axis ticks etc. — 12500 -> "12.5k" */
export function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

/** Relative time for the live activity feed — "just now", "3m ago", "2h ago" */
export function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffSec = Math.round(diffMs / 1000)

  if (diffSec < 10) return "just now"
  if (diffSec < 60) return `${diffSec}s ago`

  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`

  const diffDay = Math.round(diffHr / 24)
  return `${diffDay}d ago`
}
