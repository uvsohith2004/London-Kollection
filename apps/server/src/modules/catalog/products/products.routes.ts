import { requireRole, requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { ProductsController } from "./products.controller"
import { CreateProductSchema, UpdateProductSchema } from "./products.validate"

export const productsRouter = new Hono<AppEnv>()
export const adminProductsRouter = new Hono<AppEnv>()
const controller = new ProductsController()

// Public Routes
productsRouter.get("/", (c) => controller.list(c) as any)
productsRouter.get("/featured", (c) => controller.getFeatured(c) as any)
productsRouter.get("/trending", (c) => controller.getTrending(c) as any)
productsRouter.get("/new-arrivals", (c) => controller.getNewArrivals(c) as any)
productsRouter.get("/personalized-recommendations", (c) => controller.getPersonalizedRecommendations(c) as any)
productsRouter.get("/search", (c) => controller.search(c) as any)
productsRouter.get("/slug/:slug", (c) => controller.getBySlug(c) as any)
productsRouter.get("/:id", (c) => controller.getById(c) as any)
productsRouter.get("/:id/related", (c) => controller.getRelated(c) as any)
productsRouter.get("/:id/suggestions", (c) => controller.getSuggestions(c) as any)
// Admin Routes
adminProductsRouter.use("*", requireRole("admin"))
adminProductsRouter.get("/", (c) => controller.getAdminList(c) as any)
adminProductsRouter.post("/", zValidator("json", CreateProductSchema) as any, (c) => controller.create(c) as any)
adminProductsRouter.put("/:id", zValidator("json", UpdateProductSchema) as any, (c) => controller.update(c) as any)
adminProductsRouter.delete("/:id", (c) => controller.archive(c) as any)
