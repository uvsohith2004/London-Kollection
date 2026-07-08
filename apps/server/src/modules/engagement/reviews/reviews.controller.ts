import { ok } from "@/core/response"
import { NotFoundError } from "@/core/errors"
import { Context } from "hono"
import { ReviewsService } from "./reviews.service"

export class ReviewsController {
  private service = new ReviewsService()

  async getProductReviews(c: Context) {
    const productId = c.req.param("productId")!
    const query = c.req.query()
    const currentUserId = c.get("user")?.id

    const filters = {
      rating: query.rating,
      sort: query.sort,
      currentUserId
    }

    const items = await this.service.getProductReviews(productId, filters)
    return c.json(ok(items))
  }

  async getUserReviewStatus(c: Context) {
    const productId = c.req.param("productId")!
    const user = c.get("user")!
    
    const status = await this.service.getUserReviewStatus(productId, user.id)
    return c.json(ok(status))
  }

  async voteReview(c: Context) {
    const reviewId = c.req.param("id")!
    const user = c.get("user")!
    const body = await c.req.json()
    const vote = Number(body.vote)

    const result = await this.service.voteReview(reviewId, user.id, vote)
    return c.json(ok(result))
  }

  async getProductRatingSummary(c: Context) {
    const productId = c.req.param("productId")!
    const summary = await this.service.getProductRatingSummary(productId)
    return c.json(ok(summary))
  }

  async addReview(c: Context) {
    const user = c.get("user")!
    const body = c.req.valid("json" as never) as any
    const reviewRecord = await this.service.addReview(user.id, body)
    return c.json(ok({ review: reviewRecord }))
  }

  async listAdmin(c: Context) {
    const items = await this.service.listAllReviewsForAdmin()
    return c.json(ok(items))
  }

  async moderateReview(c: Context) {
    const id = c.req.param("id")!
    const body = c.req.valid("json" as never) as any
    const updated = await this.service.moderateReview(id, body.approve)
    if (!updated) {
      throw new NotFoundError("Review not found")
    }
    return c.json(ok({ review: updated }))
  }
}
