import { NotFoundError } from "@/core/errors"
import { createActor } from "xstate";
import { chatMachine } from "./machine";
import { ChatSessionContext } from "../types";
import db from "@/db";
import { chatSession, chatMessage } from "@/db/schemas/chatbot.schema";
import { eq } from "drizzle-orm";

export class StateManager {
  public async loadSession(sessionId: string): Promise<any> {
    const sessionRecord = await db.query.chatSession.findFirst({
      where: eq(chatSession.id, sessionId),
    });

    if (!sessionRecord) {
      throw new NotFoundError("Session not found");
    }

    return sessionRecord;
  }

  public async processEvent(sessionId: string, event: any, services: any, actions: any): Promise<any> {
    const sessionRecord = await this.loadSession(sessionId);
    
    // Merge context from DB
    const initialContext: ChatSessionContext = {
      ...sessionRecord.contextData,
      sessionId: sessionRecord.id,
      userId: sessionRecord.userId || undefined,
    } as unknown as ChatSessionContext;

    // Create the actor
    const actor = createActor(
      chatMachine.provide({
        actors: services,
        actions: actions,
      }),
      { 
        state: {
           value: sessionRecord.currentState,
           context: initialContext,
        } as any // Hydrating state from DB
      }
    );

    // Collect responses sent during actions
    const responses: string[] = [];

    actor.start();

    // Send the event to the machine
    actor.send(event);

    const snapshot = actor.getSnapshot();

    // Persist new state and context to DB
    await db.update(chatSession)
      .set({
        currentState: snapshot.value as string,
        contextData: snapshot.context,
      })
      .where(eq(chatSession.id, sessionId));

    return {
      state: snapshot.value,
      context: snapshot.context,
      responses, // Actions would populate this array somehow or we just emit events.
    };
  }
}
