import { NotFoundError } from "@/core/errors"
import db from "@/db"
import { invoice, order } from "@/db/schemas"
import { eq, desc } from "drizzle-orm"

export class InvoicesService {
  async getOrderInvoice(orderId: string) {
    return await db.query.invoice.findFirst({
      where: eq(invoice.orderId, orderId),
    })
  }

  async listInvoices() {
    return await db.query.invoice.findMany({
      orderBy: desc(invoice.createdAt),
    })
  }

  async generateInvoiceForOrder(orderId: string) {
    const orderData = await db.query.order.findFirst({
      where: eq(order.id, orderId),
    })

    if (!orderData) {
      throw new NotFoundError("Order not found")
    }

    // Check if invoice already exists
    const existing = await this.getOrderInvoice(orderId)
    if (existing) {
      return existing
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${orderId.split("-")[0].toUpperCase()}`
    
    // In a real scenario, this would generate a PDF and upload it to R2
    // Here we will mock the PDF generation
    const mockPdfUrl = `https://r2.mock-bucket.com/invoices/${invoiceNumber}.pdf`

    const [newInvoice] = await db
      .insert(invoice)
      .values({
        orderId,
        invoiceNumber,
        pdfUrl: mockPdfUrl,
        status: orderData.status === "Paid" ? "Paid" : "Unpaid",
      })
      .returning()

    return newInvoice
  }
}
