import { BadRequestError } from "@/core/errors"
import { IEmailService, SendEmailOptions } from "./email.interface"
import { NodemailerProvider } from "./nodemailer.provider"
import { ResendProvider } from "./resend.provider"
import { getConfig } from "../../../config"
import { SESProvider } from "./ses.provider"
import { EmailConfigService, EmailProviderType, EmailConfig } from "./email.config.service"
import db from "@/db"
import { emailLog, emailProviderHealth } from "@/db/schemas/email.schema"
import { eq, sql } from "drizzle-orm"
import { logger } from "@/core/utils/logger"

export class EmailFactory {
  private static getProviderInstance(providerName: EmailProviderType, config: EmailConfig): IEmailService {
    const envConfig = getConfig().email

    switch (providerName) {
      case "resend":
        if (!envConfig.resendApiKey)
          throw new BadRequestError("RESEND_API_KEY is missing in environment variables")
        return new ResendProvider({
          apiKey: envConfig.resendApiKey,
          from: config.fromAddress,
        })
      case "ses":
        if (!envConfig.sesRegion || !envConfig.sesAccessKeyId || !envConfig.sesSecretAccessKey) 
          throw new BadRequestError("AWS SES credentials missing in environment variables")
        return new SESProvider({
          region: envConfig.sesRegion,
          accessKeyId: envConfig.sesAccessKeyId,
          secretAccessKey: envConfig.sesSecretAccessKey,
          from: config.fromAddress,
        })
      case "nodemailer":
      default:
        if (!envConfig.smtpHost || !envConfig.smtpPort || !envConfig.smtpUser || !envConfig.smtpPass)
          throw new BadRequestError("SMTP credentials missing in environment variables")
        return new NodemailerProvider({
          host: envConfig.smtpHost,
          port: envConfig.smtpPort,
          secure: envConfig.smtpPort === 465,
          user: envConfig.smtpUser,
          pass: envConfig.smtpPass,
          from: config.fromAddress,
        })
    }
  }

  private static async updateHealthMetrics(
    providerName: string, 
    success: boolean, 
    durationMs: number, 
    errorMessage?: string
  ) {
    try {
      const existing = await db.select().from(emailProviderHealth).where(eq(emailProviderHealth.provider, providerName))
      
      const updateData: any = {
        updatedAt: new Date(),
        totalSent: success ? sql`${emailProviderHealth.totalSent} + 1` : undefined,
        totalFailures: !success ? sql`${emailProviderHealth.totalFailures} + 1` : undefined,
      }

      if (success) {
        updateData.lastSuccessfulSend = new Date()
        updateData.status = "healthy"
        updateData.lastErrorMessage = null
      } else {
        updateData.lastFailedSend = new Date()
        updateData.status = "degraded"
        updateData.lastErrorMessage = errorMessage?.substring(0, 500)
      }

      if (existing.length > 0) {
        // Naive rolling average calculation
        const currentAvg = existing[0].averageResponseTimeMs
        const newAvg = Math.floor((currentAvg * existing[0].totalSent + durationMs) / (existing[0].totalSent + 1))
        updateData.averageResponseTimeMs = isNaN(newAvg) ? durationMs : newAvg

        await db.update(emailProviderHealth).set(updateData).where(eq(emailProviderHealth.provider, providerName))
      } else {
        await db.insert(emailProviderHealth).values({
          provider: providerName,
          status: success ? "healthy" : "degraded",
          totalSent: success ? 1 : 0,
          totalFailures: success ? 0 : 1,
          averageResponseTimeMs: durationMs,
          lastSuccessfulSend: success ? new Date() : null,
          lastFailedSend: success ? null : new Date(),
          lastErrorMessage: errorMessage?.substring(0, 500),
        })
      }
    } catch (err) {
      logger.error("Failed to update email health metrics", { err })
    }
  }

  private static async logEmail(
    options: SendEmailOptions, 
    providerUsed: string, 
    status: string, 
    durationMs: number, 
    errorMessage?: string
  ) {
    try {
      await db.insert(emailLog).values({
        toAddress: options.to,
        subject: options.subject,
        providerUsed,
        status,
        errorMessage: errorMessage?.substring(0, 500),
        responseTimeMs: durationMs,
      })
    } catch (err) {
      logger.error("Failed to log email", { err })
    }
  }

  private static async attemptSend(
    providerName: EmailProviderType, 
    options: SendEmailOptions, 
    config: EmailConfig
  ): Promise<boolean> {
    const startTime = Date.now()
    try {
      const providerInstance = this.getProviderInstance(providerName, config)
      const success = await providerInstance.sendEmail({
        ...options,
        from: config.fromName ? `${config.fromName} <${config.fromAddress}>` : undefined,
        replyTo: config.replyTo || undefined
      })
      
      const duration = Date.now() - startTime
      if (success) {
        await this.updateHealthMetrics(providerName, true, duration)
        await this.logEmail(options, providerName, "success", duration)
        return true
      }
      throw new Error("Provider returned false for sendEmail")
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error(`Email send failed via ${providerName}`, { error: errorMessage })
      
      await this.updateHealthMetrics(providerName, false, duration, errorMessage)
      await this.logEmail(options, providerName, "failed", duration, errorMessage)
      return false
    }
  }

  static async sendEmail(options: SendEmailOptions): Promise<boolean> {
    const config = await EmailConfigService.getConfig()

    if (config.maintenanceMode) {
      logger.warn("Email system is in maintenance mode. Email dropped.", { to: options.to })
      return false
    }

    let success = await this.attemptSend(config.activeProvider, options, config)

    if (!success && config.fallbackProvider && config.fallbackProvider !== config.activeProvider) {
      logger.warn(`Primary provider ${config.activeProvider} failed. Attempting fallback: ${config.fallbackProvider}`)
      success = await this.attemptSend(config.fallbackProvider, options, config)
    }

    return success
  }
}
