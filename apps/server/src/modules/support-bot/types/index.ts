export type ChatIntent = {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  action: string;
};

export type FAQArticle = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
};

export type Policy = {
  id: string;
  name: string;
  description: string;
  rules: any;
};

export type ChatSessionContext = {
  sessionId: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  orderId?: string;
  issueCategory?: string;
  issueDescription?: string;
  collectedVariables: Record<string, any>;
  history: { sender: "user" | "bot"; message: string }[];
  ticketId?: string;
};
