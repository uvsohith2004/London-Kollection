import { FlashSaleController } from "./flash-sale.controller"
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import {
  ToggleFlashSaleSchema,
  AddFlashSaleItemSchema,
  UpdateFlashSaleItemSchema
} from "@workspace/api-contracts"

export const flashSaleRoutes = new Hono()
const flashSaleController = new FlashSaleController()

// Public
flashSaleRoutes.get("/", (c) => flashSaleController.getFlashSaleDetails(c))
flashSaleRoutes.get("/flash-sale-products", (c) => flashSaleController.getFlashSaleProducts(c))

// Admin
flashSaleRoutes.get("/admin", (c) => flashSaleController.getAdminFlashSaleDetails(c))
flashSaleRoutes.post("/admin", zValidator("json", ToggleFlashSaleSchema), (c) => flashSaleController.toggleFlashSale(c))
flashSaleRoutes.post("/admin/flash-sale-products", zValidator("json", AddFlashSaleItemSchema), (c) => flashSaleController.addFlashSaleItem(c))
flashSaleRoutes.put("/admin/flash-sale-products/:id", zValidator("json", UpdateFlashSaleItemSchema), (c) => flashSaleController.updateFlashSaleItem(c))
flashSaleRoutes.delete("/admin/flash-sale-products/:id", (c) => flashSaleController.removeFlashSaleItem(c))
