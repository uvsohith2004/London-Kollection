import { NotFoundError } from "@/core/errors/http-errors";
import db from "@/db"
import { coupon } from "@/db/schemas"
import { eq } from "drizzle-orm"

export class CouponsService {
  async listCoupons() {
    return await db.query.coupon.findMany()
  }

  async getCouponByCode(code: string) {
    return await db.query.coupon.findFirst({
      where: eq(coupon.code, code),
    })
  }

  async createCoupon(data: any) {
    const [item] = await db
      .insert(coupon)
      .values({
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue.toString(),
        minPurchaseAmount: data.minPurchaseAmount.toString(),
        maxDiscountAmount: data.maxDiscountAmount ? data.maxDiscountAmount.toString() : null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        usageLimit: data.usageLimit,
      })
      .returning()
    return item
  }

  async updateCoupon(id: string, data: any) {
    const updateData: any = {}
    if (data.code !== undefined) updateData.code = data.code.toUpperCase()
    if (data.discountType !== undefined) updateData.discountType = data.discountType
    if (data.discountValue !== undefined) updateData.discountValue = data.discountValue.toString()
    if (data.minPurchaseAmount !== undefined) updateData.minPurchaseAmount = data.minPurchaseAmount.toString()
    if (data.maxDiscountAmount !== undefined) updateData.maxDiscountAmount = data.maxDiscountAmount ? data.maxDiscountAmount.toString() : null
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate)
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate)
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit
    if (data.active !== undefined) updateData.active = data.active
    
    updateData.updatedAt = new Date()

    const [item] = await db.update(coupon).set(updateData).where(eq(coupon.id, id)).returning()
    if (!item) throw new NotFoundError("Coupon not found")
    return item
  }
}
