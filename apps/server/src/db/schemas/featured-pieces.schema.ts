import { pgTable, uuid, timestamp, index, integer, boolean, varchar } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { product } from "./products.schema"

export const featuredPiece = pgTable(
  "featured_piece",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("featured_piece_sort_order_idx").on(table.sortOrder),
    index("featured_piece_is_active_idx").on(table.isActive),
  ]
)

export const featuredPieceRelations = relations(featuredPiece, ({ one }) => ({
  product: one(product, {
    fields: [featuredPiece.productId],
    references: [product.id],
  }),
}))
