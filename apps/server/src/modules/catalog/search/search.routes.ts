import { AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { SearchController } from "./search.controller"
import { SearchQuerySchema } from "@workspace/api-contracts"

export const searchRouter = new Hono<AppEnv>()
const controller = new SearchController()

searchRouter.get("/", zValidator("query", SearchQuerySchema), (c) => controller.search(c))
