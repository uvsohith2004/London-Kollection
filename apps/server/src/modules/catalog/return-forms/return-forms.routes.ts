import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { ReturnFormsController } from "./return-forms.controller"
import { CreateReturnFormSchema, UpdateReturnFormSchema } from "./return-forms.validate"
import { AppEnv } from "@/core/middleware"

export const adminReturnFormsRouter = new Hono<AppEnv>()
const controller = new ReturnFormsController()

adminReturnFormsRouter.get("/", (c) => controller.getForms(c))
adminReturnFormsRouter.get("/:id", (c) => controller.getFormById(c))
adminReturnFormsRouter.post("/", zValidator("json", CreateReturnFormSchema), (c) => controller.createForm(c))
adminReturnFormsRouter.put("/:id", zValidator("json", UpdateReturnFormSchema), (c) => controller.updateForm(c))
adminReturnFormsRouter.delete("/:id", (c) => controller.deleteForm(c))
