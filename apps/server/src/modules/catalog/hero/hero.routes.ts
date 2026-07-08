import { requireRole, requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { HeroController } from "./hero.controller"
import { CreateHeroSlideSchema, UpdateHeroSlideSchema, ReorderHeroSlidesSchema } from "./hero.validate"

export const heroRouter = new Hono<AppEnv>()
export const adminHeroRouter = new Hono<AppEnv>()
const controller = new HeroController()


heroRouter.get("/", (c) => controller.getActive(c))

// Admin
adminHeroRouter.use("*", requireRole("admin"))
adminHeroRouter.get("/", (c) => controller.listAdmin(c))
adminHeroRouter.post("/", zValidator("json", CreateHeroSlideSchema), (c) => controller.add(c))
adminHeroRouter.put("/:id", zValidator("json", UpdateHeroSlideSchema), (c) => controller.update(c))
adminHeroRouter.delete("/:id", (c) => controller.delete(c))
adminHeroRouter.post("/reorder", zValidator("json", ReorderHeroSlidesSchema), (c) => controller.reorder(c))
