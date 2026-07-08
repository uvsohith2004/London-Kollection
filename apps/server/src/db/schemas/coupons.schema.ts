import { pgTable, uuid, text, numeric, timestamp, integer, boolean } from "drizzle-orm/pg-core"

export const coupon = pgTable("coupon", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(),
  discountValue: numeric("discount_value").notNull(),
  minPurchaseAmount: numeric("min_purchase_amount").notNull().default("0"),
  maxDiscountAmount: numeric("max_discount_amount"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  usageLimit: integer("usage_limit").notNull().default(0), 
  usageCount: integer("usage_count").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
