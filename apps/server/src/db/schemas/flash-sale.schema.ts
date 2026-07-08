import { pgTable, text, uuid, timestamp, index, integer, boolean, numeric, varchar } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { product } from "./products.schema"

export const flashSale = pgTable(
  "flash_sale",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    isActive: boolean("is_active").default(false).notNull(),
    scheduleStart: timestamp("schedule_start"),
    scheduleEnd: timestamp("schedule_end"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }
)

export const flashSaleItem = pgTable(
  "flash_sale_item",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    flashSaleId: uuid("flash_sale_id")
      .notNull()
      .references(() => flashSale.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    flashPrice: numeric("flash_price", { precision: 12, scale: 3 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("flash_sale_item_flashSaleId_idx").on(table.flashSaleId),
    index("flash_sale_item_productId_idx").on(table.productId),
    index("flash_sale_item_sortOrder_idx").on(table.sortOrder),
  ]
)

export const flashSaleRelations = relations(flashSale, ({ many }) => ({
  items: many(flashSaleItem),
}))

export const flashSaleItemRelations = relations(flashSaleItem, ({ one }) => ({
  flashSale: one(flashSale, {
    fields: [flashSaleItem.flashSaleId],
    references: [flashSale.id],
  }),
  product: one(product, {
    fields: [flashSaleItem.productId],
    references: [product.id],
  }),
}))
