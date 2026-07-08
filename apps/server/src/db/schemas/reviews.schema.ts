import { pgTable, text, uuid, timestamp, index, integer, boolean, jsonb, unique, varchar } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { product } from "./products.schema"
import { user } from "./auth.schema"
import type { OptimizedImageAsset } from "./image.schema"

export const review = pgTable(
  "review",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), 
    title: text("title"),
    comment: text("comment"),
    images: jsonb("images").$type<OptimizedImageAsset[]>(),
    status: text("status").default("Pending").notNull(), // Pending, Approved, Rejected
    verifiedBuyer: boolean("verified_buyer").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("review_productId_idx").on(table.productId),
    index("review_status_idx").on(table.status),
  ]
)

export const reviewVote = pgTable(
  "review_vote",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => review.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    vote: integer("vote").notNull(), // 1 for upvote, -1 for downvote
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("review_vote_unique").on(table.reviewId, table.userId),
    index("review_vote_reviewId_idx").on(table.reviewId),
  ]
)

export const reviewRelations = relations(review, ({ one, many }) => ({
  product: one(product, {
    fields: [review.productId],
    references: [product.id],
  }),
  user: one(user, {
    fields: [review.userId],
    references: [user.id],
  }),
  votes: many(reviewVote),
}))

export const reviewVoteRelations = relations(reviewVote, ({ one }) => ({
  review: one(review, {
    fields: [reviewVote.reviewId],
    references: [review.id],
  }),
  user: one(user, {
    fields: [reviewVote.userId],
    references: [user.id],
  }),
}))
