import { ok, fail, created, paginated } from "@/core/response"
import { Context } from "hono"
import { NotificationsService } from "./notifications.service"

export class NotificationsController {
  private service = new NotificationsService()

  async subscribe(c: Context) {
    const user = c.get("user") // Can be undefined for guests
    const body = c.req.valid("json" as never) as any
    const item = await this.service.subscribePush(user?.id, body.endpoint, body.keys)
    return c.json(ok(item))
  }

  async unsubscribe(c: Context) {
    const body = c.req.valid("json" as never) as any
    const item = await this.service.unsubscribePush(body.endpoint)
    return c.json(ok(item))
  }

  async createCampaign(c: Context) {
    const body = c.req.valid("json" as never) as any
    const item = await this.service.createCampaign(body.title, body.body, body.channel)
    return c.json(ok(item))
  }

  async broadcastCampaign(c: Context) {
    const id = c.req.param("id")!
    const item = await this.service.sendCampaign(id)
    return c.json(ok(item))
  }
}
