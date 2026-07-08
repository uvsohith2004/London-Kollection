import { pgTable, text, uuid, timestamp, index, varchar } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { user } from "./auth.schema"
import { product, productVariant } from "./products.schema"

export const wishlist = pgTable(
  "wishlist",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    variantId: varchar("variant_id", { length: 36 }).references(() => productVariant.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("wishlist_userId_idx").on(table.userId),
    index("wishlist_productId_idx").on(table.productId),
  ]
)

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(user, {
    fields: [wishlist.userId],
    references: [user.id],
  }),
  product: one(product, {
    fields: [wishlist.productId],
    references: [product.id],
  }),
  variant: one(productVariant, {
    fields: [wishlist.variantId],
    references: [productVariant.id],
  }),
}))
