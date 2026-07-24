import {
  pgTable,
  text,
  uuid,
  timestamp,
  index,
  boolean,
  jsonb,
  integer,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import type { OptimizedImageAsset } from "./image.schema"

export const brand = pgTable(
  "brand",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    website: text("website"),
    image: jsonb("image").$type<OptimizedImageAsset>(),
    description: text("description"),
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
    index("brand_slug_idx").on(table.slug),
    index("brand_is_active_idx").on(table.isActive),
  ]
)

import { product } from "./products.schema"

export const brandRelations = relations(brand, ({ many }) => ({
  products: many(product),
}))
