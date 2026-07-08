export interface MetricHistory {
  date: string
  value: number
  change: number
}

export interface MetricTrend {
  current: number
  previous: number
  trend: "up" | "down" | "none"
}

export interface Category {
  name: string
  percentage: number
  revenue: number
}

export interface VipCustomer {
  id: string
  name: string
  purchaseCount: number
  totalSpent: number
}

export interface Return {
  id: string
  orderId: string
  reason: string
  date: string
}

export interface DashboardData {
  grossVolume: {
    current: number
    trend: MetricTrend
    history: MetricHistory[]
  }
  aov: {
    current: number
    trend: MetricTrend
    history: MetricHistory[]
  }
  vipConversion: {
    current: number
    trend: MetricTrend
    history: MetricHistory[]
  }
  returnRate: {
    current: number
    trend: MetricTrend
    history: MetricHistory[]
  }
  revenueChart: {
    month: string
    revenue: number
  }[]
  categorySplit: Category[]
  topCategories: Category[]
  VipCustomers: VipCustomer[]
  recentReturns: Return[]
}
