import type { Coupon } from "@workspace/api-contracts"

export function transformCoupon(raw: any): Coupon {
  return raw as Coupon
}

export function transformCouponList(raw: any): Coupon {
  return transformCoupon(raw)
}
