import express from "express";
import {
  getProducts,
  getFeaturedProducts,
  getProductDetail,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";
import { verifyAccessToken } from "../middleware/auth.js";
import { verifyAdmin } from "../middleware/admin.js";

const router = express.Router();

/* ======================
   PUBLIC ROUTES
====================== */

// Get all active products (with filtering & pagination)
router.get("/", getProducts);

// Get featured products
router.get("/featured", getFeaturedProducts);

// Get all categories
router.get("/categories", getCategories);

// Get single product by ID or slug
router.get("/:id", getProductDetail);

/* ======================
   ADMIN ROUTES
====================== */

// Protect all routes below with authentication
router.use(verifyAccessToken, verifyAdmin);

// Create product (admin only)
router.post("/", createProduct);

// Update product (admin only)
router.put("/:id", updateProduct);

// Delete product (admin only)
router.delete("/:id", deleteProduct);

export default router;