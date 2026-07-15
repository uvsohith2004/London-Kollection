import { requireRole, requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { CategoriesController } from "./categories.controller"
import { CreateCategorySchema, UpdateCategorySchema } from "./categories.validate"

export const categoriesRouter = new Hono<AppEnv>()
export const adminCategoriesRouter = new Hono<AppEnv>()
const controller = new CategoriesController()

// Public Routes
categoriesRouter.get("/", (c) => controller.list(c) as any)
categoriesRouter.get("/featured", (c) => controller.getFeatured(c) as any)
categoriesRouter.get("/recently-updated", (c) => controller.getRecentlyUpdated(c) as any)
categoriesRouter.get("/slug/:slug", (c) => controller.getBySlug(c) as any)

// Admin Routes
adminCategoriesRouter.use("*", requireRole("admin"))
adminCategoriesRouter.post("/", zValidator("json", CreateCategorySchema) as any, (c) => controller.create(c) as any)
adminCategoriesRouter.put("/:id", zValidator("json", UpdateCategorySchema) as any, (c) => controller.update(c) as any)
adminCategoriesRouter.delete("/:id", (c) => controller.delete(c) as any)
