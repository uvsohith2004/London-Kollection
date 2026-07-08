import { NotFoundError } from "@/core/errors"
import db from "@/db"
import { order, orderItem, orderTimeline, product, productVariant } from "@/db/schemas"
import { eq, and, sql, desc } from "drizzle-orm"

export class OrdersService {
  async getUserOrders(userId: string) {
    return await db.query.order.findMany({
      where: eq(order.userId, userId),
      orderBy: desc(order.createdAt),
    })
  }

  async getOrderDetails(orderId: string, userId?: string) {
    const conditions = [eq(order.id, orderId)]
    if (userId) {
      conditions.push(eq(order.userId, userId))
    }

    return await db.query.order.findFirst({
      where: and(...conditions),
      with: {
        items: true,
        timeline: {
          orderBy: [desc(orderTimeline.createdAt)],
        },
      },
    })
  }

  async updateOrder(
    orderId: string,
    updates: { status?: string; description?: string },
    updatedBy: string
  ) {
    const updatedOrder = await db.transaction(async (tx) => {
      const currentOrder = await tx.query.order.findFirst({
        where: eq(order.id, orderId),
        with: { items: true },
      })

      if (!currentOrder) {
        throw new NotFoundError("Order not found")
      }

      const prevStatus = currentOrder.status
      const newStatus = updates.status || prevStatus

      if (prevStatus === newStatus) {
        return currentOrder
      }

      // Handle stock adjustments based on state transition
      const wasPending = prevStatus === "pending" || prevStatus === "confirmed"
      const isNowProcessing = newStatus === "processing" && wasPending
        
      if (isNowProcessing) {
        // Processing started -> Deduct stock
        for (const item of currentOrder.items) {
          if (item.variantId) {
            await tx
              .update(productVariant)
              .set({
                stock: sql`${productVariant.stock} - ${item.quantity}`,
                reservedStock: sql`${productVariant.reservedStock} - ${item.quantity}`,
              })
              .where(eq(productVariant.id, item.variantId))
          }
        }
      } else if (newStatus === "cancelled" && wasPending) {
        // Cancelled before processing -> Release stock reservation
        for (const item of currentOrder.items) {
          if (item.variantId) {
            await tx
              .update(productVariant)
              .set({
                reservedStock: sql`GREATEST(0, ${productVariant.reservedStock} - ${item.quantity})`,
              })
              .where(eq(productVariant.id, item.variantId))
          }
        }
      }

      // Update Order Data
      const updateData: any = { updatedAt: new Date() }
      if (updates.status) updateData.status = updates.status

      const [updatedRecord] = await tx
        .update(order)
        .set(updateData)
        .where(eq(order.id, orderId))
        .returning()

      // Log status transition in timeline
      const timelineDesc = updates.description || `Status updated from ${prevStatus} to ${newStatus}.`

      await tx.insert(orderTimeline).values({
        orderId,
        status: newStatus,
        description: timelineDesc,
        createdBy: updatedBy,
      })

      return updatedRecord
    })

    // Auto-generate invoice when confirmed
    if (updates.status === "confirmed") {
      try {
        const { InvoicesService } = await import("../invoices/invoices.service")
        const invoicesService = new InvoicesService()
        await invoicesService.generateInvoiceForOrder(orderId)
      } catch (err) {
        console.error("Failed to auto-generate invoice for order", orderId, err)
      }
    }

    return updatedOrder
  }
}
