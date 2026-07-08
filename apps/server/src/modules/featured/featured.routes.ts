import { requireRole, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { FeaturedController } from "./featured.controller"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

export const featuredRouter = new Hono<AppEnv>()
export const adminFeaturedRouter = new Hono<AppEnv>()
const controller = new FeaturedController()

// Public Routes
featuredRouter.get("/pieces", (c) => controller.getPieces(c))
featuredRouter.get("/collections", (c) => controller.getCollections(c))

// Admin Routes
adminFeaturedRouter.use("*", requireRole("admin"))

// Pieces
adminFeaturedRouter.get("/pieces", (c) => controller.getAdminPieces(c))
adminFeaturedRouter.post(
  "/pieces",
  zValidator("json", z.object({
    items: z.array(z.object({ productId: z.string(), sortOrder: z.number() }))
  })),
  (c) => controller.setPieces(c)
)
adminFeaturedRouter.patch(
  "/pieces/:id/status",
  zValidator("json", z.object({ isActive: z.boolean() })),
  (c) => controller.updatePieceStatus(c)
)

// Collections
adminFeaturedRouter.get("/collections", (c) => controller.getAdminCollections(c))
adminFeaturedRouter.post(
  "/collections",
  zValidator("json", z.object({
    items: z.array(z.object({ collectionId: z.string().min(1), sortOrder: z.number() }))
  })),
  (c) => controller.setCollections(c)
)
adminFeaturedRouter.patch(
  "/collections/:id/status",
  zValidator("json", z.object({ isActive: z.boolean() })),
  (c) => controller.updateCollectionStatus(c)
)
