import { ok } from "@/core/response"
import { Context } from "hono"
import { SettingsService } from "./settings.service"

export class SettingsController {
  private service = new SettingsService()

  async getSettings(c: Context) {
    const settings = await this.service.getSettings()
    return c.json(ok(settings))
  }

  async updateSettings(c: Context) {
    const body = await c.req.json()
    const updated = await this.service.updateSettings(body)
    return c.json(ok(updated))
  }
}
