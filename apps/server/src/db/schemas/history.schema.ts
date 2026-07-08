import { pgTable, text, uuid, timestamp, integer, boolean, uniqueIndex, varchar } from "drizzle-orm/pg-core"
import { user } from "./auth.schema"
import { product } from "./products.schema"
import { relations } from "drizzle-orm"

export const userProductHistory = pgTable(
  "user_product_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    viewCount: integer("view_count").default(1).notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    lastViewedAt: timestamp("last_viewed_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_product_history_user_product_idx").on(table.userId, table.productId),
  ]
)

export const userProductHistoryRelations = relations(userProductHistory, ({ one }) => ({
  user: one(user, {
    fields: [userProductHistory.userId],
    references: [user.id],
  }),
  product: one(product, {
    fields: [userProductHistory.productId],
    references: [product.id],
  }),
}))

export const userSearchHistory = pgTable(
  "user_search_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    searchTerm: text("search_term").notNull(),
    searchCount: integer("search_count").default(1).notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    lastSearchedAt: timestamp("last_searched_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_search_history_user_term_idx").on(table.userId, table.searchTerm),
  ]
)

export const userSearchHistoryRelations = relations(userSearchHistory, ({ one }) => ({
  user: one(user, {
    fields: [userSearchHistory.userId],
    references: [user.id],
  }),
}))
