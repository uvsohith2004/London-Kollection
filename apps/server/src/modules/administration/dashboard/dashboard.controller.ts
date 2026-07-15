import { Context } from "hono"
import { DashboardService } from "./dashboard.service"

export class DashboardController {
  private service = new DashboardService()

  async getDashboardData(c: Context) {
    const range = c.req.query("range") || "30d"
    const summary = await this.service.getSummaryKPIs(range)
    const mainAnalytics = await this.service.getMainAnalytics(range)
    const operations = await this.service.getOrderStatusDistribution(range)
    const paymentVerification = await this.service.getPaymentVerificationStats()
    const inventory = await this.service.getInventoryAlerts()
    const topProducts = await this.service.getTopSellingProducts()
    const topCustomers = await this.service.getTopCustomers()
    const recentOrders = await this.service.getRecentOrders()
    const timeOfDayStats = await this.service.getTimeOfDayStats(range)
    const categoryStats = await this.service.getCategoryStats(range)
    
    const data = {
      summary,
      mainAnalytics,
      operations,
      paymentVerification,
      inventory,
      topProducts,
      topCustomers,
      recentOrders,
      timeOfDayStats,
      categoryStats,
      lastUpdatedAt: new Date().toISOString()
    }

    return c.json({
      success: true,
      data
    })
  }
}
