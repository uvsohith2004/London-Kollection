import { requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { CartController } from "./cart.controller"
import { AddCartItemSchema, UpdateCartItemSchema, ApplyCouponSchema, UpdateGiftNoteSchema, SyncCartSchema } from "./cart.validate"

export const cartRouter = new Hono<AppEnv>()
const controller = new CartController()

// 1. Get/Create Cart (Public / Guest / Auth)
cartRouter.get("/", (c) => controller.getCart(c))

// 2. Add Item to Cart
cartRouter.post("/items", zValidator("json", AddCartItemSchema), (c) => controller.addItem(c))

// 3. Update Cart Item Quantity
cartRouter.put("/items/:itemId", zValidator("json", UpdateCartItemSchema), (c) => controller.updateItem(c))

// 4. Remove Item from Cart
cartRouter.delete("/items/:itemId", (c) => controller.removeItem(c))

// 5. Apply Coupon
cartRouter.post("/coupon", zValidator("json", ApplyCouponSchema), (c) => controller.applyCoupon(c))

// 6. Update Gift Note
cartRouter.post("/gift-note", zValidator("json", UpdateGiftNoteSchema), (c) => controller.updateGiftNote(c))

// 7. Merge Guest Cart (Auth Required)
cartRouter.post("/merge", requireAuth, (c) => controller.merge(c))

// 8. Sync Cart from Frontend
cartRouter.post("/sync", zValidator("json", SyncCartSchema), (c) => controller.sync(c))
