import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { AppEnv } from "@/core/middleware"
import { BrandsController } from "./brands.controller"
import { CreateBrandSchema, UpdateBrandSchema } from "./brands.validate"

export const adminBrandsRouter = new Hono<AppEnv>()
const controller = new BrandsController()

adminBrandsRouter.get("/", (c) => controller.getAllBrands(c))
adminBrandsRouter.get("/:id", (c) => controller.getBrand(c))
adminBrandsRouter.post("/", zValidator("json", CreateBrandSchema), (c) => controller.createBrand(c))
adminBrandsRouter.put("/:id", zValidator("json", UpdateBrandSchema), (c) => controller.updateBrand(c))
adminBrandsRouter.delete("/:id", (c) => controller.deleteBrand(c))
