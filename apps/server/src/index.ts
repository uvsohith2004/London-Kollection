import { Hono } from "hono"
import { auth } from "./config/auth"
import { cors } from "hono/cors"
import { env } from "hono/adapter"
import { loadConfig } from "./config"
import { errorHandler } from "@/core/errors"
import { ok } from "@/core/response"
import { logger } from "@/core/utils/logger"
import { notFoundHandler } from "@/core/middleware/not-found.middleware"
import { rateLimiter } from "@/core/middleware"
import { requestIdMiddleware } from "@/core/middleware"
import { requestLoggerMiddleware } from "@/core/middleware"
import { sessionMiddleware, requireRole } from "@/core/middleware/auth.middleware"


import {
  productsRouter,
  adminProductsRouter,
  categoriesRouter,
  adminCategoriesRouter,
  collectionsRouter,
  adminCollectionsRouter,
  searchRouter,
  heroRouter,
  adminHeroRouter,
  occasionsRouter,
  adminOccasionsRouter,
} from "@/modules/catalog"

import { adminBrandsRouter } from "@/modules/catalog/brands/brands.routes"

import { usersRouter, adminUsersRouter } from "@/modules/identity"
import { addressesRouter } from "@/modules/fulfillment"
import { checkoutRouter } from "@/modules/checkout"

import {
  cartRouter,
  ordersRouter,
  adminOrdersRouter,
  couponsRouter,
  adminCouponsRouter,
  invoicesRouter,
  adminInvoicesRouter,
  returnsRouter,
  adminReturnsRouter,
} from "@/modules/commerce"

import { adminTaxesRouter } from "@/modules/commerce/taxes/taxes.routes"

import {
  notificationsRouter,
  adminNotificationsRouter,
  reviewsRouter,
  adminReviewsRouter,
  wishlistRouter,
} from "@/modules/engagement"

import { mediaRouter } from "@/modules/media"
import { settingsRouter, adminDashboardRouter, emailAdminRouter } from "@/modules/administration"
import { helpCenterRouter } from "@/modules/support"
import { chatRouter } from "@/modules/support-bot"
import { historyRouter } from "@/modules/history"
import { heatmapRouter } from "@/modules/heatmap"
import { featuredRouter, adminFeaturedRouter } from "@/modules/featured"

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
    requestId: string
  }
}>()
app.use(
  "*",
  cors({
    origin: (origin, c) => {
  
      const envVars = env<{ WEB_URL: string; NODE_ENV: string }>(c)
      const isDev = envVars.NODE_ENV === "development" || process.env.NODE_ENV === "development"
      const webUrl = envVars.WEB_URL || process.env.WEB_URL
      return isDev ? "http://localhost:3000" : (webUrl || "http://localhost:3000")
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
)
app.onError(errorHandler)
app.notFound(notFoundHandler)

app.use("*", requestIdMiddleware)
app.use("*", requestLoggerMiddleware)
app.use("*", rateLimiter)
app.use("*", sessionMiddleware)

app.use("*", async (c, next) => {
  await loadConfig()
  await next()
})


app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw)
})

app.route("/api/products", productsRouter)
app.route("/api/categories", categoriesRouter)
app.route("/api/collections", collectionsRouter)
app.route("/api/users", usersRouter)

import { flashSaleRoutes } from "@/modules/catalog/flash-sale"

app.route("/api/search", searchRouter)
app.route("/api/hero-carousel", heroRouter)
app.route("/api/collections/occasions", occasionsRouter)
app.route("/api/flash-sale", flashSaleRoutes)
app.route("/api/cart", cartRouter)
app.route("/api/checkout", checkoutRouter)
app.route("/api/orders", ordersRouter)
app.route("/api/coupons", couponsRouter)
app.route("/api/invoices", invoicesRouter)
app.route("/api/reviews", reviewsRouter)
app.get("/api/customer-reviews", (c) => c.json(ok({
  items: [
    {
      id: "1",
      rating: 5,
      description: "The quality of the pieces I received exceeded my expectations. Truly premium materials and a perfect fit.",
      name: "James T.",
      verifiedPurchase: true
    },
    {
      id: "2",
      rating: 5,
      description: "Fast shipping and the packaging was beautiful. The coat I bought feels incredibly luxurious.",
      name: "Sarah M.",
      verifiedPurchase: true
    },
    {
      id: "3",
      rating: 4,
      description: "Excellent craftsmanship. I get compliments every time I wear my new watch from the London Kollection.",
      name: "David L.",
      verifiedPurchase: false
    }
  ]
})))
app.route("/api/returns", returnsRouter)
app.route("/api/wishlist", wishlistRouter)
app.route("/api/notifications", notificationsRouter)
app.route("/api/media", mediaRouter)
app.route("/api/support", helpCenterRouter)
app.route("/api/chat", chatRouter)
app.route("/api/history", historyRouter)
app.route("/api/heatmap", heatmapRouter)
app.route("/api/featured", featuredRouter)

const adminRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
    requestId: string
  }
}>()

adminRouter.use("*", requireRole("admin"))

adminRouter.route("/dashboard", adminDashboardRouter)
adminRouter.route("/products", adminProductsRouter)
adminRouter.route("/categories", adminCategoriesRouter)
adminRouter.route("/collections", adminCollectionsRouter)
adminRouter.route("/hero-carousel", adminHeroRouter)
adminRouter.route("/users", adminUsersRouter)
adminRouter.route("/orders", adminOrdersRouter)
adminRouter.route("/coupons", adminCouponsRouter)
adminRouter.route("/invoices", adminInvoicesRouter)
adminRouter.route("/reviews", adminReviewsRouter)
adminRouter.route("/returns", adminReturnsRouter)
adminRouter.route("/notifications", adminNotificationsRouter)
adminRouter.route("/settings", settingsRouter)
adminRouter.route("/email", emailAdminRouter)
adminRouter.route("/brands", adminBrandsRouter)
adminRouter.route("/taxes", adminTaxesRouter)
adminRouter.route("/occasions", adminOccasionsRouter)
adminRouter.route("/featured", adminFeaturedRouter)

app.route("/api/admin", adminRouter)

app.get("/", (c) => c.text("API is running"))

export default app

if (typeof process !== "undefined" && process.release?.name === "node") {
  import("@hono/node-server").then(({ serve }) => {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000
    logger.info(`Hono server running on port ${port}`)
    serve({
      fetch: app.fetch,
      port,
    })
  })
}
