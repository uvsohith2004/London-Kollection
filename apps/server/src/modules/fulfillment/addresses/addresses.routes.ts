import { requireAuth, AppEnv } from "@/core/middleware"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { AddressesController } from "./addresses.controller"
import { CreateAddressSchema, UpdateAddressSchema } from "./addresses.validate"

export const addressesRouter = new Hono<AppEnv>()
const controller = new AddressesController()

// Apply authentication guard globally to this router
addressesRouter.use("*", requireAuth)

// 1. List Addresses
addressesRouter.get("/", (c) => controller.list(c))

// 2. Create Address
addressesRouter.post("/", zValidator("json", CreateAddressSchema), (c) => controller.create(c))

// 3. Update Address
addressesRouter.put("/:id", zValidator("json", UpdateAddressSchema), (c) => controller.update(c))

// 4. Delete Address
addressesRouter.delete("/:id", (c) => controller.delete(c))
