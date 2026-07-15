export type TrendDirection = "up" | "down" | "neutral"

export interface MetricSummary {
  current: number
  previous: number
  changePercent: number
  direction: TrendDirection
}

export interface ChartDataPoint {
  date: string
  revenue: number
  orders: number
  aov: number
}

export interface OrderStatusDistribution {
  pending: number
  confirmed: number
  processing: number
  packed: number
  shipped: number
  delivered: number
  cancelled: number
  returned: number
}

export interface PaymentVerificationStats {
  awaitingVerification: number
  recentlyVerified: number
  verificationQueue: Array<{
    id: string
    orderNumber: string
    customerName: string
    amount: number
    date: string
  }>
}

export interface InventoryAlertProduct {
  id: string
  productId: string
  productName: string
  sku: string
  stock: number
  status: "low_stock" | "out_of_stock"
}

export interface TopSellingProduct {
  id: string
  name: string
  sku: string
  unitsSold: number
  revenue: number
  image?: string
}

export interface TopCustomer {
  id: string
  name: string
  email: string
  totalOrders: number
  totalSpent: number
  lastPurchaseDate: string
}

export interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  amount: number
  paymentStatus: string
  status: string
  createdAt: string
}

export interface SummaryKPIs {
  revenue: MetricSummary
  orders: MetricSummary
  aov: MetricSummary
  returnRate: MetricSummary
  pendingOrders: number
  lowStockProducts: number
}

export interface TimeOfDayStat {
  name: "Morning" | "Afternoon" | "Evening" | "Night"
  value: number
}

export interface CategoryStat {
  name: string
  value: number
}

export interface DashboardOverviewResponse {
  summary: SummaryKPIs
  mainAnalytics: ChartDataPoint[]
  operations: OrderStatusDistribution
  paymentVerification: PaymentVerificationStats
  inventory: InventoryAlertProduct[]
  topProducts: TopSellingProduct[]
  topCustomers: TopCustomer[]
  recentOrders: RecentOrder[]
  timeOfDayStats: TimeOfDayStat[]
  categoryStats: CategoryStat[]
  lastUpdatedAt: string
}

export type DashboardRange = "today" | "7d" | "30d" | "12m" | "custom"
