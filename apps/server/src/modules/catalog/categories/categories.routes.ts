import { requireRole, requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { CategoriesController } from "./categories.controller"
import { CreateCategorySchema, UpdateCategorySchema } from "./categories.validate"

export const categoriesRouter = new Hono<AppEnv>()
export const adminCategoriesRouter = new Hono<AppEnv>()
const controller = new CategoriesController()

// Public Routes
categoriesRouter.get("/", (c) => controller.list(c))
categoriesRouter.get("/featured", (c) => controller.getFeatured(c))
categoriesRouter.get("/recently-updated", (c) => controller.getRecentlyUpdated(c))

// Admin Routes
adminCategoriesRouter.use("*", requireRole("admin"))
adminCategoriesRouter.post("/", zValidator("json", CreateCategorySchema), (c) => controller.create(c))
adminCategoriesRouter.put("/:id", zValidator("json", UpdateCategorySchema), (c) => controller.update(c))
adminCategoriesRouter.delete("/:id", (c) => controller.delete(c))
