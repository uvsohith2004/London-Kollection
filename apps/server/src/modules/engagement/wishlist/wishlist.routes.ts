import { requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { WishlistController } from "./wishlist.controller"
import { WishlistItemSchema } from "./wishlist.validate"

export const wishlistRouter = new Hono<AppEnv>()
const controller = new WishlistController()

// Apply auth required guard globally to this router
wishlistRouter.use("*", requireAuth)

// 1. Get wishlist
wishlistRouter.get("/", (c) => controller.list(c))

// 2. Add to wishlist
wishlistRouter.post("/", zValidator("json", WishlistItemSchema), (c) => controller.add(c))

// 3. Remove from wishlist
wishlistRouter.delete("/:productId", (c) => controller.remove(c))
