import { ok } from "@/core/response"
import { Context } from "hono"
import { SearchService } from "./search.service"

export class SearchController {
  private service = new SearchService()

  async search(c: Context) {
    const q = c.req.valid("query" as never) as any
    const results = await this.service.search({
      ...q,
      availability: q.availability === "true" ? true : q.availability === "false" ? false : undefined,
      featured: q.featured === "true" ? true : undefined,
      discount: q.discount === "true" ? true : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
      page: q.page ? Number(q.page) : undefined,
    })
    return c.json(ok(results))
  }
}
