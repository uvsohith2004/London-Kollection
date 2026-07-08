import { pgTable, text, uuid, timestamp, index, integer, numeric, jsonb, varchar } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { user } from "./auth.schema"
import { product, productVariant } from "./products.schema"

export const order = pgTable(
  "order",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "set null" }), 
    orderNumber: text("order_number").notNull().unique(),
    status: text("status").default("pending").notNull(),
    paymentStatus: text("payment_status").default("pending").notNull(),
    paymentMethod: text("payment_method").default("manual").notNull(),
    
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    shippingAmount: numeric("shipping_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    couponCode: text("coupon_code"),

    shippingAddress: jsonb("shipping_address").notNull(),
    billingAddress: jsonb("billing_address"),
    giftNote: text("gift_note"),

    estimatedDelivery: timestamp("estimated_delivery"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("order_userId_idx").on(table.userId),
    index("order_orderNumber_idx").on(table.orderNumber),
    index("order_status_idx").on(table.status),
    index("order_createdAt_idx").on(table.createdAt),
  ]
)

export const orderItem = pgTable(
  "order_item",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 36 })
      .references(() => product.id, { onDelete: "set null" }),
    variantId: varchar("variant_id", { length: 36 })
      .references(() => productVariant.id, { onDelete: "set null" }),
    quantity: integer("quantity").notNull(),
    priceAtPurchase: numeric("price_at_purchase", { precision: 12, scale: 2 }).notNull(),
    discountAtPurchase: numeric("discount_at_purchase", { precision: 12, scale: 2 }).default("0.00").notNull(),
    productMetadata: jsonb("product_metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("order_item_orderId_idx").on(table.orderId),
  ]
)

export const orderTimeline = pgTable(
  "order_timeline",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    description: text("description").notNull(),
    createdBy: text("created_by").notNull(), 
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("order_timeline_orderId_idx").on(table.orderId),
  ]
)

export const orderRelations = relations(order, ({ one, many }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  items: many(orderItem),
  timeline: many(orderTimeline),
}))

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, {
    fields: [orderItem.orderId],
    references: [order.id],
  }),
  product: one(product, {
    fields: [orderItem.productId],
    references: [product.id],
  }),
  variant: one(productVariant, {
    fields: [orderItem.variantId],
    references: [productVariant.id],
  }),
}))

export const orderTimelineRelations = relations(orderTimeline, ({ one }) => ({
  order: one(order, {
    fields: [orderTimeline.orderId],
    references: [order.id],
  }),
}))
