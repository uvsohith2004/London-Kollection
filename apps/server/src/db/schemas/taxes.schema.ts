import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  numeric,
  index,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const taxClass = pgTable("tax_class", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(), // e.g. "Standard", "Luxury", "Zero-rated"
  description: text("description"),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const taxRate = pgTable(
  "tax_rate",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    countryCode: text("country_code").notNull(),
    region: text("region"),
    percentage: numeric("percentage", { precision: 5, scale: 3 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("tax_rate_country_idx").on(table.countryCode)]
)

export const taxRule = pgTable(
  "tax_rule",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    taxClassId: uuid("tax_class_id")
      .notNull()
      .references(() => taxClass.id, { onDelete: "cascade" }),
    taxRateId: uuid("tax_rate_id")
      .notNull()
      .references(() => taxRate.id, { onDelete: "cascade" }),
    effectiveFrom: timestamp("effective_from").defaultNow().notNull(),
    effectiveTo: timestamp("effective_to"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("tax_rule_taxClassId_idx").on(table.taxClassId),
    index("tax_rule_taxRateId_idx").on(table.taxRateId),
  ]
)

export const taxClassRelations = relations(taxClass, ({ many }) => ({
  rules: many(taxRule),
}))

export const taxRateRelations = relations(taxRate, ({ many }) => ({
  rules: many(taxRule),
}))

export const taxRuleRelations = relations(taxRule, ({ one }) => ({
  taxClass: one(taxClass, {
    fields: [taxRule.taxClassId],
    references: [taxClass.id],
  }),
  taxRate: one(taxRate, {
    fields: [taxRule.taxRateId],
    references: [taxRate.id],
  }),
}))
