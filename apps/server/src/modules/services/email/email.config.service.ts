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

  static async getConfig(): Promise<EmailConfig> {
    if (this.cachedConfig) {
      return this.cachedConfig
    }
    this.cachedConfig = DEFAULT_CONFIG
    return this.cachedConfig
  }

  static invalidateCache(): void {
    this.cachedConfig = null
    logger.info("Email configuration cache invalidated")
  }

  static async updateConfig(newConfig: Partial<EmailConfig>): Promise<EmailConfig> {
    const currentConfig = await this.getConfig()
    this.cachedConfig = { ...currentConfig, ...newConfig }
    return this.cachedConfig
  }
}

