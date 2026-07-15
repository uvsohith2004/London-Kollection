import { requireRole, requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { ReviewsController } from "./reviews.controller"
import { CreateReviewSchema } from "./reviews.validate"

export const reviewsRouter = new Hono<AppEnv>()
export const adminReviewsRouter = new Hono<AppEnv>()
const controller = new ReviewsController()

// Public Routes (or implicitly auth-aware)
reviewsRouter.get("/product/:productId", (c) => controller.getProductReviews(c))
reviewsRouter.get("/product/:productId/summary", (c) => controller.getProductRatingSummary(c))

// Auth Routes
reviewsRouter.get("/product/:productId/me", requireAuth, (c) => controller.getUserReviewStatus(c))
reviewsRouter.post("/", requireAuth, zValidator("json", CreateReviewSchema), (c) => controller.addReview(c))

// Draft and submission routes
reviewsRouter.post("/draft", requireAuth, (c) => controller.createDraft(c))
reviewsRouter.get("/:id/form", requireAuth, (c) => controller.getReviewWithForm(c))
reviewsRouter.put("/:id/draft", requireAuth, (c) => controller.updateDraft(c))
reviewsRouter.post("/:id/submit", requireAuth, (c) => controller.submitReview(c))

reviewsRouter.post("/:id/vote", requireAuth, (c) => controller.voteReview(c))

// Admin Routes
adminReviewsRouter.use("*", requireRole("admin"))
adminReviewsRouter.get("/", (c) => controller.listAdmin(c))
