import { pgTable, text, uuid, timestamp, index, integer, boolean, jsonb } from "drizzle-orm/pg-core"
import type { OptimizedImageAsset } from "./image.schema"
import type { OptimizedVideoAsset } from "./video.schema"

export const heroCarousel = pgTable(
  "hero_carousel",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    image: jsonb("image_url").$type<OptimizedImageAsset>(),
    video: jsonb("video_url").$type<OptimizedVideoAsset>(),
    mediaType: text("media_type").$type<"image" | "video">().default("image").notNull(),
    title: text("title"),
    description: text("description"),
    buttonText: text("button_text"),
    linkUrl: text("link_url"),
    published: boolean("published").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    scheduleStart: timestamp("schedule_start"),
    scheduleEnd: timestamp("schedule_end"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("hero_carousel_sort_order_idx").on(table.sortOrder),
    index("hero_carousel_published_idx").on(table.published),
  ]
)
