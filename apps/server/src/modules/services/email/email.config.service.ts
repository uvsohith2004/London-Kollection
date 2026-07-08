import db from "@/db"
import { setting } from "@/db/schemas/settings.schema"
import { eq } from "drizzle-orm"
import { logger } from "@/core/utils/logger"

export type EmailProviderType = "nodemailer" | "resend" | "ses"

export interface EmailConfig {
  activeProvider: EmailProviderType
  fallbackProvider: EmailProviderType | null
  fromName: string
  fromAddress: string
  replyTo: string | null
  maintenanceMode: boolean
  maxRetries: number
}

const DEFAULT_CONFIG: EmailConfig = {
  activeProvider: "nodemailer",
  fallbackProvider: null,
  fromName: "London Kollection",
  fromAddress: "noreply@londonkollection.com",
  replyTo: null,
  maintenanceMode: false,
  maxRetries: 3,
}

export class EmailConfigService {
  private static cachedConfig: EmailConfig | null = null

  /**
   * Load email configuration from the database setting table or return defaults
   */
  static async getConfig(): Promise<EmailConfig> {
    if (this.cachedConfig) {
      return this.cachedConfig
    }

    try {
      const configSetting = await db.query.setting.findFirst({
        where: eq(setting.key, "email_config"),
      })

      if (configSetting?.value) {
        this.cachedConfig = {
          ...DEFAULT_CONFIG,
          ...(configSetting.value as Partial<EmailConfig>),
        }
      } else {
        this.cachedConfig = DEFAULT_CONFIG
      }
    } catch (error) {
      logger.error("Failed to load email config from DB, using defaults", { error })
      this.cachedConfig = DEFAULT_CONFIG
    }

    return this.cachedConfig
  }

  /**
   * Force invalidate the memory cache so it reloads from DB on next request
   */
  static invalidateCache(): void {
    this.cachedConfig = null
    logger.info("Email configuration cache invalidated")
  }

  /**
   * Update the configuration in the database and invalidate the cache
   */
  static async updateConfig(newConfig: Partial<EmailConfig>): Promise<EmailConfig> {
    const currentConfig = await this.getConfig()
    const updatedConfig = { ...currentConfig, ...newConfig }

    const existing = await db.query.setting.findFirst({
      where: eq(setting.key, "email_config"),
    })

    if (existing) {
      await db
        .update(setting)
        .set({
          value: updatedConfig,
          updatedAt: new Date(),
        })
        .where(eq(setting.key, "email_config"))
    } else {
      await db.insert(setting).values({
        key: "email_config",
        value: updatedConfig,
        description: "Dynamic Email Provider Configuration",
      })
    }

    this.invalidateCache()
    return await this.getConfig()
  }
}
