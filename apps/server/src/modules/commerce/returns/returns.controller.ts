import { ok } from "@/core/response"
import { Context } from "hono"
import { ReturnsService } from "./returns.service"
import { transformReturnRequest, transformReturnRequestList } from "@/core/transformers/return.transformer"

export class ReturnsController {
  private service = new ReturnsService()

  async createRequest(c: Context) {
    const user = c.get("user")!
    const body = c.req.valid("json" as never) as any
    const rawReq = await this.service.createReturnRequest(user.id, body)
    const returnReq = transformReturnRequest(rawReq)
    return c.json(ok({ returnRequest: returnReq }))
  }

  async getUserReturns(c: Context) {
    const user = c.get("user")!
    const rawItems = await this.service.getUserReturns(user.id)
    const items = rawItems.map(transformReturnRequestList)
    return c.json(ok(items))
  }

  async listAdmin(c: Context) {
    const rawItems = await this.service.listAdminReturns()
    const items = rawItems.map(transformReturnRequestList)
    return c.json(ok(items))
  }

  async updateStatus(c: Context) {
    const admin = c.get("user")!
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never) as any
    const rawUpdated = await this.service.updateReturnStatus(id, body.status, admin.id, body.adminNotes, body.pickupDate)
    const updated = transformReturnRequest(rawUpdated)
    return c.json(ok({ returnRequest: updated }))
  }

  async cancelRequest(c: Context) {
    const user = c.get("user")!
    const id = c.req.param("id")!
    const rawUpdated = await this.service.cancelReturnRequest(user.id, id)
    const updated = transformReturnRequest(rawUpdated)
    return c.json(ok({ returnRequest: updated }))
  }
}
