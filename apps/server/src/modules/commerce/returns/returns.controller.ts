import { ok } from "@/core/response"
import { Context } from "hono"
import { ReturnsService } from "./returns.service"

export class ReturnsController {
  private service = new ReturnsService()

  async createRequest(c: Context) {
    const user = c.get("user")!
    const body = c.req.valid("json" as never) as any
    const returnReq = await this.service.createReturnRequest(user.id, body)
    return c.json(ok({ returnRequest: returnReq }))
  }

  async getUserReturns(c: Context) {
    const user = c.get("user")!
    const items = await this.service.getUserReturns(user.id)
    return c.json(ok(items))
  }

  async listAdmin(c: Context) {
    const items = await this.service.listAdminReturns()
    return c.json(ok(items))
  }

  async updateStatus(c: Context) {
    const admin = c.get("user")!
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never) as any
    const updated = await this.service.updateReturnStatus(id, body.status, admin.id, body.adminNotes)
    return c.json(ok({ returnRequest: updated }))
  }
}
