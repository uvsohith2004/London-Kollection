import { pgTable, uuid, timestamp, index, integer, boolean } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { collection } from "./collections.schema"

export const featuredCollection = pgTable(
  "featured_collection",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collection.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("featured_collection_sort_order_idx").on(table.sortOrder),
    index("featured_collection_is_active_idx").on(table.isActive),
  ]
)

export const featuredCollectionRelations = relations(featuredCollection, ({ one }) => ({
  collection: one(collection, {
    fields: [featuredCollection.collectionId],
    references: [collection.id],
  }),
}))
