import Fuse from "fuse.js";
import { FAQArticle } from "../types";

export class FAQSearchService {
  private fuse: Fuse<FAQArticle>;

  constructor(faqs: FAQArticle[]) {
    this.fuse = new Fuse(faqs, {
      keys: ["question", "keywords", "answer"],
      threshold: 0.5,
      includeScore: true,
    });
  }

  public searchFAQ(query: string): { faq: FAQArticle | null; score: number } {
    const results = this.fuse.search(query);
    
    if (results.length > 0 && results[0].score !== undefined && results[0].score < 0.6) {
      return { faq: results[0].item, score: 1 - results[0].score };
    }

    return { faq: null, score: 0 };
  }
}
