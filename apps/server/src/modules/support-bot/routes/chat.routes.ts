import { BadRequestError, InternalServerError, NotFoundError } from "@/core/errors"
import { requireAuth, AppEnv } from "@/core/middleware"
import { ok, fail } from "@/core/response"
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import db from "@/db";
import { chatSession, chatMessage } from "@/db/schemas/chatbot.schema";
import { eq } from "drizzle-orm";
import { StateManager } from "../engine/stateManager";
import { IntentDetectionService } from "../intents/intentDetection.service";
import { FAQSearchService } from "../services/faqSearch.service";

export const chatRouter = new Hono<AppEnv>();

// In a real application, these would be loaded from the database on startup or periodically
const intentsService = new IntentDetectionService([]);
const faqService = new FAQSearchService([]);
const stateManager = new StateManager();

chatRouter.use("*", requireAuth);

// Start a new chat session
chatRouter.post("/start", async (c) => {
  const user = c.get("user")!;

  try {
    const [newSession] = await db
      .insert(chatSession)
      .values({
        userId: user.id,
        currentState: "idle",
        contextData: { history: [] },
      })
      .returning();

    return c.json({
      success: true,
      sessionId: newSession.id,
      message: "Hello! I am your support assistant. How can I help you today?",
    });
  } catch (error) {
    console.error("Error starting chat session:", error);
    throw new InternalServerError("Internal server error" );
  }
});

// Process a message
chatRouter.post(
  "/message",
  zValidator(
    "json",
    z.object({
      sessionId: z.string().min(1),
      message: z.string().min(1, "Message is required"),
    })
  ),
  async (c) => {
    const { sessionId, message } = c.req.valid("json");
    const user = c.get("user")!;

    try {
      // 1. Detect Intent
      const { intent, score } = intentsService.detectIntent(message);

      // 2. Save user message to DB
      await db.insert(chatMessage).values({
        sessionId,
        sender: "user",
        message,
        intent: intent?.name,
        confidence: score.toString(),
      });

      // 3. Define services and actions for XState
      const services = {
        searchFaq: async (context: any, event: any) => {
           const result = faqService.searchFAQ(message);
           if (!result.faq) throw new BadRequestError("No FAQ found");
           return result;
        },
        evaluateRules: async (context: any) => {
           return { isEligible: true, events: [] }; // Mocked for now
        },
        createTicket: async (context: any) => {
           // Calls ticket creation logic
           return { ticketId: "TICKET-123" };
        }
      };

      let responses: string[] = [];
      const actions = {
        sendFaqResponse: (context: any, event: any) => {
            responses.push(event.output.faq.answer);
        },
        sendUnknownResponse: () => {
            responses.push("I'm not sure I understand. Could you rephrase or would you like to speak to a human?");
        },
        askForMissingInfo: () => {
            responses.push("Please provide your order ID and the issue category.");
        },
        sendSuccessResponse: () => {
            responses.push("Your request meets our rules and has been approved!");
        },
        sendIneligibleResponse: () => {
            responses.push("Unfortunately, your request does not meet our policy criteria. Transferring to an agent...");
        },
        sendTicketResponse: (context: any, event: any) => {
            responses.push(`A support ticket has been created for you. Ticket ID: ${event.output.ticketId}`);
        },
        sendErrorResponse: () => {
            responses.push("An error occurred while processing your request.");
        },
        logError: () => {
            console.error("XState error in child invocation");
        }
      };

      // 4. Process through State Manager
      const result = await stateManager.processEvent(
        sessionId,
        { type: "RECEIVE_MESSAGE", message, intent },
        services,
        actions
      );

      // If XState didn't emit responses via actions, provide a fallback.
      if (responses.length === 0) {
          responses.push("Processing your request...");
      }

      // 5. Save bot responses
      for (const reply of responses) {
        await db.insert(chatMessage).values({
          sessionId,
          sender: "bot",
          message: reply,
        });
      }

      return c.json({
        success: true,
        responses,
        state: result.state,
      });

    } catch (error: any) {
      console.error("Error processing message:", error);
      throw new InternalServerError(error.message || "Internal server error" );
    }
  }
);

// Get Chat History
chatRouter.get("/history/:sessionId", async (c) => {
  const sessionId = c.req.param("sessionId");
  const user = c.get("user")!;

  try {
    const session = await db.query.chatSession.findFirst({
      where: eq(chatSession.id, sessionId),
    });

    if (!session || session.userId !== user.id) {
      throw new NotFoundError("Session not found" );
    }

    const messages = await db.query.chatMessage.findMany({
      where: eq(chatMessage.sessionId, sessionId),
      orderBy: (m, { asc }) => [asc(m.createdAt)],
    });

    return c.json(ok(messages));
  } catch (error) {
    throw new InternalServerError("Internal server error" );
  }
});
