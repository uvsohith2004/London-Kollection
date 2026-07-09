import { pgTable, text, uuid, timestamp, index, boolean } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { user } from "./auth.schema"

export const address = pgTable(
  "address",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    country: text("country").notNull(),
    state: text("state").notNull(),
    city: text("city").notNull(),
    postalCode: text("postal_code").notNull(),
    landmark: text("landmark"),
    addressLine1: text("address_line_1").notNull(),
    addressLine2: text("address_line_2"),
    type: text("type").default("shipping").notNull(), // shipping, billing
    default: boolean("default").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("address_userId_idx").on(table.userId),
  ]
)

export const addressRelations = relations(address, ({ one }) => ({
  user: one(user, {
    fields: [address.userId],
    references: [user.id],
  }),
}))
