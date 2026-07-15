import { NotFoundError } from "@/core/errors"
import db from "@/db"
import { order, orderItem, orderTimeline, product, productVariant } from "@/db/schemas"
import { eq, and, or, ilike, gte, lte, sql, desc } from "drizzle-orm"

export class OrdersService {
  async getAdminOrders(filters: { page: number; limit: number; search?: string; status?: string; paymentStatus?: string; paymentMethod?: string; dateFrom?: string; dateTo?: string }) {
    const { page, limit, search, status, paymentStatus, paymentMethod, dateFrom, dateTo } = filters;
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(order.orderNumber, `%${search}%`),
          ilike(order.userId, `%${search}%`),
          ilike(sql`CAST(${order.shippingAddress}->>'name' AS TEXT)`, `%${search}%`),
          ilike(sql`CAST(${order.shippingAddress}->>'email' AS TEXT)`, `%${search}%`),
          ilike(sql`CAST(${order.shippingAddress}->>'phone' AS TEXT)`, `%${search}%`)
        )!
      )
    }

    if (status && status.toLowerCase() !== "all") {
      conditions.push(eq(sql`LOWER(${order.status})`, status.toLowerCase()));
    }

    if (paymentStatus && paymentStatus.toLowerCase() !== "all") {
      conditions.push(eq(sql`LOWER(${order.paymentStatus})`, paymentStatus.toLowerCase()));
    }

    if (paymentMethod && paymentMethod.toLowerCase() !== "all") {
      conditions.push(eq(sql`LOWER(${order.paymentMethod})`, paymentMethod.toLowerCase()));
    }

    if (dateFrom) {
      conditions.push(gte(order.createdAt, new Date(dateFrom)));
    }

    if (dateTo) {
      conditions.push(lte(order.createdAt, new Date(dateTo)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countsRecord] = await db
      .select({
        all: sql`count(*)`.mapWith(Number),
        pending: sql`COALESCE(sum(case when lower(${order.status}) not in ('delivered', 'shipped', 'cancelled', 'completed') then 1 else 0 end), 0)`.mapWith(Number),
        shipped: sql`COALESCE(sum(case when lower(${order.status}) = 'shipped' then 1 else 0 end), 0)`.mapWith(Number),
        delivered: sql`COALESCE(sum(case when lower(${order.status}) = 'delivered' then 1 else 0 end), 0)`.mapWith(Number),
        cancelled: sql`COALESCE(sum(case when lower(${order.status}) = 'cancelled' then 1 else 0 end), 0)`.mapWith(Number),
      })
      .from(order);

    const [totalRecord] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(order)
      .where(whereClause);

    const total = Number(totalRecord?.count || 0);

    const items = await db.query.order.findMany({
      where: whereClause,
      orderBy: desc(order.createdAt),
      limit: limit + 1,
      offset: (page - 1) * limit,
      with: {
        items: {
          with: { product: { with: { images: true } } },
        },
      }
    });

    const hasMore = items.length > limit;
    const slicedItems = hasMore ? items.slice(0, limit) : items;

    return {
      items: slicedItems,
      hasMore,
      total,
      counts: {
        all: Number(countsRecord?.all || 0),
        pending: Number(countsRecord?.pending || 0),
        shipped: Number(countsRecord?.shipped || 0),
        delivered: Number(countsRecord?.delivered || 0),
        cancelled: Number(countsRecord?.cancelled || 0),
      },
      nextCursor: hasMore ? page + 1 : null
    };
  }
  async getUserOrders(userId: string, filters: { page: number; limit: number; search?: string; status?: string }) {
    const { page, limit, search, status } = filters;
    const conditions = [eq(order.userId, userId)];

    if (search) {
      conditions.push(sql`${order.orderNumber} ILIKE ${`%${search}%`}`);
    }

    if (status && status.toLowerCase() !== "all") {
      conditions.push(sql`LOWER(${order.status}) = ${status.toLowerCase()}`);
    }

    const whereClause = and(...conditions);

    const [countsRecord] = await db
      .select({
        all: sql`count(*)`.mapWith(Number),
        pending: sql`COALESCE(sum(case when lower(${order.status}) not in ('delivered', 'shipped', 'cancelled') then 1 else 0 end), 0)`.mapWith(Number),
        shipped: sql`COALESCE(sum(case when lower(${order.status}) = 'shipped' then 1 else 0 end), 0)`.mapWith(Number),
        delivered: sql`COALESCE(sum(case when lower(${order.status}) = 'delivered' then 1 else 0 end), 0)`.mapWith(Number),
        cancelled: sql`COALESCE(sum(case when lower(${order.status}) = 'cancelled' then 1 else 0 end), 0)`.mapWith(Number),
      })
      .from(order)
      .where(eq(order.userId, userId));

    const [totalRecord] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(order)
      .where(whereClause);

    const total = Number(totalRecord?.count || 0);

    const items = await db.query.order.findMany({
      where: whereClause,
      orderBy: desc(order.createdAt),
      limit: limit + 1,
      offset: (page - 1) * limit,
      with: {
        items: {
          with: { product: { with: { images: true } } },
        },
      }
    });

    const hasMore = items.length > limit;
    const slicedItems = hasMore ? items.slice(0, limit) : items;

    return {
      items: slicedItems,
      hasMore,
      total,
      counts: {
        all: Number(countsRecord?.all || 0),
        pending: Number(countsRecord?.pending || 0),
        shipped: Number(countsRecord?.shipped || 0),
        delivered: Number(countsRecord?.delivered || 0),
        cancelled: Number(countsRecord?.cancelled || 0),
      },
      nextCursor: hasMore ? page + 1 : null
    };
  }

  async cancelOrder(orderId: string, reason: string, cancelledBy: string) {
    return await db.transaction(async (tx) => {
      const currentOrder = await tx.query.order.findFirst({
        where: eq(order.id, orderId),
        with: { items: true },
      })

      if (!currentOrder) throw new NotFoundError("Order not found")

      // Immediate Rejection Rules

      const invalidStatuses = ["shipped", "in transit", "delivered", "cancelled", "refunded"]
      if (invalidStatuses.includes(currentOrder.status.toLowerCase())) {
        throw new Error(`Cannot cancel order in ${currentOrder.status} state.`)
      }

      // Restore Inventory correctly for ALL items (Partial quantities handled automatically by sql`... + quantity`)
      // If it was already deducted from stock (processing/packed/preparing):
      const stockDeducted = ["preparing", "processing", "packed"].includes(currentOrder.status.toLowerCase())

      for (const item of currentOrder.items) {
        if (item.variantId) {
          if (stockDeducted) {
            await tx
              .update(productVariant)
              .set({
                stock: sql`${productVariant.stock} + ${item.quantity}`,
              })
              .where(eq(productVariant.id, item.variantId))
          } else {
            // It was only reserved, so release the reserved stock
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

    const result = await db.query.order.findFirst({
      where: and(...conditions),
      with: {
        items: {
          with: { product: { with: { images: true } }, review: true },
        },
        timeline: {
          orderBy: [desc(orderTimeline.createdAt)],
        },
      },
    })
    
    if (!result) throw new NotFoundError("Order not found")
    
    return result
  }

  async updateOrder(
    orderId: string,
    updates: { status?: string; paymentStatus?: string; description?: string; pickupDate?: string; estimatedDelivery?: string },
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

      // Workflow State Machine Validation
      if (updates.status && prevStatus !== newStatus) {
        const validTransitions: Record<string, string[]> = {
          "pending": ["confirmed", "cancelled"],
          "confirmed": ["preparing", "packed", "shipped", "cancelled"],
          "preparing": ["packed", "shipped", "cancelled"],
          "packed": ["shipped", "cancelled"],
          "shipped": ["out_for_delivery", "delivered", "cancelled"],
          "out_for_delivery": ["delivered", "failed_delivery", "cancelled"],
          "delivered": ["completed", "return_requested", "exchange_requested"],
          "completed": ["return_requested", "exchange_requested"],
          "return_requested": ["return_approved", "return_rejected"],
          "return_approved": ["pickup_scheduled"],
          "exchange_requested": ["exchange_approved", "exchange_rejected"],
          "exchange_approved": ["pickup_scheduled"],
          "pickup_scheduled": ["picked_up"],
          "picked_up": ["returned", "shipped"], // returned (for return), shipped (for exchange new item)
        }

        const normalizedPrev = prevStatus.toLowerCase().replace(/ /g, "_")
        const normalizedNew = newStatus.toLowerCase().replace(/ /g, "_")
        
        const allowed = validTransitions[normalizedPrev] || []
        
        // Let admins override to cancelled anytime technically, or allow valid flow
        if (normalizedNew !== "cancelled" && !allowed.includes(normalizedNew)) {
          throw new Error(`Invalid workflow transition from ${prevStatus} to ${newStatus}`)
        }
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
      const updateData: any = {
        status: newStatus,
        paymentStatus: newPaymentStatus,
        updatedAt: new Date(),
      }

      if (newStatus.toLowerCase() === "shipped") updateData.shippedAt = new Date()
      if (newStatus.toLowerCase() === "delivered") updateData.deliveredAt = new Date()
      if (newStatus.toLowerCase() === "picked up" || newStatus.toLowerCase() === "picked_up") updateData.pickedUpAt = new Date()
      if (updates.pickupDate) updateData.pickupDate = new Date(updates.pickupDate)
      if (updates.estimatedDelivery) updateData.estimatedDelivery = new Date(updates.estimatedDelivery)

      const [updatedOrder] = await tx
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

      return updatedOrder
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
