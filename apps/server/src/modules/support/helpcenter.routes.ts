import { ok } from "@/core/response"
import { BadRequestError } from "@/core/errors"
import { requireAuth, AppEnv } from "@/core/middleware"
import { logger } from "@/core/utils/logger"
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import db from "@/db"
import { ticket, ticketMessage } from "@/db/schemas/support.schema";
import { eq } from "drizzle-orm";

const app = new Hono<AppEnv>();


app.get("/tickets", requireAuth, async (c) => {
  const user = c.get("user")!;
  const tickets = await db.query.ticket.findMany({
    where: eq(ticket.userId, user.id),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  return c.json(ok(tickets));
});

// Create a new ticket
app.post(
  "/tickets",
  requireAuth,
  zValidator(
    "json",
    z.object({
      subject: z.string().min(1, "Subject is required"),
      description: z.string().min(1, "Description is required"),
      orderId: z.string().min(1).optional(),
      category: z.string().min(1, "Category is required"),
      callRequested: z.boolean().default(false),
    })
  ),
  async (c) => {
    const user = c.get("user")!;
    const body = c.req.valid("json");

    // Validate call requests: Only allowed for payment or delayed delivery
    const allowedCallCategories = ["payment_issue", "delayed_delivery"];
    if (body.callRequested && !allowedCallCategories.includes(body.category)) {
      throw new BadRequestError("Call requests are only available for payment or delivery delay issues.");
    }

    const [newTicket] = await db
      .insert(ticket)
      .values({
        userId: user.id,
        orderId: body.orderId,
        subject: body.subject,
        description: body.description,
        category: body.category,
        callRequested: body.callRequested,
        status: "open",
      })
      .returning();

    // Add the initial message
    await db.insert(ticketMessage).values({
      ticketId: newTicket.id,
      senderType: "user",
      senderId: user.id,
      message: body.description,
    });

    return c.json(ok({ ticket: newTicket }), 201);
  }
);

// Add a message to an existing ticket (Used by chatbot internally)
app.post(
  "/tickets/:id/messages",
  requireAuth,
  zValidator(
    "json",
    z.object({
      message: z.string().min(1, "Message cannot be empty"),
    })
  ),
  async (c) => {
    const user = c.get("user")!;
    const ticketId = c.req.param("id");
    const { message } = c.req.valid("json");

    // Verify ownership
    const existingTicket = await db.query.ticket.findFirst({
      where: eq(ticket.id, ticketId),
    });

    if (!existingTicket || existingTicket.userId !== user.id) {
      throw new BadRequestError("Ticket not found or access denied");
    }

    const [newMessage] = await db
      .insert(ticketMessage)
      .values({
        ticketId,
        senderType: "user",
        senderId: user.id,
        message,
      })
      .returning();

    return c.json(ok({ message: newMessage }), 201);
  }
);

export const helpCenterRouter = app;
