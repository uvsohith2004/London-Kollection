import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core"

export const setting = pgTable("setting", {
  id: text("id").primaryKey().default("global"),
  defaultCurrency: text("default_currency").default("GBP"),
  orderPrefix: text("order_prefix"),
  logoUrl: jsonb("logo_url"),
  logoDarkUrl: jsonb("logo_dark_url"),
  siteName: text("site_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
