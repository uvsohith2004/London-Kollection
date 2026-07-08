import db from "@/db";
import { chatIntent, faqArticle, policy } from "@/db/schemas/chatbot.schema";

export async function seedChatbotData() {
  console.log("Seeding chatbot intents...");
  await db.insert(chatIntent).values([
    {
      name: "request_refund",
      description: "User wants to request a refund for an order",
      keywords: ["refund", "money back", "return money"],
      action: "workflow",
    },
    {
      name: "order_status",
      description: "User wants to know where their order is",
      keywords: ["track order", "where is my order", "order status", "shipping status", "delayed delivery"],
      action: "workflow",
    },
    {
      name: "general_faq",
      description: "User asks a general question",
      keywords: ["how to", "policy", "question", "faq", "help"],
      action: "search_faq",
    },
  ]).onConflictDoNothing();

  console.log("Seeding FAQs...");
  await db.insert(faqArticle).values([
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days. Expedited shipping takes 1-2 business days.",
      keywords: ["shipping time", "how long", "delivery time", "shipping speed"],
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to over 50 countries worldwide. Shipping fees and times vary by location.",
      keywords: ["international", "worldwide", "ship abroad"],
    },
    {
      question: "How can I contact a human agent?",
      answer: "You can request to speak to an agent at any time by typing 'talk to human' or selecting the option from the menu.",
      keywords: ["human", "agent", "person", "representative", "support team"],
    }
  ]).onConflictDoNothing();

  console.log("Seeding Policies...");
  await db.insert(policy).values([
    {
      name: "refund_policy",
      description: "Standard refund policy allowing refunds within 30 days of purchase.",
      rules: {
        conditions: {
          all: [
            {
              fact: "daysSincePurchase",
              operator: "lessThanInclusive",
              value: 30
            }
          ]
        },
        event: {
          type: "refund_eligible",
          params: {
            message: "You are eligible for a refund."
          }
        }
      }
    }
  ]).onConflictDoNothing();

  console.log("Chatbot data seeded successfully.");
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedChatbotData().catch(console.error).finally(() => process.exit(0));
}
