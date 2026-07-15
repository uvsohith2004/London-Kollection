"use client"

import * as React from "react"
import { Loader2, TrendingUp, TrendingDown, ArrowUpRight, Package, AlertTriangle, User, RefreshCw, ShoppingBag, CreditCard, ChevronRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@workspace/ui/components/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { useDashboardQuery } from "../queries"
import { useFormatCurrency } from "@/lib/format"
import { Link } from "@/i18n/routing"
import { MetricSummary, DashboardRange } from "@workspace/api-contracts"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend } from "recharts"

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "K"
  return num.toString()
}

export function OverviewDashboard() {
  const [range, setRange] = React.useState<DashboardRange>("30d")
  const { data, isLoading, isError } = useDashboardQuery(range)
  const formatCurrency = useFormatCurrency()

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Handle cases where the backend response wasn't flattened by the interceptor
  const _data = data as any
  let payload = _data
  if (_data?.summary) {
    payload = _data
  } else if (_data?.data?.summary) {
    payload = _data.data
  } else if (_data?.data?.data?.summary) {
    payload = _data.data.data
  } else {
    // Backward compatibility for old API shape in production
    const oldShape = _data?.data?.data?.grossVolume ? _data.data.data : (_data?.data?.grossVolume ? _data.data : _data)
    if (oldShape?.grossVolume) {
      payload = {
        summary: {
          revenue: { current: oldShape.grossVolume.current || 0, previous: 0, changePercent: oldShape.grossVolume.trend || 0, direction: oldShape.grossVolume.trend >= 0 ? "up" : "down" },
          orders: { current: oldShape.orders?.current || 0, previous: 0, changePercent: oldShape.orders?.trend || 0, direction: (oldShape.orders?.trend || 0) >= 0 ? "up" : "down" },
          aov: { current: oldShape.aov?.current || 0, previous: 0, changePercent: oldShape.aov?.trend || 0, direction: (oldShape.aov?.trend || 0) >= 0 ? "up" : "down" },
          returnRate: { current: oldShape.returnRate?.current || 0, previous: 0, changePercent: oldShape.returnRate?.trend || 0, direction: (oldShape.returnRate?.trend || 0) >= 0 ? "up" : "down" },
          pendingOrders: 0,
          lowStockProducts: 0
        },
        mainAnalytics: oldShape.revenueChart || [],
        operations: {},
        paymentVerification: { verificationQueue: [] },
        inventory: [],
        topProducts: [],
        topCustomers: [],
        recentOrders: [],
        timeOfDayStats: [],
        categoryStats: [],
        lastUpdatedAt: new Date().toISOString()
      }
    }
  }

  if (isError || !payload || !payload.summary) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive">
          Failed to load dashboard data.
          <pre className="text-xs text-left mt-4 max-w-lg overflow-auto">
            {JSON.stringify({ data, isError }, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  const summary = payload?.summary || {}
  const mainAnalytics = payload?.mainAnalytics || []
  const timeOfDayStats = payload?.timeOfDayStats || []
  const categoryStats = payload?.categoryStats || []
  const operations = payload?.operations || {}
  const paymentVerification = payload?.paymentVerification || { verificationQueue: [] }
  const inventory = payload?.inventory || []
  const topProducts = payload?.topProducts || []
  const topCustomers = payload?.topCustomers || []
  const recentOrders = payload?.recentOrders || []

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 pb-24 font-sans px-4 sm:px-6 lg:px-8 pt-8">
      {/* SECTION 1: Greeting & Summary */}
      <div className="flex flex-col gap-2 border-b border-border/40 pb-6 mb-8">
        <h1 className="text-3xl font-medium font-serif tracking-tight text-foreground" suppressHydrationWarning>{getGreeting()}</h1>
        <p className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-2 text-sm mt-2">
          <span>Overall Business Health is <strong className="text-primary font-medium">Strong</strong></span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500"></span> Systems Operational</span>
          <span className="text-muted-foreground/70" suppressHydrationWarning>Synced at {payload?.lastUpdatedAt ? new Date(payload.lastUpdatedAt).toLocaleTimeString() : "Just now"}</span>
        </p>
      </div>

      {/* SECTION 2: Primary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard title="Revenue" metric={summary?.revenue} isCurrency formatCurrency={formatCurrency} />
        <KpiCard title="Orders" metric={summary?.orders} />
        <KpiCard title="Average Order Value" metric={summary?.aov} isCurrency formatCurrency={formatCurrency} />
        <KpiCard title="Return Rate" metric={summary?.returnRate} suffix="%" invertedTrend />
        
        <Card className="shadow-none border-border/40 rounded-2xl flex flex-col justify-center p-6 bg-card hover:bg-muted/30 transition-colors">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Pending Orders</div>
          <div className="text-3xl font-light tabular-nums tracking-tight">{summary?.pendingOrders || 0}</div>
        </Card>
        
        <Card className="shadow-none border-border/40 rounded-2xl flex flex-col justify-center p-6 bg-card hover:bg-muted/30 transition-colors">
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Low Stock Alerts</div>
          <div className="text-3xl font-light tabular-nums tracking-tight text-destructive">{summary?.lowStockProducts || 0}</div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* SECTION 3: Main Analytics */}
        <Card className="shadow-none border-border/40 rounded-3xl lg:col-span-2 overflow-hidden bg-card">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 px-6 py-5 pb-5">
            <div>
              <CardTitle className="text-sm font-medium tracking-widest uppercase">Performance Analytics</CardTitle>
            </div>
            <Select value={range} onValueChange={(val) => setRange(val as DashboardRange)}>
              <SelectTrigger className="w-[140px] h-9 text-xs rounded-full bg-muted/30 border-transparent hover:bg-muted transition-colors">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="12m">Last 12 Months</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-6 pt-8">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mainAnalytics} margin={{ top: 20, left: 20, right: 20, bottom: 20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(val) => val.split("-").slice(1).join("/")} />
                  <YAxis />
                  <Line type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="orders" stroke="#64748b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Pie Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t border-border/40 pt-8">
              <div className="h-[250px] w-full flex flex-col items-center">
                <h3 className="text-xs font-medium tracking-widest uppercase mb-4 text-muted-foreground">Time of Day</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={timeOfDayStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {timeOfDayStats.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={["#0f172a", "#3b82f6", "#10b981", "#f59e0b"][index % 4]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => [`${value} orders`, ""]} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[250px] w-full flex flex-col items-center">
                <h3 className="text-xs font-medium tracking-widest uppercase mb-4 text-muted-foreground">Top Categories</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryStats.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={["#8b5cf6", "#ec4899", "#f43f5e", "#14b8a6", "#64748b"][index % 5]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => [`${value} units`, ""]} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </CardContent>
        </Card>

        <div className="space-y-8 flex flex-col">
          {/* SECTION 4: Operations */}
          <Card className="shadow-none border-border/40 rounded-3xl bg-card flex-1">
            <CardHeader className="border-b border-border/40 px-6 py-5 pb-5">
              <CardTitle className="text-sm font-medium tracking-widest uppercase flex items-center justify-between">
                Operations
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <OperationStat label="Pending" value={operations?.pending || 0} />
                <OperationStat label="Confirmed" value={operations?.confirmed || 0} />
                <OperationStat label="Processing" value={operations?.processing || 0} />
                <OperationStat label="Packed" value={operations?.packed || 0} />
                <OperationStat label="Shipped" value={operations?.shipped || 0} className="text-primary" />
                <OperationStat label="Delivered" value={operations?.delivered || 0} />
                <OperationStat label="Returned" value={operations?.returned || 0} className="text-orange-500" />
                <OperationStat label="Cancelled" value={operations?.cancelled || 0} className="text-destructive" />
              </div>
            </CardContent>
          </Card>
          
          {/* SECTION 5: Manual Payment Verification */}
          <Card className="shadow-none border-border/40 rounded-3xl bg-card">
            <CardHeader className="border-b border-border/40 px-6 py-5 pb-5">
              <CardTitle className="text-sm font-medium tracking-widest uppercase flex items-center justify-between">
                Verification Queue
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 divide-x divide-border/40 border-b border-border/40">
                <div className="p-4 text-center hover:bg-muted/20 transition-colors cursor-pointer">
                  <div className="text-2xl font-light text-primary">{paymentVerification?.awaitingVerification || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Awaiting</div>
                </div>
                <div className="p-4 text-center hover:bg-muted/20 transition-colors cursor-pointer">
                  <div className="text-2xl font-light">{paymentVerification?.recentlyVerified || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Verified</div>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {paymentVerification?.verificationQueue?.filter(Boolean).slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between group cursor-pointer p-2 rounded-lg hover:bg-muted/40 transition-colors">
                    <div>
                      <div className="text-sm font-medium group-hover:text-primary transition-colors">{item.orderNumber}</div>
                      <div className="text-xs text-muted-foreground">{item.customerName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{formatCurrency(item.amount)}</div>
                      <Badge variant="outline" className="text-[10px] uppercase font-medium mt-0.5 border-orange-500/30 text-orange-600 bg-orange-500/5">Pending</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {/* SECTION 6: Inventory Overview */}
        <Card className="shadow-none border-border/40 rounded-3xl bg-card flex flex-col xl:col-span-1">
          <CardHeader className="border-b border-border/40 px-6 py-5 pb-5">
            <CardTitle className="text-sm font-medium tracking-widest uppercase flex items-center justify-between">
              Inventory Alerts
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {!inventory || inventory.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground m-auto">No inventory alerts.</div>
            ) : (
              <div className="divide-y divide-border/40">
                {inventory.filter(Boolean).slice(0, 6).map((item: any) => (
                  <div key={item.id} className="p-4 px-6 flex items-center justify-between hover:bg-muted/20 transition-colors">
                    <div>
                      <div className="text-sm font-medium line-clamp-1">{item.productName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.sku}</div>
                    </div>
                    <Badge variant="outline" className={cn("shrink-0 ml-4 font-medium uppercase text-[10px] tracking-wider", item.status === "out_of_stock" ? "border-destructive/30 text-destructive bg-destructive/5" : "border-orange-500/30 text-orange-600 bg-orange-500/5")}>
                      {item.stock} in stock
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SECTION 7: Top Selling Products */}
        <Card className="shadow-none border-border/40 rounded-3xl bg-card xl:col-span-2 flex flex-col">
          <CardHeader className="border-b border-border/40 px-6 py-5 pb-5">
            <CardTitle className="text-sm font-medium tracking-widest uppercase flex items-center justify-between">
              Top Selling Products
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="px-6 h-10 text-xs tracking-wider uppercase font-medium">Product</TableHead>
                    <TableHead className="h-10 text-xs tracking-wider uppercase font-medium text-right">Units</TableHead>
                    <TableHead className="px-6 h-10 text-xs tracking-wider uppercase font-medium text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.filter(Boolean).map((product: any) => (
                    <TableRow key={product.id} className="border-border/40 hover:bg-muted/20 transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-muted" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium line-clamp-1">{product.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{product.sku}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4 font-medium text-sm tabular-nums">{product.unitsSold}</TableCell>
                      <TableCell className="px-6 py-4 text-right font-medium text-sm tabular-nums">{formatCurrency(product.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* SECTION 8: Top Customers */}
        <Card className="shadow-none border-border/40 rounded-3xl bg-card">
          <CardHeader className="border-b border-border/40 px-6 py-5 pb-5">
            <CardTitle className="text-sm font-medium tracking-widest uppercase flex items-center justify-between">
              Top Customers
              <User className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="px-6 h-10 text-xs tracking-wider uppercase font-medium">Customer</TableHead>
                    <TableHead className="h-10 text-xs tracking-wider uppercase font-medium text-right">Orders</TableHead>
                    <TableHead className="px-6 h-10 text-xs tracking-wider uppercase font-medium text-right">Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.filter(Boolean).map((customer: any) => (
                    <TableRow key={customer.id} className="border-border/40 hover:bg-muted/20 transition-colors">
                      <TableCell className="px-6 py-4">
                        <div className="text-sm font-medium">{customer.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{customer.email}</div>
                      </TableCell>
                      <TableCell className="text-right py-4 font-medium text-sm tabular-nums">{customer.totalOrders}</TableCell>
                      <TableCell className="px-6 py-4 text-right font-medium text-sm tabular-nums">{formatCurrency(customer.totalSpent)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 9: Recent Orders */}
        <Card className="shadow-none border-border/40 rounded-3xl bg-card">
          <CardHeader className="border-b border-border/40 px-6 py-5 pb-5">
            <CardTitle className="text-sm font-medium tracking-widest uppercase flex items-center justify-between">
              Recent Orders
              <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground px-2 hover:text-foreground">View All</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="px-6 h-10 text-xs tracking-wider uppercase font-medium">Order</TableHead>
                    <TableHead className="h-10 text-xs tracking-wider uppercase font-medium text-right">Status</TableHead>
                    <TableHead className="px-6 h-10 text-xs tracking-wider uppercase font-medium text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.filter(Boolean).slice(0, 5).map((order: any) => (
                    <TableRow key={order.id} className="border-border/40 hover:bg-muted/20 transition-colors cursor-pointer group">
                      <TableCell className="px-6 py-4">
                        <div className="text-sm font-medium group-hover:text-primary transition-colors">{order.orderNumber}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{order.customerName}</div>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <Badge variant="secondary" className="font-medium uppercase tracking-wider text-[10px] bg-muted/50">{order.status}</Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right font-medium text-sm tabular-nums">
                        {formatCurrency(order.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({ title, metric, isCurrency, formatCurrency, suffix = "", invertedTrend = false }: { title: string, metric: MetricSummary, isCurrency?: boolean, formatCurrency?: any, suffix?: string, invertedTrend?: boolean }) {
  if (!metric) {
    return (
      <Card className="shadow-none border-border/40 rounded-2xl flex flex-col p-6 bg-card hover:bg-muted/30 transition-colors group">
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4 group-hover:text-foreground transition-colors">{title}</div>
        <div className="flex items-end justify-between mt-auto">
          <div className="text-3xl font-light tabular-nums tracking-tight text-muted-foreground">-</div>
        </div>
      </Card>
    )
  }

  const isPositive = metric.direction === "up"
  const showGoodTrend = invertedTrend ? !isPositive : isPositive
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card className="shadow-none border-border/40 rounded-2xl flex flex-col p-6 bg-card hover:bg-muted/30 transition-colors group">
      <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4 group-hover:text-foreground transition-colors">{title}</div>
      <div className="flex items-end justify-between mt-auto">
        <div className="text-3xl font-light tabular-nums tracking-tight">
          {isCurrency ? formatCurrency(metric.current) : metric.current}{suffix}
        </div>
        <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md", showGoodTrend ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive")}>
          <TrendIcon className="h-3 w-3" />
          {Math.abs(metric.changePercent)}%
        </div>
      </div>
    </Card>
  )
}

function OperationStat({ label, value, className = "" }: { label: string, value: number, className?: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/40 transition-colors cursor-pointer group">
      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
      <span className={cn("text-lg font-medium tabular-nums", className || "text-foreground")}>{value}</span>
    </div>
  )
}
