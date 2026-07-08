import { createMachine, assign } from "xstate";
import { ChatSessionContext } from "../types";

export const chatMachine = createMachine(
  {
    id: "support-bot",
    initial: "idle",
    context: {
      sessionId: "",
      collectedVariables: {},
      history: [],
    } as ChatSessionContext,
    states: {
      idle: {
        on: {
          RECEIVE_MESSAGE: [
            {
              target: "faq_search",
              guard: "isGeneralQuery",
            },
            {
              target: "collecting_info",
              guard: "isSpecificIssue",
            },
            {
              target: "idle",
              actions: ["addMessageToHistory", "sendUnknownResponse"],
            },
          ],
          REQUEST_HUMAN: "ticket_creation",
        },
      },
      faq_search: {
        invoke: {
          src: "searchFaq",
          onDone: {
            target: "idle",
            actions: ["sendFaqResponse"],
          },
          onError: {
            target: "ticket_creation",
            actions: ["logError"],
          },
        },
      },
      collecting_info: {
        on: {
          RECEIVE_MESSAGE: [
            {
              target: "rule_evaluation",
              guard: "hasAllRequiredInfo",
            },
            {
              target: "collecting_info",
              actions: ["askForMissingInfo", "addMessageToHistory"],
            },
          ],
          CANCEL: "idle",
        },
      },
      rule_evaluation: {
        invoke: {
          src: "evaluateRules",
          onDone: [
            {
              target: "idle",
              guard: "isEligible",
              actions: ["sendSuccessResponse"],
            },
            {
              target: "ticket_creation",
              actions: ["sendIneligibleResponse"],
            }
          ],
          onError: "ticket_creation",
        },
      },
      ticket_creation: {
        invoke: {
          src: "createTicket",
          onDone: {
            target: "end",
            actions: ["sendTicketResponse", "saveTicketId"],
          },
          onError: {
            target: "end",
            actions: ["sendErrorResponse"],
          },
        },
      },
      end: {
        type: "final",
      },
    },
  },
  {
    actions: {
      addMessageToHistory: assign({
        history: ({ context, event }) => {
          if (event.type === 'RECEIVE_MESSAGE') {
             return [...context.history, { sender: "user", message: (event as any).message }];
          }
          return context.history;
        }
      }),
      // These action implementations will be injected when the machine is started
    },
    guards: {
      isGeneralQuery: ({ event }) => (event as any).intent?.action === "search_faq",
      isSpecificIssue: ({ event }) => (event as any).intent?.action === "workflow",
      hasAllRequiredInfo: ({ context }) => !!context.orderId && !!context.issueCategory,
      isEligible: ({ event }) => (event as any).output?.isEligible === true,
    },
  }
);
