import { z } from "zod"

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded"
  | "rescheduled"
  | "return_requested"
  | "return_approved"
  | "return_rejected"
  | "exchange_requested"
  | "exchange_approved"
  | "exchange_rejected"
  | "ready_for_pickup"
  | "pickup_successful"
  | "pickup_failed"

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded"

export type PaymentMethod = "cash_on_delivery" | "manual"

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  variantId: z.string().uuid(),
  quantity: z.number().int(),
  priceAtPurchase: z.string().or(z.number()),
  discountAtPurchase: z.string().or(z.number()),
  productMetadata: z.any().nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  product: z.any().optional().nullable(),
})

export type OrderItem = z.infer<typeof OrderItemSchema>

export const OrderTimelineSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  status: z.string(),
  description: z.string(),
  createdBy: z.string(),
  createdAt: z.string().or(z.date()),
})

export type OrderTimeline = z.infer<typeof OrderTimelineSchema>

export const OrderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().nullable().optional(),
  orderNumber: z.string(),
  status: z.string(),
  paymentStatus: z.string(),
  paymentMethod: z.string(),
  totalAmount: z.string().or(z.number()),
  taxAmount: z.string().or(z.number()),
  shippingAmount: z.string().or(z.number()),
  discountAmount: z.string().or(z.number()),
  couponCode: z.string().nullable().optional(),
  shippingAddress: z.any(),
  billingAddress: z.any().nullable().optional(),
  giftNote: z.string().nullable().optional(),
  cancellationReason: z.string().nullable().optional(),
  cancelledAt: z.string().or(z.date()).nullable().optional(),
  cancelledBy: z.string().nullable().optional(),
  estimatedDelivery: z.string().or(z.date()).nullable().optional(),
  pickupDate: z.string().or(z.date()).nullable().optional(),
  pickedUpAt: z.string().or(z.date()).nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  items: z.array(OrderItemSchema).optional(),
  timeline: z.array(OrderTimelineSchema).optional(),
})

export type Order = z.infer<typeof OrderSchema>

export const UpdateOrderStatusSchema = z.object({
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  description: z.string().optional(),
  pickupDate: z.string().optional(),
  estimatedDelivery: z.string().optional(),
})

export type UpdateOrderStatusDTO = z.infer<typeof UpdateOrderStatusSchema>

export const CancelOrderSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
})

export type CancelOrderDTO = z.infer<typeof CancelOrderSchema>

export interface PaginatedOrdersResponse {
  items: Order[];
  hasMore: boolean;
  total: number;
  counts: {
    all: number;
    pending: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  nextCursor: number | null;
}

export const AdminOrdersQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(25),
  search: z.string().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  paymentMethod: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

export type AdminOrdersQueryDTO = z.infer<typeof AdminOrdersQuerySchema>

export const BulkOrderOperationsSchema = z.object({
  orderIds: z.array(z.string().uuid()),
  action: z.enum(["export", "download_invoices", "print_packing_slips"]),
})

export type BulkOrderOperationsDTO = z.infer<typeof BulkOrderOperationsSchema>
