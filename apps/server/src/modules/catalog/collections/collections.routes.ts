import { requireRole, requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { CollectionsController } from "./collections.controller"
import { CreateCollectionSchema, UpdateCollectionSchema } from "./collections.validate"

export const collectionsRouter = new Hono<AppEnv>()
export const adminCollectionsRouter = new Hono<AppEnv>()
const controller = new CollectionsController()

// Public Routes
collectionsRouter.get("/", (c) => controller.list(c) as any)
collectionsRouter.get("/featured", (c) => controller.getFeatured(c) as any)
collectionsRouter.get("/slug/:slug", (c) => controller.getBySlug(c) as any)

// Admin Routes
adminCollectionsRouter.use("*", requireRole("admin"))
adminCollectionsRouter.post("/", zValidator("json", CreateCollectionSchema) as any, (c) => controller.create(c) as any)
adminCollectionsRouter.put("/:id", zValidator("json", UpdateCollectionSchema) as any, (c) => controller.update(c) as any)
adminCollectionsRouter.delete("/:id", (c) => controller.delete(c) as any)
