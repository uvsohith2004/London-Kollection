import {
  pgTable,
  text,
  uuid,
  timestamp,
  index,
  jsonb,
  boolean,
  integer,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import type { OptimizedImageAsset } from "./image.schema"

export const category = pgTable(
  "category",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    image: jsonb("image").$type<OptimizedImageAsset>(),
    icon: jsonb("icon").$type<OptimizedImageAsset>(),
    description: text("description"),
    parentId: uuid("parent_id"),
    path: text("path"),
    level: integer("level").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    seoKeywords: text("seo_keywords").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("category_slug_idx").on(table.slug),
    index("category_parent_id_idx").on(table.parentId),
  ]
)

export const categoryRelations = relations(category, ({ one, many }) => ({
  parent: one(category, {
    fields: [category.parentId],
    references: [category.id],
    relationName: "category_parent",
  }),
  children: many(category, {
    relationName: "category_parent",
  }),
}))
