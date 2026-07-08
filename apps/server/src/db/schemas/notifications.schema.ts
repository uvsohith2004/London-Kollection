import { pgTable, uuid, text, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core"

export const notification_log = pgTable("notification_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"), 
  event: text("event").notNull(),
  channel: text("channel", { enum: ["email", "sms", "push"] }).notNull(),
  recipient: text("recipient").notNull(),
  status: text("status", { enum: ["Sent", "Failed"] }).notNull().default("Sent"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const push_subscription = pgTable("push_subscription", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"), 
  endpoint: text("endpoint").notNull().unique(),
  keys: jsonb("keys").notNull(), 
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const campaign = pgTable("campaign", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  channel: text("channel", { enum: ["email", "push", "both"] }).notNull().default("both"),
  status: text("status", { enum: ["Draft", "Sent"] }).notNull().default("Draft"),
  sentCount: integer("sent_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
