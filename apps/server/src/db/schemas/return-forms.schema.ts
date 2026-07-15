import { pgTable, text, uuid, timestamp, jsonb, integer } from "drizzle-orm/pg-core"

export const returnForm = pgTable(
  "return_form",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    schema: jsonb("schema").notNull(), // The array of fields config
    version: integer("version").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }
)
