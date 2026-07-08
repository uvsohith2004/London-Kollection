import db from "@/db"
import { user, order, product, productVariant } from "@/db/schemas"
import { count, sql, eq, desc, lte } from "drizzle-orm"

export class DashboardService {
  async getMetrics() {
    // 1. Total Users
    const [userCount] = await db.select({ value: count() }).from(user)

    // 2. Total Revenue (sum of all Paid orders)
    const [revenue] = await db
      .select({ value: sql<number>`SUM(CAST(${order.totalAmount} AS DECIMAL))` })
      .from(order)
      .where(eq(order.status, "Paid"))

    // 3. Orders Count
    const [orderCount] = await db.select({ value: count() }).from(order)

    // 4. Low Stock Variants (stock <= 5)
    const lowStockProducts = await db.query.productVariant.findMany({
      where: lte(productVariant.stock, 5),
      limit: 5,
      with: { product: true },
    })

    return {
      totalUsers: userCount.value,
      totalRevenue: revenue?.value || 0,
      totalOrders: orderCount.value,
      lowStockAlerts: lowStockProducts,
    }
  }

  async getRecentActivity() {
    const recentOrders = await db.query.order.findMany({
      orderBy: desc(order.createdAt),
      limit: 10,
      with: { items: true },
    })

    const recentUsers = await db.query.user.findMany({
      orderBy: desc(user.createdAt),
      limit: 10,
    })

    return {
      recentOrders,
      recentUsers,
    }
  }
}
