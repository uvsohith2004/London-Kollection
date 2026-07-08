import { ok, fail, created, paginated } from "@/core/response"
import { Context } from "hono"
import { SettingsService } from "./settings.service"

export class SettingsController {
  private service = new SettingsService()

  async getAllSettings(c: Context) {
    const items = await this.service.getAllSettings()
    return c.json(ok(items))
  }

  async updateSetting(c: Context) {
    const key = c.req.param("key")!
    const body = c.req.valid("json" as never) as any
    const updated = await this.service.updateSetting(key, body.value, body.description)
    return c.json(ok({ setting: updated }))
  }

  async bulkUpdateSettings(c: Context) {
    const body = await c.req.json()
    const updatedSettings = []
    
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) {
        try {
          const updated = await this.service.updateSetting(key, value)
          updatedSettings.push(updated)
        } catch (error) {
          console.error(`Failed to update setting ${key}:`, error)
        }
      }
    }
    
    return c.json(ok({ settings: updatedSettings }))
  }
}
