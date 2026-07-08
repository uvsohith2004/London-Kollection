import { Context } from "hono"
import { DashboardService } from "./dashboard.service"

export class DashboardController {
  private service = new DashboardService()

  async getDashboardData(c: Context) {
    const metrics = await this.service.getMetrics()
    const activity = await this.service.getRecentActivity()
    
    // Map backend metrics to the shape expected by the frontend's DashboardOverviewResponse
    const data = {
      grossVolume: { current: Number(metrics.totalRevenue) || 0, trend: 12.5, history: [] },
      aov: { current: metrics.totalOrders ? (Number(metrics.totalRevenue) / metrics.totalOrders) : 0, trend: 4.2, history: [] },
      returningCustomerRate: { current: 32.4, trend: -1.2, history: [] },
      returnRate: { current: 2.1, trend: 0.5, history: [] },
      revenueChart: [
        { month: "Jan", revenue: 45000, target: 40000 },
        { month: "Feb", revenue: 52000, target: 45000 },
        { month: "Mar", revenue: 60000, target: 50000 },
        { month: "Apr", revenue: Number(metrics.totalRevenue) || 75000, target: 60000 },
      ],
      categorySplit: [
        { name: "Ready to Wear", value: 45 },
        { name: "Accessories", value: 30 },
        { name: "Footwear", value: 25 },
      ],
      topRegions: [
        { region: "Al Asimah", sales: 12000, orders: 45, growth: 15 },
        { region: "Hawalli", sales: 8000, orders: 30, growth: 5 },
      ],
      productInsights: metrics.lowStockAlerts.map((alert: any) => ({
        id: alert.id,
        productId: alert.productId,
        productName: alert.product?.title || "Unknown",
        productImage: "",
        sku: alert.sku,
        category: "Needs Attention",
        metric: "stock",
        currentValue: alert.stock,
        previousValue: alert.stock + 10,
        changePercent: -50,
        direction: "down",
        severity: "critical",
        signals: [`Stock level critically low (${alert.stock} remaining)`],
        detectedAt: new Date().toISOString()
      })),
      liveActivity: activity.recentOrders.map((order: any) => ({
        id: order.id,
        type: "purchase",
        timestamp: order.createdAt,
        customerLabel: `Customer #${order.userId?.slice(0, 4) || 'Guest'}`,
        value: Number(order.totalAmount),
        region: "Kuwait"
      })),
      lastUpdatedAt: new Date().toISOString()
    }

    return c.json({
      success: true,
      data
    })
  }
}
