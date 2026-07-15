import { NotFoundError, ConflictError } from "@/core/errors"
import db from "@/db"
import { returnRequest, order, orderTimeline } from "@/db/schemas"
import { eq, and, desc } from "drizzle-orm"

export class ReturnsService {
  async createReturnRequest(userId: string, data: {
    orderId: string
    returnType: string
    reason?: string
    images?: string[]
  }) {
    return await db.transaction(async (tx) => {
      // 1. Validate Order
      const targetOrder = await tx.query.order.findFirst({
        where: and(eq(order.id, data.orderId), eq(order.userId, userId)),
      })

      if (!targetOrder) {
        throw new NotFoundError("Order not found or does not belong to user")
      }

      if (targetOrder.status.toLowerCase() !== "delivered") {
        throw new Error("Returns can only be requested for delivered orders")
      }

      // Check if return request already exists
      const existingRequest = await tx.query.returnRequest.findFirst({
        where: eq(returnRequest.orderId, data.orderId)
      })

      if (existingRequest && existingRequest.status !== 'Rejected') {
        throw new ConflictError("A return request already exists for this order")
      }

      // 2. Create Return Request
      const [newReturn] = await tx.insert(returnRequest).values({
        orderId: data.orderId,
        userId: userId,
        status: "Pending",
        returnType: data.returnType,
        reason: data.reason,
        images: data.images ? data.images.map(url => ({ webp: { key: url, url } })) : null,
      }).returning()

      // 3. Log timeline event
      await tx.insert(orderTimeline).values({
        orderId: data.orderId,
        status: "Return Requested",
        description: `Return requested for reason: ${data.returnType}. Status: Pending.`,
        createdBy: userId,
      })

      return newReturn
    })
  }

  async getUserReturns(userId: string) {
    return await db.query.returnRequest.findMany({
      where: eq(returnRequest.userId, userId),
      orderBy: desc(returnRequest.createdAt),
      with: {
        order: true
      }
    })
  }

  async listAdminReturns() {
    return await db.query.returnRequest.findMany({
      orderBy: desc(returnRequest.createdAt),
      with: {
        order: true,
        user: {
          columns: { id: true, name: true, email: true }
        }
      }
    })
  }

  async updateReturnStatus(returnId: string, status: string, adminId: string, adminNotes?: string, pickupDate?: string) {
    return await db.transaction(async (tx) => {
      const currentReturn = await tx.query.returnRequest.findFirst({
        where: eq(returnRequest.id, returnId),
      })

      if (!currentReturn) {
        throw new NotFoundError("Return request not found")
      }

      const updateData: any = {
        status,
        updatedAt: new Date()
      }
      
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
      if (pickupDate) updateData.pickupDate = new Date(pickupDate);
      if (status.toLowerCase() === 'picked_up') {
        updateData.pickedUpAt = new Date();
      }

      const [updated] = await tx.update(returnRequest).set(updateData).where(eq(returnRequest.id, returnId)).returning()

      await tx.insert(orderTimeline).values({
        orderId: currentReturn.orderId,
        status: `Return ${status}`,
        description: `Return request marked as ${status}.${adminNotes ? ` Admin Notes: ${adminNotes}` : ''}${pickupDate ? ` Pickup scheduled for: ${new Date(pickupDate).toLocaleDateString()}` : ''}`,
        createdBy: adminId,
      })

      if (status === 'Approved') {
          // If approved, update order status to Returned
          await tx.update(order).set({
              status: 'Returned',
              updatedAt: new Date()
          }).where(eq(order.id, currentReturn.orderId))
      }

      return updated
    })
  }

  async cancelReturnRequest(userId: string, returnId: string) {
    return await db.transaction(async (tx) => {
      const currentReturn = await tx.query.returnRequest.findFirst({
        where: and(eq(returnRequest.id, returnId), eq(returnRequest.userId, userId)),
      })

      if (!currentReturn) {
        throw new NotFoundError("Return request not found")
      }

      if (currentReturn.pickedUpAt || currentReturn.status.toLowerCase() === 'picked_up') {
        throw new Error("Cannot cancel return request after it has been picked up")
      }

      const [updated] = await tx.update(returnRequest).set({
        status: "Cancelled",
        updatedAt: new Date()
      }).where(eq(returnRequest.id, returnId)).returning()

      await tx.insert(orderTimeline).values({
        orderId: currentReturn.orderId,
        status: "Return Cancelled",
        description: "User cancelled the return request.",
        createdBy: userId,
      })

      // We should probably revert order status if it was "Returned" or something, but typically it would just fall back to delivered, or we just leave it Delivered since return is cancelled.
      // Wait, if it was Approved, the order status became "Returned".
      if (currentReturn.status === 'Approved') {
        await tx.update(order).set({
          status: 'Delivered',
          updatedAt: new Date()
        }).where(eq(order.id, currentReturn.orderId))
      }

      return updated
    })
  }
}
