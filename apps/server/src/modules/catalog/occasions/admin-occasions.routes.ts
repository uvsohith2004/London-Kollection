import { AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { OccasionsController } from "./occasions.controller"
import { CreateOccasionSchema, UpdateOccasionSchema } from "./occasions.validate"

export const adminOccasionsRouter = new Hono<AppEnv>()
const controller = new OccasionsController()

adminOccasionsRouter.get("/", (c) => controller.listAll(c))
adminOccasionsRouter.post("/", zValidator("json", CreateOccasionSchema), (c) => controller.create(c))
adminOccasionsRouter.put("/:id", zValidator("json", UpdateOccasionSchema), (c) => controller.update(c))
adminOccasionsRouter.delete("/:id", (c) => controller.delete(c))
