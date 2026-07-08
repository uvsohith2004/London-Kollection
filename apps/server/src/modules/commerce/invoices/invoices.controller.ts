import { ok } from "@/core/response"
import { NotFoundError } from "@/core/errors"
import { Context } from "hono"
import { InvoicesService } from "./invoices.service"

export class InvoicesController {
  private service = new InvoicesService()

  async listAdmin(c: Context) {
    const items = await this.service.listInvoices()
    return c.json(ok(items))
  }

  async getByOrder(c: Context) {
    const orderId = c.req.param("orderId")!
    const item = await this.service.getOrderInvoice(orderId)
    if (!item) {
      throw new NotFoundError("Invoice not found")
    }
    return c.json(ok({ invoice: item }))
  }

  async generate(c: Context) {
    const body = c.req.valid("json" as never) as any
    const item = await this.service.generateInvoiceForOrder(body.orderId)
    return c.json(ok({ invoice: item }))
  }
}
