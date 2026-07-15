import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { AppEnv } from "@/core/middleware"
import { BrandsController } from "./brands.controller"
import { CreateBrandSchema, UpdateBrandSchema } from "@workspace/api-contracts"

export const adminBrandsRouter = new Hono<AppEnv>()
const controller = new BrandsController()

adminBrandsRouter.get("/", (c) => controller.getAllBrands(c) as any)
adminBrandsRouter.get("/slug/:slug", (c) => controller.getBySlug(c) as any)
adminBrandsRouter.get("/:id", (c) => controller.getBrand(c) as any)
adminBrandsRouter.post("/", zValidator("json", CreateBrandSchema) as any, (c) => controller.createBrand(c) as any)
adminBrandsRouter.put("/:id", zValidator("json", UpdateBrandSchema) as any, (c) => controller.updateBrand(c) as any)
adminBrandsRouter.delete("/:id", (c) => controller.deleteBrand(c) as any)
