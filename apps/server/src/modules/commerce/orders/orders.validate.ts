import { z } from "zod"

export const UpdateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "returned",
    "refunded",
    "rescheduled",
    "return_requested",
    "return_approved",
    "return_rejected",
    "exchange_requested",
    "exchange_approved",
    "exchange_rejected",
    "ready_for_pickup",
    "pickup_successful",
    "pickup_failed",
  ]).optional(),
  description: z.string().optional(),
})
