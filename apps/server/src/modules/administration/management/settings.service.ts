import db from "@/db"
import { setting } from "@/db/schemas"
import { eq } from "drizzle-orm"
import { cache } from "@/cache"
import { reloadConfig } from "@/config"
import { BadRequestError } from "@/core/errors"

// Mapping of secret keys to their corresponding environment variables
const SECRET_KEYS_MAP: Record<string, string> = {
  stripeSecretKey: "STRIPE_SECRET_KEY",
  razorpayKeyId: "RAZORPAY_KEY_ID",
  razorpayKeySecret: "RAZORPAY_KEY_SECRET",
  paypalClientId: "PAYPAL_CLIENT_ID",
  paypalClientSecret: "PAYPAL_CLIENT_SECRET",
  shipmentApiKey: "SHIPMENT_API_KEY",
  smtpPass: "SMTP_PASS",
  resendApiKey: "RESEND_API_KEY",
  smsProviderApiKey: "SMS_PROVIDER_API_KEY",
  googleClientSecret: "GOOGLE_CLIENT_SECRET",
  betterAuthSecret: "BETTER_AUTH_SECRET",
}

export class SettingsService {
  async getSetting(key: string) {
    if (SECRET_KEYS_MAP[key]) {
      // Return a masked placeholder if the secret exists in process.env
      const envKey = SECRET_KEYS_MAP[key]
      if (process.env[envKey]) {
        return "********" // Masked placeholder
      }
      return null
    }

    const cached = await cache.get<string>(`setting:${key}`)
    if (cached) return cached

    const [result] = await db.select().from(setting).where(eq(setting.key, key))
    const value = result ? result.value : null
    
    if (value) {
      await cache.set(`setting:${key}`, value, 3600)
    }
    
    return value
  }

  async updateSetting(key: string, value: any, description?: string) {
    if (SECRET_KEYS_MAP[key]) {
      throw new BadRequestError(`Cannot modify ${key} via API. Please configure the ${SECRET_KEYS_MAP[key]} environment variable.`)
    }

    const existing = await db.select().from(setting).where(eq(setting.key, key))

    let updatedOrCreated
    if (existing.length > 0) {
      const [updated] = await db
        .update(setting)
        .set({
          value,
          description: description || existing[0].description,
          updatedAt: new Date(),
        })
        .where(eq(setting.key, key))
        .returning()
      updatedOrCreated = updated
    } else {
      const [created] = await db
        .insert(setting)
        .values({
          key,
          value,
          description: description || null,
        })
        .returning()
      updatedOrCreated = created
    }

    await cache.set(`setting:${key}`, value, 3600)
    await reloadConfig()
    
    return updatedOrCreated
  }

  async getAllSettings() {
    const dbSettings = await db.select().from(setting)
    
    // Masked secrets for frontend
    const secretSettings = Object.entries(SECRET_KEYS_MAP).map(([key, envKey]) => ({
      key,
      value: process.env[envKey] ? "********" : null,
      description: `Configured via ${envKey}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    return [...dbSettings, ...secretSettings.filter(s => s.value !== null)]
  }
}
