import { Hono } from "hono"
import { HistoryController } from "./history.controller"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

export const historyRouter = new Hono()
const controller = new HistoryController()

historyRouter.post(
  "/track/view",
  zValidator("json", z.object({ productId: z.string() })),
  (c) => controller.trackProductView(c)
)

historyRouter.post(
  "/track/search",
  zValidator("json", z.object({ searchTerm: z.string().min(1) })),
  (c) => controller.trackSearch(c)
)

historyRouter.post(
  "/batch",
  zValidator("json", z.object({ 
    productIds: z.array(z.string()).optional(), 
    searchTerms: z.array(z.string()).optional() 
  })),
  (c) => controller.trackBatch(c)
)

historyRouter.get("/", (c) => controller.getHistory(c))
historyRouter.get("/recommended", (c) => controller.getRecommended(c))
historyRouter.patch("/view/:id/archive", (c) => controller.archiveProductHistory(c))
historyRouter.patch("/search/:id/archive", (c) => controller.archiveSearchHistory(c))
