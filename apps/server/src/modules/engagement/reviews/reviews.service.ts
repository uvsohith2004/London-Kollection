import { NotFoundError } from "@/core/errors/http-errors";
import { BadRequestError } from "@/core/errors"
import db from "@/db"
import { review, order, orderItem, reviewVote, user, product } from "@/db/schemas"
import { eq, and, sql, desc, inArray } from "drizzle-orm"

export class ReviewsService {
  async createDraftReview(userId: string, orderId: string, orderItemId: string) {
    // Check if order is Delivered and belongs to user
    const orderData = await db.query.order.findFirst({
      where: and(eq(order.id, orderId), eq(order.userId, userId), inArray(sql`LOWER(${order.status})`, ['delivered', 'completed', 'return requested', 'exchange requested', 'returned', 'refunded', 'exchange completed'])),
      with: {
        items: {
          where: eq(orderItem.id, orderItemId)
        }
      }
    })

    if (!orderData || orderData.items.length === 0) {
      throw new BadRequestError("Order not found, not delivered, or item not in order.")
    }

    const item = orderData.items[0]

    // Check if review already exists
    const existing = await db.query.review.findFirst({
      where: and(eq(review.orderItemId, orderItemId), eq(review.userId, userId))
    })

    if (existing) {
      return existing
    }

    const prod = await db.query.product.findFirst({
      where: eq(product.id, item.productId || ""),
    })

    const [newReview] = await db.insert(review).values({
      userId,
      productId: item.productId || "",
      orderId,
      orderItemId,
      variantId: item.variantId || null,
      rating: 0,
      isPublished: false,
      verifiedBuyer: true,
    }).returning()

    return newReview
  }

  async getReviewWithForm(reviewId: string, userId: string) {
    const rev = await db.query.review.findFirst({
      where: and(eq(review.id, reviewId), eq(review.userId, userId)),
      with: {
        product: true
      }
    })

    if (!rev) throw new NotFoundError("Review not found")
    return rev
  }

  async updateReviewDraft(reviewId: string, userId: string, data: any) {
    const rev = await db.query.review.findFirst({
      where: and(eq(review.id, reviewId), eq(review.userId, userId))
    })

    if (!rev) throw new NotFoundError("Review not found")


    const [updated] = await db.update(review).set({
      rating: data.rating !== undefined ? data.rating : rev.rating,
      title: data.title !== undefined ? data.title : rev.title,
      comment: data.comment !== undefined ? data.comment : rev.comment,
      updatedAt: new Date(),
    }).where(eq(review.id, reviewId)).returning()

    return updated
  }

  async submitReview(reviewId: string, userId: string, data: any) {
    const rev = await this.updateReviewDraft(reviewId, userId, data)

    const [submitted] = await db.update(review).set({
      isPublished: true,
      updatedAt: new Date(),
    }).where(eq(review.id, reviewId)).returning()

    if (submitted && submitted.productId) {
      await this.updateProductRatingStats(submitted.productId)
    }

    return submitted
  }

  async addReview(userId: string, data: {
    productId: string
    rating: number
    title?: string
    comment?: string
    images?: string[]
  }) {
    // 1. Verify Buyer: Check if the user has a "Delivered" or "Paid" order containing this product
    const buyerOrders = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(order)
      .innerJoin(orderItem, eq(order.id, orderItem.orderId))
      .where(
        and(
          eq(order.userId, userId),
          eq(orderItem.productId, data.productId),
          inArray(sql`LOWER(${order.status})`, ['delivered', 'completed', 'return requested', 'exchange requested', 'returned', 'refunded', 'exchange completed'])
        )
      )

    const isVerifiedBuyer = Number(buyerOrders[0]?.count || 0) > 0

    if (!isVerifiedBuyer) {
      throw new BadRequestError("Only verified buyers who purchased this product can leave a review.")
    }

    const [newReview] = await db
      .insert(review)
      .values({
        userId,
        productId: data.productId,
        rating: data.rating,
        title: data.title || null,
        comment: data.comment || null,
        images: data.images ? data.images.map(url => ({ webp: { key: url, url } })) : [],
        verifiedBuyer: true,
        isPublished: true,
      })
      .returning()

    await this.updateProductRatingStats(data.productId)

    return newReview
  }

  async getUserReviewStatus(productId: string, userId: string) {
    const buyerOrders = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(order)
      .innerJoin(orderItem, eq(order.id, orderItem.orderId))
      .where(
        and(
          eq(order.userId, userId),
          eq(orderItem.productId, productId),
          inArray(sql`LOWER(${order.status})`, ['delivered', 'completed', 'return requested', 'exchange requested', 'returned', 'refunded', 'exchange completed'])
        )
      )
    const isVerifiedBuyer = Number(buyerOrders[0]?.count || 0) > 0

    const userReview = await db.query.review.findFirst({
      where: and(eq(review.productId, productId), eq(review.userId, userId)),
    })

    return {
      eligible: isVerifiedBuyer,
      hasReviewed: !!userReview,
      review: userReview || null,
    }
  }

  async getProductReviews(productId: string, filters: { rating?: string, sort?: string, currentUserId?: string } = {}) {
    let conditions = [eq(review.productId, productId), eq(review.isPublished, true)]
    
    if (filters.currentUserId) {
      conditions.push(sql`${review.userId} != ${filters.currentUserId}`)
    }

    if (filters.rating) {
      if (filters.rating === "positive") {
        conditions.push(sql`${review.rating} >= 4`)
      } else if (filters.rating === "negative") {
        conditions.push(sql`${review.rating} <= 2`)
      } else {
        const ratingNum = parseInt(filters.rating)
        if (!isNaN(ratingNum)) {
          conditions.push(eq(review.rating, ratingNum))
        }
      }
    }

    let orderByClause = [desc(review.createdAt)]
    if (filters.sort === "top") {
      orderByClause = [desc(sql`vote_score`), desc(review.createdAt)]
    }

    const reviews = await db
      .select({
        review: review,
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
        voteScore: sql`COALESCE(SUM(${reviewVote.vote}), 0)`.mapWith(Number).as("vote_score"),
        currentUserVote: filters.currentUserId 
          ? sql`MAX(CASE WHEN ${reviewVote.userId} = ${filters.currentUserId} THEN ${reviewVote.vote} ELSE 0 END)`.mapWith(Number) 
          : sql`0`.mapWith(Number)
      })
      .from(review)
      .leftJoin(user, eq(review.userId, user.id))
      .leftJoin(reviewVote, eq(review.id, reviewVote.reviewId))
      .where(and(...conditions))
      .groupBy(review.id, user.id)
      .orderBy(...orderByClause)

    return reviews
  }

  async voteReview(reviewId: string, userId: string, vote: number) {
    if (vote !== 1 && vote !== -1 && vote !== 0) {
      throw new BadRequestError("Invalid vote value. Must be 1, -1, or 0.")
    }

    if (vote === 0) {
      await db.delete(reviewVote).where(and(eq(reviewVote.reviewId, reviewId), eq(reviewVote.userId, userId)))
      return { success: true, message: "Vote removed" }
    }

    await db
      .insert(reviewVote)
      .values({ reviewId, userId, vote })
      .onConflictDoUpdate({
        target: [reviewVote.reviewId, reviewVote.userId],
        set: { vote, createdAt: new Date() },
      })
    
    return { success: true, vote }
  }

  async getProductRatingSummary(productId: string) {
    const stats = await db
      .select({
        rating: review.rating,
        count: sql`count(*)`.mapWith(Number),
      })
      .from(review)
      .where(and(eq(review.productId, productId), eq(review.isPublished, true)))
      .groupBy(review.rating)

    let totalReviews = 0
    let totalScore = 0
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

    stats.forEach(stat => {
      const count = Number(stat.count)
      totalReviews += count
      totalScore += stat.rating * count
      distribution[stat.rating] = count
    })

    const averageRating = totalReviews > 0 ? (totalScore / totalReviews).toFixed(1) : "0.0"

    return {
      averageRating,
      totalReviews,
      distribution
    }
  }

  async updateProductRatingStats(productId: string) {
    const summary = await this.getProductRatingSummary(productId);
    await db.update(product).set({
      averageRating: summary.averageRating,
      reviewCount: summary.totalReviews,
    }).where(eq(product.id, productId));
  }



  async listAllReviewsForAdmin() {
    return await db.select().from(review)
  }
}

