import db from "@/db"
import { auditLog } from "@/db/schemas/audit.schema"
import { emailProviderHealth } from "@/db/schemas/email.schema"
import { EmailConfigService, EmailConfig } from "../../services/email/email.config.service"
import { EmailFactory } from "../../services/email/email.factory"

export class EmailAdminService {
  async getConfig() {
    return await EmailConfigService.getConfig()
  }

  async updateConfig(userId: string | undefined, newConfig: Partial<EmailConfig>) {
    const oldConfig = await EmailConfigService.getConfig()
    const updatedConfig = await EmailConfigService.updateConfig(newConfig)

    // Log the change in audit logs
    if (userId) {
      await db.insert(auditLog).values({
        id: crypto.randomUUID(),
        userId,
        action: "UPDATE_EMAIL_CONFIG",
        resource: "email_settings",
        previousValue: oldConfig,
        newValue: updatedConfig,
      })
    }

    return updatedConfig
  }

  async getHealthMetrics() {
    return await db.select().from(emailProviderHealth)
  }

  async sendTestEmail(userId: string | undefined, to: string) {
    const success = await EmailFactory.sendEmail({
      to,
      subject: "Test Email - London Kollection",
      html: "<p>This is a test email sent from the London Kollection Admin Dashboard.</p>",
    })

    if (userId) {
      await db.insert(auditLog).values({
        id: crypto.randomUUID(),
        userId,
        action: "SEND_TEST_EMAIL",
        resource: "email_settings",
        newValue: { to, success },
      })
    }

    if (!success) {
      throw new Error("Failed to send test email. Check provider configuration and health dashboard.")
    }

    return { success: true }
  }
}
