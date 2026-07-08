import { pgTable, text, uuid, timestamp, index, jsonb, boolean, integer } from "drizzle-orm/pg-core"
import type { OptimizedImageAsset } from "./image.schema"


export const collection = pgTable(
  "collection",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    image: jsonb("image").$type<OptimizedImageAsset>(),
    icon: text("icon"),
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
    index("collection_slug_idx").on(table.slug),
  ]
)
