import { pgTable, text, uuid, timestamp, index, jsonb, integer } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { order } from "./orders.schema"
import { user } from "./auth.schema"
import type { OptimizedImageAsset } from "./image.schema"

export const returnRequest = pgTable(
  "return_request",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").default("Pending").notNull(), // Pending, Approved, Rejected
    returnType: text("return_type").notNull(),
    reason: text("reason"),
    images: jsonb("images").$type<OptimizedImageAsset[]>(), // Array of optimized image assets
    formData: jsonb("form_data"),
    returnFormVersion: integer("return_form_version"),
    adminNotes: text("admin_notes"),
    pickupDate: timestamp("pickup_date"),
    pickedUpAt: timestamp("picked_up_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("return_request_orderId_idx").on(table.orderId),
    index("return_request_userId_idx").on(table.userId),
    index("return_request_status_idx").on(table.status),
  ]
)

export const returnRequestRelations = relations(returnRequest, ({ one }) => ({
  order: one(order, {
    fields: [returnRequest.orderId],
    references: [order.id],
  }),
  user: one(user, {
    fields: [returnRequest.userId],
    references: [user.id],
  }),
}))
