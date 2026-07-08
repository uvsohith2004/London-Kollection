

export type TrendDirection = "up" | "down"

export interface HistoryPoint {
  date: string
  value: number
  previousValue: number
}


export interface MetricSummary {
  current: number
  trend: number
  history: HistoryPoint[]
}

export interface RevenuePoint {
  month: string
  revenue: number
  target: number
}

export interface CategorySplitItem {
  name: string
  value: number // percentage share, all items should sum to ~100
}

export interface RegionPerformance {
  region: string
  sales: number
  orders: number
  growth: number // signed percentage vs prior period
}

/** Which underlying signal a product insight is about. */
export type InsightMetric = "sales" | "views" | "conversion" | "return_rate" | "stock"

export type InsightSeverity = "critical" | "warning" | "positive"

/**
 * A single "why is this happening" finding surfaced by the analytics pipeline —
 * e.g. a product whose sales dropped, paired with the likely contributing signals.
 */
export interface ProductInsight {
  id: string
  productId: string
  productName: string
  productImage?: string
  sku: string
  category: string
  metric: InsightMetric
  currentValue: number
  previousValue: number
  changePercent: number // signed
  direction: TrendDirection
  severity: InsightSeverity
  /** Human-readable contributing factors, e.g. "Stock down 42% this week", "Price raised 8%" */
  signals: string[]
  detectedAt: string // ISO timestamp
}

export type AuditEventType =
  | "view"
  | "add_to_cart"
  | "purchase"
  | "wishlist"
  | "search"
  | "checkout_abandon"
  | "review"

/**
 * A single row in the live activity / audit feed — one real customer action.
 * Customer identity should already be pre-anonymized/labelled server-side.
 */
export interface AuditEvent {
  id: string
  type: AuditEventType
  timestamp: string // ISO
  customerLabel: string // e.g. "Customer #4821"
  productId?: string
  productName?: string
  productImage?: string
  value?: number // order/cart value in KWD, when relevant
  query?: string // populated for `search` events
  region?: string
}

export type DashboardDetailKey = "volume" | "aov" | "returning" | "returns"

/** Full response shape for the overview dashboard. */
export interface DashboardOverviewResponse {
  grossVolume: MetricSummary
  aov: MetricSummary
  /** Share of orders placed by customers who have ordered before. Replaces the old VIP metric. */
  returningCustomerRate: MetricSummary
  returnRate: MetricSummary
  revenueChart: RevenuePoint[]
  categorySplit: CategorySplitItem[]
  topRegions: RegionPerformance[]
  productInsights: ProductInsight[]
  liveActivity: AuditEvent[]
  lastUpdatedAt: string // ISO timestamp of last data refresh, drives the "live" indicator
}

export type ExportFormat = "csv" | "pdf"
export type DashboardRange = "7d" | "30d" | "90d" | "ytd"

export interface ExportReportPayload {
  format: ExportFormat
  range?: DashboardRange
  /** Present when exporting from a drill-down sheet rather than the whole dashboard. */
  detailKey?: DashboardDetailKey
}
