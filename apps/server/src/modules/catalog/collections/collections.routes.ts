import { requireRole, requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { CollectionsController } from "./collections.controller"
import { CreateCollectionSchema, UpdateCollectionSchema } from "./collections.validate"

export const collectionsRouter = new Hono<AppEnv>()
export const adminCollectionsRouter = new Hono<AppEnv>()
const controller = new CollectionsController()

// Public Routes
collectionsRouter.get("/", (c) => controller.list(c))
collectionsRouter.get("/featured", (c) => controller.getFeatured(c))

// Admin Routes
adminCollectionsRouter.use("*", requireRole("admin"))
adminCollectionsRouter.post("/", zValidator("json", CreateCollectionSchema), (c) => controller.create(c))
adminCollectionsRouter.put("/:id", zValidator("json", UpdateCollectionSchema), (c) => controller.update(c))
adminCollectionsRouter.delete("/:id", (c) => controller.delete(c))
