import { ok } from "@/core/response"
import { NotFoundError } from "@/core/errors"
import { Context } from "hono"
import { InvoicesService } from "./invoices.service"
import { OrdersService } from "../orders/orders.service"
import { SettingsService } from "../../administration/management/settings.service"
import { transformInvoice, transformInvoiceList } from "@/core/transformers/invoice.transformer"
import { InvoiceGenerator } from "./invoice-generator"

export class InvoicesController {
  private service = new InvoicesService()
  private ordersService = new OrdersService()
  private settingsService = new SettingsService()

  async download(c: Context) {
    const orderId = c.req.param("orderId")!
    const invoiceData = await this.service.generateInvoiceForOrder(orderId)
    const orderData = await this.ordersService.getOrderDetails(orderId, c.get("userId"))
    const settings = await this.settingsService.getSettings()
    
    if (!invoiceData) throw new NotFoundError("Invoice not found")

    const pdfBuffer = await InvoiceGenerator.generateBuffer(invoiceData, orderData, settings)
    
    c.header("Content-Type", "application/pdf")
    c.header("Content-Disposition", `attachment; filename="Invoice-${invoiceData.invoiceNumber}.pdf"`)
    return c.body(pdfBuffer as any)
  }

  async listAdmin(c: Context) {
    const rawItems = await this.service.listInvoices()
    const items = rawItems.map(transformInvoiceList)
    return c.json(ok(items))
  }

  async getByOrder(c: Context) {
    const orderId = c.req.param("orderId")!
    const rawItem = await this.service.getOrderInvoice(orderId)
    const item = transformInvoice(rawItem)
    return c.json(ok({ invoice: item }))
  }

  async generate(c: Context) {
    const body = c.req.valid("json" as never) as any
    const rawItem = await this.service.generateInvoiceForOrder(body.orderId)
    const item = transformInvoice(rawItem)
    return c.json(ok({ invoice: item }))
  }
}
