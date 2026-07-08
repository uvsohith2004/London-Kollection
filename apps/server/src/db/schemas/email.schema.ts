import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core"

export const emailProviderHealth = pgTable("email_provider_health", {
  provider: text("provider").primaryKey(), // 'resend', 'ses', 'nodemailer'
  status: text("status").notNull().default("healthy"), // 'healthy', 'degraded', 'down'
  totalSent: integer("total_sent").notNull().default(0),
  totalFailures: integer("total_failures").notNull().default(0),
  averageResponseTimeMs: integer("average_response_time_ms").notNull().default(0),
  lastSuccessfulSend: timestamp("last_successful_send"),
  lastFailedSend: timestamp("last_failed_send"),
  lastErrorMessage: text("last_error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const emailLog = pgTable("email_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  toAddress: text("to_address").notNull(),
  subject: text("subject").notNull(),
  providerUsed: text("provider_used").notNull(),
  status: text("status").notNull(), // 'success', 'failed', 'retried'
  errorMessage: text("error_message"),
  responseTimeMs: integer("response_time_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
