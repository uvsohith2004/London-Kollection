import { requireRole, requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { ProductsController } from "./products.controller"
import { CreateProductSchema, UpdateProductSchema } from "./products.validate"

export const productsRouter = new Hono<AppEnv>()
export const adminProductsRouter = new Hono<AppEnv>()
const controller = new ProductsController()

// Public Routes
productsRouter.get("/", (c) => controller.list(c))
productsRouter.get("/featured", (c) => controller.getFeatured(c))
productsRouter.get("/trending", (c) => controller.getTrending(c))
productsRouter.get("/new-arrivals", (c) => controller.getNewArrivals(c))
productsRouter.get("/personalized-recommendations", (c) => controller.getPersonalizedRecommendations(c))
productsRouter.get("/slug/:slug", (c) => controller.getBySlug(c))
productsRouter.get("/:id", (c) => controller.getById(c))
productsRouter.get("/:id/related", (c) => controller.getRelated(c))

// Admin Routes
adminProductsRouter.use("*", requireRole("admin"))
adminProductsRouter.get("/", (c) => controller.getAdminList(c))
adminProductsRouter.post("/", zValidator("json", CreateProductSchema), (c) => controller.create(c))
adminProductsRouter.put("/:id", zValidator("json", UpdateProductSchema), (c) => controller.update(c))
adminProductsRouter.delete("/:id", (c) => controller.archive(c))
