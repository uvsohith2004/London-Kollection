import { pgTable, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core"

export const setting = pgTable("setting", {
  id: text("id").primaryKey().default("global"),
  defaultCurrency: text("default_currency").default("KWD"),
  orderPrefix: text("order_prefix"),
  logoUrl: jsonb("logo_url"),
  logoDarkUrl: jsonb("logo_dark_url"),
  siteName: text("site_name"),
  shippingProvider: text("shipping_provider").default("none").notNull(),
  shippingCredentials: jsonb("shipping_credentials"),
  address: text("address"),
  supportEmail: text("support_email"),
  supportPhone: text("support_phone"),
  crNumber: text("cr_number"),
  vatNumber: text("vat_number"),
  defaultReturnWindow: integer("default_return_window").default(14).notNull(),
  defaultExchangeWindow: integer("default_exchange_window").default(30).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
