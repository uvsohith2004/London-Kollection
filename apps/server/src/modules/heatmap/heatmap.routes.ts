import { Hono } from "hono"
import { ok } from "@/core/response"
import { userHeatmap } from "@/db/schemas/heatmap.schema"
import { userProductHistory, userSearchHistory } from "@/db/schemas/history.schema"
import { eq, or, gt, isNull } from "drizzle-orm"
import { HeatmapService } from "./heatmap.service"
import db from "@/db"

export const heatmapRouter = new Hono()
const service = new HeatmapService()

heatmapRouter.get("/cron", async (c) => {
  // Strictly enforce Vercel Cron Secret
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error("[VERCEL CRON] CRON_SECRET environment variable is missing!")
    return c.json({ error: "Server Configuration Error" }, 500)
  }

  const authHeader = c.req.header("Authorization")
  if (authHeader !== `Bearer ${cronSecret}`) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  console.log("[VERCEL CRON] Running Heatmap Generation...")

  try {
    const productHistoryUpdate = await db.select({ userId: userProductHistory.userId })
      .from(userProductHistory)
      .leftJoin(userHeatmap, eq(userProductHistory.userId, userHeatmap.userId))
      .where(or(
        isNull(userHeatmap.lastCalculatedAt),
        gt(userProductHistory.lastViewedAt, userHeatmap.lastCalculatedAt)
      ))
      .groupBy(userProductHistory.userId)

    const searchHistoryUpdate = await db.select({ userId: userSearchHistory.userId })
      .from(userSearchHistory)
      .leftJoin(userHeatmap, eq(userSearchHistory.userId, userHeatmap.userId))
      .where(or(
        isNull(userHeatmap.lastCalculatedAt),
        gt(userSearchHistory.lastSearchedAt, userHeatmap.lastCalculatedAt)
      ))
      .groupBy(userSearchHistory.userId)
      
    const userIds = Array.from(new Set([
      ...productHistoryUpdate.map(u => u.userId),
      ...searchHistoryUpdate.map(u => u.userId)
    ]))
    
    console.log(`[VERCEL CRON] Found ${userIds.length} users with updated history needing heatmap recalculation.`)

    for (const userId of userIds) {
      await service.calculateHeatmap(userId)
    }

    console.log("[VERCEL CRON] Heatmap Generation completed.")
    return c.json(ok({ success: true, updatedUsers: userIds.length }))
  } catch (error) {
    console.error("[VERCEL CRON] Error during Heatmap Generation:", error)
    return c.json({ error: "Internal Server Error" }, 500)
  }
})
