import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core"
import { user } from "./auth.schema"
import { relations } from "drizzle-orm"

export const userHeatmap = pgTable("user_heatmap", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  categoryScores: jsonb("category_scores").default({}).notNull(),
  collectionScores: jsonb("collection_scores").default({}).notNull(),
  occasionScores: jsonb("occasion_scores").default({}).notNull(),
  lastCalculatedAt: timestamp("last_calculated_at").defaultNow().notNull(),
})

export const userHeatmapRelations = relations(userHeatmap, ({ one }) => ({
  user: one(user, {
    fields: [userHeatmap.userId],
    references: [user.id],
  }),
}))
