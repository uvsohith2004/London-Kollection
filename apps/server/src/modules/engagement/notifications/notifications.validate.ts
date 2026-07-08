import { z } from "zod"

export const SubscribePushSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

export const UnsubscribePushSchema = z.object({
  endpoint: z.string().url(),
})

export const CreateCampaignSchema = z.object({
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  channel: z.enum(["email", "push", "both"]).default("both"),
})
