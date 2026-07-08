import { pgTable, text, uuid, timestamp, index, integer, boolean, jsonb } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import type { OptimizedImageAsset } from "./image.schema"

export const occasion = pgTable(
  "occasion",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    image: jsonb("image").$type<OptimizedImageAsset>(),
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
    index("occasion_slug_idx").on(table.slug),
    index("occasion_is_active_idx").on(table.isActive),
  ]
)

import { productOccasion } from "./products.schema"

export const occasionRelations = relations(occasion, ({ many }) => ({
  products: many(productOccasion),
}))
