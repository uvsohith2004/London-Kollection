import Fuse from "fuse.js";
import { ChatIntent } from "../types";

export class IntentDetectionService {
  private fuse: Fuse<ChatIntent>;

  constructor(intents: ChatIntent[]) {
    this.fuse = new Fuse(intents, {
      keys: ["keywords", "name", "description"],
      threshold: 0.4, // lower threshold means stricter match
      includeScore: true,
    });
  }

  public detectIntent(message: string): { intent: ChatIntent | null; score: number } {
    const results = this.fuse.search(message);
    
    if (results.length > 0 && results[0].score !== undefined && results[0].score < 0.5) {
      // fuse.js score is 0 for exact match, 1 for mismatch
      return { intent: results[0].item, score: 1 - results[0].score };
    }

    return { intent: null, score: 0 };
  }
}
