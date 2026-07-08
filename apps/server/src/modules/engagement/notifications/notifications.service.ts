import { NotFoundError, ConflictError } from "@/core/errors"
import db from "@/db"
import { notification_log, push_subscription, campaign, user } from "@/db/schemas"
import { eq, and } from "drizzle-orm"
import { ResendNotificationProvider, PushNotificationProvider } from "../../providers/notification.provider"

export class NotificationsService {
  private emailProvider = new ResendNotificationProvider()
  private pushProvider = new PushNotificationProvider()

  // --- Push Subscriptions ---
  async subscribePush(userId: string | undefined, endpoint: string, keys: any) {
    const existing = await db.query.push_subscription.findFirst({
      where: eq(push_subscription.endpoint, endpoint),
    })

    if (existing) {
      const [updated] = await db
        .update(push_subscription)
        .set({ userId, keys, active: true, updatedAt: new Date() })
        .where(eq(push_subscription.id, existing.id))
        .returning()
      return updated
    }

    const [newItem] = await db
      .insert(push_subscription)
      .values({
        userId,
        endpoint,
        keys,
      })
      .returning()
    return newItem
  }

  async unsubscribePush(endpoint: string) {
    const [updated] = await db
      .update(push_subscription)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(push_subscription.endpoint, endpoint))
      .returning()
    return updated || null
  }

  // --- Campaigns (Ads / Broadcasts) ---
  async createCampaign(title: string, body: string, channel: "email" | "push" | "both") {
    const [newItem] = await db
      .insert(campaign)
      .values({
        title,
        body,
        channel,
      })
      .returning()
    return newItem
  }

  async sendCampaign(campaignId: string) {
    const campaignData = await db.query.campaign.findFirst({
      where: eq(campaign.id, campaignId),
    })

    if (!campaignData) throw new NotFoundError("Campaign not found")
    if (campaignData.status === "Sent") throw new ConflictError("Campaign already sent")

    let sentCount = 0

    // Send via Email
    if (campaignData.channel === "email" || campaignData.channel === "both") {
      const allUsers = await db.query.user.findMany()
      for (const u of allUsers) {
        if (u.email) {
          const success = await this.emailProvider.send(
            "campaign_ad",
            { email: u.email },
            { subject: campaignData.title, body: campaignData.body }
          )
          if (success) sentCount++
        }
      }
    }

    // Send via Push
    if (campaignData.channel === "push" || campaignData.channel === "both") {
      const activeSubs = await db.query.push_subscription.findMany({
        where: eq(push_subscription.active, true),
      })
      for (const sub of activeSubs) {
        const success = await this.pushProvider.send(
          "campaign_ad",
          { pushEndpoint: sub.endpoint, pushKeys: sub.keys },
          { title: campaignData.title, body: campaignData.body }
        )
        if (success) sentCount++
      }
    }

    const [updated] = await db
      .update(campaign)
      .set({ status: "Sent", sentCount })
      .where(eq(campaign.id, campaignId))
      .returning()

    return updated
  }
}
