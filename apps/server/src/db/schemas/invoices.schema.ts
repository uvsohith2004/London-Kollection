import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core"
import { order } from "./orders.schema"

export const invoice = pgTable("invoice", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => order.id).notNull().unique(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  pdfUrl: text("pdf_url"),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
  status: text("status").notNull().default("Unpaid"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
