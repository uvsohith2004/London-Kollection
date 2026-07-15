import db from "@/db"
import { user, order, orderItem, product, productVariant, category } from "@/db/schemas"
import { count, sql, eq, desc, lte, and, sum, gte, lt, inArray } from "drizzle-orm"

export class DashboardService {
  private getDateRangeBounds(range: string) {
    const now = new Date()
    let currentStart = new Date(now)
    let previousStart = new Date(now)
    let days = 30
    let type: "hour" | "day" | "month" = "day"

    switch (range) {
      case "today":
        currentStart.setDate(now.getDate() - 1)
        previousStart.setDate(now.getDate() - 2)
        days = 1
        type = "hour"
        break
      case "7d":
        currentStart.setDate(now.getDate() - 7)
        previousStart.setDate(now.getDate() - 14)
        days = 7
        type = "day"
        break
      case "12m":
        currentStart.setFullYear(now.getFullYear() - 1)
        previousStart.setFullYear(now.getFullYear() - 2)
        days = 365
        type = "month"
        break
      case "30d":
      default:
        currentStart.setDate(now.getDate() - 30)
        previousStart.setDate(now.getDate() - 60)
        days = 30
        type = "day"
        break
    }
    return { currentStart, previousStart, now, days, type }
  }

  async getSummaryKPIs(range: string = "30d") {
    const { currentStart, previousStart, now } = this.getDateRangeBounds(range)

    const [currentStats] = await db.select({
      totalRevenue: sql`SUM(CASE WHEN LOWER(${order.paymentStatus}) IN ('paid', 'captured') THEN CAST(${order.totalAmount} AS DECIMAL) ELSE 0 END)`.mapWith(Number),
      totalOrders: count(),
      totalReturns: sql`SUM(CASE WHEN LOWER(${order.status}) IN ('returned', 'return_approved') THEN 1 ELSE 0 END)`.mapWith(Number),
    }).from(order).where(gte(order.createdAt, currentStart))

    const [previousStats] = await db.select({
      totalRevenue: sql`SUM(CASE WHEN LOWER(${order.paymentStatus}) IN ('paid', 'captured') THEN CAST(${order.totalAmount} AS DECIMAL) ELSE 0 END)`.mapWith(Number),
      totalOrders: count(),
      totalReturns: sql`SUM(CASE WHEN LOWER(${order.status}) IN ('returned', 'return_approved') THEN 1 ELSE 0 END)`.mapWith(Number),
    }).from(order).where(and(gte(order.createdAt, previousStart), lt(order.createdAt, currentStart)))

    const currRev = currentStats?.totalRevenue || 0
    const prevRev = previousStats?.totalRevenue || 0
    const currOrders = currentStats?.totalOrders || 0
    const prevOrders = previousStats?.totalOrders || 0
    const currReturns = currentStats?.totalReturns || 0
    const prevReturns = previousStats?.totalReturns || 0

    const currAov = currOrders > 0 ? currRev / currOrders : 0
    const prevAov = prevOrders > 0 ? prevRev / prevOrders : 0
    
    const currReturnRate = currOrders > 0 ? (currReturns / currOrders) * 100 : 0
    const prevReturnRate = prevOrders > 0 ? (prevReturns / prevOrders) * 100 : 0

    const calculateChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0
      return Number((((curr - prev) / prev) * 100).toFixed(1))
    }

    const [pendingOrdersResult] = await db
      .select({ value: count() })
      .from(order)
      .where(eq(order.status, "pending"))

    return {
      revenue: {
        current: Number(currRev.toFixed(2)),
        previous: Number(prevRev.toFixed(2)),
        changePercent: Math.abs(calculateChange(currRev, prevRev)),
        direction: currRev >= prevRev ? "up" : "down",
      },
      orders: {
        current: currOrders,
        previous: prevOrders,
        changePercent: Math.abs(calculateChange(currOrders, prevOrders)),
        direction: currOrders >= prevOrders ? "up" : "down",
      },
      aov: {
        current: Number(currAov.toFixed(2)),
        previous: Number(prevAov.toFixed(2)),
        changePercent: Math.abs(calculateChange(currAov, prevAov)),
        direction: currAov >= prevAov ? "up" : "down",
      },
      returnRate: {
        current: Number(currReturnRate.toFixed(1)),
        previous: Number(prevReturnRate.toFixed(1)),
        changePercent: Math.abs(calculateChange(currReturnRate, prevReturnRate)),
        direction: currReturnRate >= prevReturnRate ? "up" : "down",
      },
      pendingOrders: Number(pendingOrdersResult?.value || 0),
      lowStockProducts: await this.getLowStockCount(),
    }
  }

  async getLowStockCount() {
    const [lowStockCount] = await db
      .select({ value: count() })
      .from(productVariant)
      .where(lte(productVariant.stock, 5))
    return Number(lowStockCount?.value || 0)
  }

  async getMainAnalytics(range: string = "30d") {
    const { currentStart, now, days, type } = this.getDateRangeBounds(range)

    let groupSql;
    if (type === "month") {
      groupSql = sql`TO_CHAR(${order.createdAt}, 'YYYY-MM')`
    } else if (type === "hour") {
      groupSql = sql`TO_CHAR(${order.createdAt}, 'YYYY-MM-DD HH24:00')`
    } else {
      groupSql = sql`DATE(${order.createdAt})`
    }

    const results = await db
      .select({
        date: groupSql,
        revenue: sql`SUM(CASE WHEN LOWER(${order.paymentStatus}) IN ('paid', 'captured') THEN CAST(${order.totalAmount} AS DECIMAL) ELSE 0 END)`.mapWith(Number),
        orders: count(),
      })
      .from(order)
      .where(gte(order.createdAt, currentStart))
      .groupBy(groupSql)
      .orderBy(groupSql)

    const data = []
    if (type === "hour") {
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now)
        d.setHours(now.getHours() - i)
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:00`
        
        const dayData = results.find(r => r.date === dateStr || (r.date && String(r.date).startsWith(dateStr)))
        data.push({
          date: dateStr,
          revenue: dayData?.revenue || 0,
          orders: dayData?.orders || 0,
          aov: dayData?.orders ? Number(((dayData.revenue || 0) / dayData.orders).toFixed(2)) : 0,
        })
      }
    } else if (type === "month") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now)
        d.setMonth(now.getMonth() - i)
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        
        const dayData = results.find(r => r.date === dateStr || (r.date && String(r.date).startsWith(dateStr)))
        data.push({
          date: dateStr,
          revenue: dayData?.revenue || 0,
          orders: dayData?.orders || 0,
          aov: dayData?.orders ? Number(((dayData.revenue || 0) / dayData.orders).toFixed(2)) : 0,
        })
      }
    } else {
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0]
        
        const dayData = results.find(r => r.date === dateStr || (r.date && String(r.date).startsWith(dateStr)))
        data.push({
          date: dateStr,
          revenue: dayData?.revenue || 0,
          orders: dayData?.orders || 0,
          aov: dayData?.orders ? Number(((dayData.revenue || 0) / dayData.orders).toFixed(2)) : 0,
        })
      }
    }
    return data
  }

  async getOrderStatusDistribution(range: string = "30d") {
    const { currentStart } = this.getDateRangeBounds(range)
    
    const results = await db
      .select({
        status: order.status,
        count: count(),
      })
      .from(order)
      .where(gte(order.createdAt, currentStart))
      .groupBy(order.status)

    const distribution = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      packed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    }

    results.forEach((r) => {
      const s = r.status.toLowerCase()
      if (s in distribution) {
        distribution[s as keyof typeof distribution] = Number(r.count)
      }
    })

    return distribution
  }

  async getPaymentVerificationStats() {
    const awaitingResult = await db
      .select({ count: count() })
      .from(order)
      .where(and(inArray(order.paymentMethod, ["manual", "cod"]), eq(order.paymentStatus, "pending")))

    const awaitingVerification = Number(awaitingResult[0]?.count || 0)

    const verifiedResult = await db
      .select({ count: count() })
      .from(order)
      .where(and(inArray(order.paymentMethod, ["manual", "cod"]), inArray(order.paymentStatus, ["paid", "captured", "completed"])))

    const recentlyVerified = Number(verifiedResult[0]?.count || 0)

    const queue = await db.query.order.findMany({
      where: and(inArray(order.paymentMethod, ["manual", "cod"]), eq(order.paymentStatus, "pending")),
      with: { user: true },
      limit: 5,
      orderBy: desc(order.createdAt),
    })

    return {
      awaitingVerification,
      recentlyVerified,
      verificationQueue: queue.map((q) => ({
        id: q.id,
        orderNumber: q.orderNumber,
        customerName: q.user?.name || "Guest",
        amount: Number(q.totalAmount),
        date: q.createdAt.toISOString(),
      })),
    }
  }

  async getInventoryAlerts() {
    const lowStock = await db.query.productVariant.findMany({
      where: lte(productVariant.stock, 5),
      with: { product: true },
      limit: 10,
    })

    return lowStock.map((v) => ({
      id: v.id,
      productId: v.productId || "",
      productName: v.product?.title || "Unknown",
      sku: v.sku || "",
      stock: v.stock,
      status: v.stock === 0 ? "out_of_stock" : "low_stock",
    }))
  }

  async getTopSellingProducts() {
    // Simplified aggregate for top selling products
    const results = await db
      .select({
        productId: orderItem.productId,
        unitsSold: sql`SUM(${orderItem.quantity})`.mapWith(Number),
        revenue: sql`SUM(CAST(${orderItem.priceAtPurchase} AS DECIMAL) * ${orderItem.quantity})`.mapWith(Number),
      })
      .from(orderItem)
      .groupBy(orderItem.productId)
      .orderBy(desc(sql`SUM(${orderItem.quantity})`))
      .limit(5)

    const topProducts = []
    for (const r of results) {
      if (!r.productId) continue
      const prod = await db.query.product.findFirst({
        where: eq(product.id, r.productId),
        with: { images: true, variants: true },
      })
      if (prod) {
        topProducts.push({
          id: prod.id,
          name: prod.title,
          sku: prod.variants && prod.variants.length > 0 ? prod.variants[0].sku : "",
          unitsSold: Number(r.unitsSold || 0),
          revenue: Number(r.revenue || 0),
          image: prod.images && prod.images.length > 0 ? (prod.images[0]?.asset as any)?.url : undefined,
        })
      }
    }
    return topProducts
  }

  async getTimeOfDayStats(range: string = "30d") {
    const { currentStart } = this.getDateRangeBounds(range)

    const orders = await db
      .select({ createdAt: order.createdAt })
      .from(order)
      .where(gte(order.createdAt, currentStart))

    const stats = {
      Morning: 0,
      Afternoon: 0,
      Evening: 0,
      Night: 0,
    }

    orders.forEach((o) => {
      const hour = new Date(o.createdAt).getHours()
      if (hour >= 6 && hour < 12) stats.Morning++
      else if (hour >= 12 && hour < 17) stats.Afternoon++
      else if (hour >= 17 && hour < 21) stats.Evening++
      else stats.Night++
    })

    return [
      { name: "Morning", value: stats.Morning },
      { name: "Afternoon", value: stats.Afternoon },
      { name: "Evening", value: stats.Evening },
      { name: "Night", value: stats.Night },
    ]
  }

  async getCategoryStats(range: string = "30d") {
    const { currentStart } = this.getDateRangeBounds(range)

    const results = await db
      .select({
        name: category.name,
        value: sql<number>`CAST(COALESCE(SUM(${orderItem.quantity}), 0) AS INTEGER)`,
      })
      .from(order)
      .innerJoin(orderItem, eq(orderItem.orderId, order.id))
      .innerJoin(product, eq(product.id, orderItem.productId))
      .innerJoin(category, eq(category.id, product.categoryId))
      .where(gte(order.createdAt, currentStart))
      .groupBy(category.name)
      .orderBy(desc(sql`SUM(${orderItem.quantity})`))
      .limit(5)

    return results
  }

  async getTopCustomers() {
    const results = await db
      .select({
        userId: order.userId,
        totalOrders: count(),
        totalSpent: sql`SUM(CAST(${order.totalAmount} AS DECIMAL))`.mapWith(Number),
        lastPurchaseDate: sql`MAX(${order.createdAt})`,
      })
      .from(order)
      .groupBy(order.userId)
      .orderBy(desc(sql`SUM(CAST(${order.totalAmount} AS DECIMAL))`))
      .limit(5)

    const topCustomers = []
    for (const r of results) {
      if (!r.userId) continue
      const [u] = await db.select().from(user).where(eq(user.id, r.userId))
      if (u) {
        topCustomers.push({
          id: u.id,
          name: u.name || "Unknown",
          email: u.email || "",
          totalOrders: Number(r.totalOrders || 0),
          totalSpent: Number(r.totalSpent || 0),
          lastPurchaseDate: (r.lastPurchaseDate ? new Date(r.lastPurchaseDate as string | Date) : new Date()).toISOString(),
        })
      }
    }
    return topCustomers
  }

  async getRecentOrders() {
    const recent = await db.query.order.findMany({
      with: { user: true },
      orderBy: desc(order.createdAt),
      limit: 10,
    })

    return recent.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user?.name || "Guest",
      amount: Number(o.totalAmount),
      paymentStatus: o.paymentStatus,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    }))
  }
}
