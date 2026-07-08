import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { AppEnv } from "@/core/middleware"
import { TaxesController } from "./taxes.controller"
import {
  CreateTaxClassSchema,
  UpdateTaxClassSchema,
  CreateTaxRateSchema,
  UpdateTaxRateSchema,
  CreateTaxRuleSchema,
  UpdateTaxRuleSchema
} from "./taxes.validate"

export const adminTaxesRouter = new Hono<AppEnv>()
const controller = new TaxesController()

// -- Tax Classes --
adminTaxesRouter.get("/classes", (c) => controller.getAllTaxClasses(c))
adminTaxesRouter.post("/classes", zValidator("json", CreateTaxClassSchema), (c) => controller.createTaxClass(c))
adminTaxesRouter.put("/classes/:id", zValidator("json", UpdateTaxClassSchema), (c) => controller.updateTaxClass(c))
adminTaxesRouter.delete("/classes/:id", (c) => controller.deleteTaxClass(c))

// -- Tax Rates --
adminTaxesRouter.get("/rates", (c) => controller.getAllTaxRates(c))
adminTaxesRouter.post("/rates", zValidator("json", CreateTaxRateSchema), (c) => controller.createTaxRate(c))
adminTaxesRouter.put("/rates/:id", zValidator("json", UpdateTaxRateSchema), (c) => controller.updateTaxRate(c))
adminTaxesRouter.delete("/rates/:id", (c) => controller.deleteTaxRate(c))

// -- Tax Rules --
adminTaxesRouter.get("/rules", (c) => controller.getAllTaxRules(c))
adminTaxesRouter.post("/rules", zValidator("json", CreateTaxRuleSchema), (c) => controller.createTaxRule(c))
adminTaxesRouter.put("/rules/:id", zValidator("json", UpdateTaxRuleSchema), (c) => controller.updateTaxRule(c))
adminTaxesRouter.delete("/rules/:id", (c) => controller.deleteTaxRule(c))
