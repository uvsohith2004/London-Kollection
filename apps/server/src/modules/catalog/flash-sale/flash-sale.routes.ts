import { FlashSaleController } from "./flash-sale.controller"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import {
  toggleFlashSaleSchema,
  addFlashSaleItemSchema,
  updateFlashSaleItemSchema
} from "./flash-sale.validate"

export const flashSaleRoutes = new Hono()
const flashSaleController = new FlashSaleController()

// Public
flashSaleRoutes.get("/", (c) => flashSaleController.getFlashSaleDetails(c))
flashSaleRoutes.get("/flash-sale-products", (c) => flashSaleController.getFlashSaleProducts(c))

// Admin
flashSaleRoutes.get("/admin", (c) => flashSaleController.getAdminFlashSaleDetails(c))
flashSaleRoutes.post("/admin", zValidator("json", toggleFlashSaleSchema), (c) => flashSaleController.toggleFlashSale(c))
flashSaleRoutes.post("/admin/flash-sale-products", zValidator("json", addFlashSaleItemSchema), (c) => flashSaleController.addFlashSaleItem(c))
flashSaleRoutes.put("/admin/flash-sale-products/:id", zValidator("json", updateFlashSaleItemSchema), (c) => flashSaleController.updateFlashSaleItem(c))
flashSaleRoutes.delete("/admin/flash-sale-products/:id", (c) => flashSaleController.removeFlashSaleItem(c))
