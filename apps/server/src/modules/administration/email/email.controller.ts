import { Context } from "hono"
import { ok } from "@/core/response"
import { EmailAdminService } from "./email.service"

export class EmailAdminController {
  private service = new EmailAdminService()

  async getConfig(c: Context) {
    const config = await this.service.getConfig()
    return c.json(ok(config))
  }

  async updateConfig(c: Context) {
    const body = await c.req.json()
    const user = c.get("user")
    const updatedConfig = await this.service.updateConfig(user?.id, body)
    return c.json(ok(updatedConfig))
  }

  async getHealthMetrics(c: Context) {
    const metrics = await this.service.getHealthMetrics()
    return c.json(ok(metrics))
  }

  async sendTestEmail(c: Context) {
    const { to } = await c.req.json()
    const user = c.get("user")
    const result = await this.service.sendTestEmail(user?.id, to)
    return c.json(ok(result))
  }
}
