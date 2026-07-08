import { pgTable, text, uuid, timestamp, index, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth.schema";
import { order } from "./orders.schema";

export const ticket = pgTable(
  "ticket",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    orderId: uuid("order_id").references(() => order.id, { onDelete: "set null" }),
    subject: text("subject").notNull(),
    description: text("description").notNull(),
    status: text("status").default("open").notNull(), 
    priority: text("priority").default("medium").notNull(), 
    category: text("category").notNull(), 
    callRequested: boolean("call_requested").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("ticket_userId_idx").on(table.userId),
    index("ticket_orderId_idx").on(table.orderId),
    index("ticket_status_idx").on(table.status),
  ]
);

export const ticketMessage = pgTable(
  "ticket_message",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => ticket.id, { onDelete: "cascade" }),
    senderType: text("sender_type").notNull(), // user, agent, bot
    senderId: text("sender_id"), // if user or agent, their ID
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("ticket_message_ticketId_idx").on(table.ticketId),
  ]
);

export const ticketRelations = relations(ticket, ({ one, many }) => ({
  user: one(user, {
    fields: [ticket.userId],
    references: [user.id],
  }),
  order: one(order, {
    fields: [ticket.orderId],
    references: [order.id],
  }),
  messages: many(ticketMessage),
}));

export const ticketMessageRelations = relations(ticketMessage, ({ one }) => ({
  ticket: one(ticket, {
    fields: [ticketMessage.ticketId],
    references: [ticket.id],
  }),
}));
