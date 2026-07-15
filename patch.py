import sys
import re

file_path = r"c:\Users\yasov\Documents\London-Kollection\apps\server\src\modules\administration\dashboard\dashboard.service.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add getDateRangeBounds helper
bounds_helper = """
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
    const { currentStart, previousStart } = this.getDateRangeBounds(range)

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
"""

content = re.sub(
    r"async getSummaryKPIs\(\) \{[\s\S]*?\}\)\.from\(order\)\.where\(and\(gte\(order\.createdAt, sixtyDaysAgo\), lt\(order\.createdAt, thirtyDaysAgo\)\)\)",
    bounds_helper.strip(),
    content
)

# 2. Update getMainAnalytics
main_analytics = """
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
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).zfill(2)}-${String(d.getDate()).zfill(2)} ${String(d.getHours()).zfill(2)}:00`.replace("zfill", "padStart")
        // js string padStart
        const fixedDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:00`
        
        const dayData = results.find(r => r.date === fixedDateStr || (r.date && String(r.date).startsWith(fixedDateStr)))
        data.push({
          date: fixedDateStr,
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
"""

content = re.sub(
    r"async getMainAnalytics\(\) \{[\s\S]*?return data\n  \}",
    main_analytics.strip(),
    content
)

# 3. Update getOrderStatusDistribution
status_dist = """
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
"""

content = re.sub(
    r"async getOrderStatusDistribution\(\) \{[\s\S]*?\.groupBy\(order\.status\)",
    status_dist.strip(),
    content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("success")
