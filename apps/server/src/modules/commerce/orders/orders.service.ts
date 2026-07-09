import { NotFoundError } from "@/core/errors"
import db from "@/db"
import { order, orderItem, orderTimeline, product, productVariant } from "@/db/schemas"
import { eq, and, sql, desc } from "drizzle-orm"

export class OrdersService {
  async getUserOrders(userId: string) {
    return await db.query.order.findMany({
      where: eq(order.userId, userId),
      orderBy: desc(order.createdAt),
      with: {
        items: {
          with: { product: { with: { images: true } } },
        },
      }
    })
  }

  async cancelOrder(orderId: string, reason: string, cancelledBy: string) {
    return await db.transaction(async (tx) => {
      const currentOrder = await tx.query.order.findFirst({
        where: eq(order.id, orderId),
        with: { items: true },
      })

      if (!currentOrder) throw new NotFoundError("Order not found")

      // Only allow cancellation in early stages
      const allowedStatuses = ["pending", "awaiting payment", "payment verification", "confirmed"]
      if (!allowedStatuses.includes(currentOrder.status.toLowerCase())) {
        throw new Error(`Cannot cancel order in ${currentOrder.status} state.`)
      }

      // If the order was confirmed and inventory was deducted, we might need to restore it
      // However, current updateOrder logic deducts stock on 'processing' / 'preparing'.
      // If it was already deducted, restore it here:
      if (currentOrder.status.toLowerCase() === "preparing" || currentOrder.status.toLowerCase() === "processing") {
        for (const item of currentOrder.items) {
          if (item.variantId) {
            await tx
              .update(productVariant)
              .set({
                stock: sql`${productVariant.stock} + ${item.quantity}`,
              })
              .where(eq(productVariant.id, item.variantId))
          }
        }
      } else {
        // Release reserved stock if not fully deducted yet
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

      const [updatedOrder] = await tx
        .update(order)
        .set({
          status: "Cancelled",
          cancellationReason: reason,
          cancelledAt: new Date(),
          cancelledBy,
          updatedAt: new Date(),
        })
        .where(eq(order.id, orderId))
        .returning()

      await tx.insert(orderTimeline).values({
        orderId,
        status: "Cancelled",
        description: `Order cancelled by ${cancelledBy}. Reason: ${reason}`,
        createdBy: cancelledBy,
      })

      return updatedOrder
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
        items: {
          with: { product: { with: { images: true } } },
        },
        timeline: {
          orderBy: [desc(orderTimeline.createdAt)],
        },
      },
    })
  }

  async updateOrder(
    orderId: string,
    updates: { status?: string; paymentStatus?: string; description?: string },
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

      const prevPaymentStatus = currentOrder.paymentStatus
      const newPaymentStatus = updates.paymentStatus || prevPaymentStatus

      if (prevStatus === newStatus && prevPaymentStatus === newPaymentStatus) {
        return currentOrder
      }

      // Handle stock adjustments based on state transition
      const wasPending = ["pending", "awaiting payment", "confirmed"].includes(prevStatus.toLowerCase())
      const isNowProcessing = ["preparing", "processing", "packed"].includes(newStatus.toLowerCase()) && wasPending
        
      if (isNowProcessing) {
        // Processing started -> Deduct stock
        for (const item of currentOrder.items) {
          if (item.variantId) {
            await tx
              .update(productVariant)
              .set({
                stock: sql`${productVariant.stock} - ${item.quantity}`,
                reservedStock: sql`GREATEST(0, ${productVariant.reservedStock} - ${item.quantity})`,
              })
              .where(eq(productVariant.id, item.variantId))
          }
        }
      }

      // Update Order Data
      const updateData: any = { updatedAt: new Date() }
      if (updates.status) updateData.status = updates.status
      if (updates.paymentStatus) updateData.paymentStatus = updates.paymentStatus

      const [updatedRecord] = await tx
        .update(order)
        .set(updateData)
        .where(eq(order.id, orderId))
        .returning()

      // Log status transition in timeline
      let timelineDesc = updates.description
      if (!timelineDesc) {
        const changes = []
        if (prevStatus !== newStatus) changes.push(`Status updated to ${newStatus}`)
        if (prevPaymentStatus !== newPaymentStatus) changes.push(`Payment updated to ${newPaymentStatus}`)
        timelineDesc = changes.join(". ") + "."
      }

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
