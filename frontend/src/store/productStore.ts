import { create } from "zustand";
import api from "@/services/api";

export interface Product {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductState {
  // State
  products: Product[];
  featuredProducts: Product[];
  isLoading: boolean;
  error: string | null;
  filters: {
    category?: string;
    featured?: boolean;
  };

  // Actions
  fetchProducts: (filters?: any) => Promise<void>;
  fetchFeaturedProducts: (limit?: number) => Promise<void>;
  getProductById: (id: string) => Promise<Product | null>;
  createProduct: (data: any) => Promise<void>;
  updateProduct: (id: string, data: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Product Store - Senior Backend Pattern
 *
 * ✅ Database-First Architecture:
 * - All products fetched from MongoDB database
 * - NO static fallback data
 * - Real ObjectIds from database
 * - Proper error messages to user
 *
 * ✅ Why No Fallback?
 * - Production systems never rely on hardcoded data
 * - Database is the source of truth
 * - If database is down, show error clearly (don't hide it)
 * - Users know to contact support or try again
 */
export const useProductStore = create<ProductState>((set, get) => {
  return {
    products: [],
    featuredProducts: [],
    isLoading: false,
    error: null,
    filters: {},

    /**
     * Fetch all products with optional filters
     * ✅ IMPORTANT: Only from database, no fallback
     */
    fetchProducts: async (filters = {}) => {
      try {
        set({ isLoading: true, error: null });
        console.log("[PRODUCT_STORE] Fetching products from database with filters:", filters);

        const response = await api.getProducts(filters);
        const dbProducts = response.data || [];

        console.log(
          "[PRODUCT_STORE] Products fetched from database:",
          dbProducts.length,
          "products"
        );

        set({
          products: dbProducts.filter((p) => p.isActive !== false),
          filters,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        console.error("[PRODUCT_STORE] Error fetching products:", error.message);

        // ✅ Show error to user - don't silently fail
        const errorMessage =
          error.message || "Failed to load products. Please try again.";

        set({
          products: [],
          filters,
          error: errorMessage,
          isLoading: false,
        });
      }
    },

    /**
     * Fetch featured products
     */
    fetchFeaturedProducts: async (limit = 5) => {
      try {
        set({ isLoading: true, error: null });
        console.log("[PRODUCT_STORE] Fetching featured products from database");

        const response = await api.getFeaturedProducts(limit);
        const dbFeatured = Array.isArray(response.data) ? response.data : [];

        console.log(
          "[PRODUCT_STORE] Featured products fetched:",
          dbFeatured.length,
          "products"
        );

        set({
          featuredProducts: dbFeatured.slice(0, limit),
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        console.error(
          "[PRODUCT_STORE] Error fetching featured products:",
          error.message
        );

        // ✅ Show error - don't hide it
        set({
          featuredProducts: [],
          isLoading: false,
          error: error.message || "Failed to load featured products",
        });
      }
    },

    /**
     * Get single product by ID
     */
    getProductById: async (id: string) => {
      try {
        console.log("[PRODUCT_STORE] Fetching product by ID from database:", id);

        const response = await api.getProductDetail(id);
        console.log("[PRODUCT_STORE] Product found:", response.data.title);

        return response.data;
      } catch (error: any) {
        console.error("[PRODUCT_STORE] Error fetching product:", error.message);

        // ✅ Pass error to caller, don't hide
        set({
          error: error.message || "Failed to fetch product",
        });

        return null;
      }
    },

    /**
     * Create new product (admin only)
     */
    createProduct: async (data) => {
      try {
        set({ isLoading: true, error: null });
        console.log("[PRODUCT_STORE] Creating new product:", { title: data.title });

        const response = await api.createProduct(data);

        // Add to products list
        set((state) => ({
          products: [response.data, ...state.products],
          isLoading: false,
        }));

        console.log("[PRODUCT_STORE] Product created successfully");
      } catch (error: any) {
        console.error("[PRODUCT_STORE] Error creating product:", error.message);
        set({
          error: error.message || "Failed to create product",
          isLoading: false,
        });
        throw error;
      }
    },

    /**
     * Update product (admin only)
     */
    updateProduct: async (id: string, data) => {
      try {
        set({ isLoading: true, error: null });
        console.log("[PRODUCT_STORE] Updating product:", id);

        const response = await api.updateProduct(id, data);

        // Update in products list
        set((state) => ({
          products: state.products.map((p) =>
            p._id === id ? response.data : p
          ),
          isLoading: false,
        }));

        console.log("[PRODUCT_STORE] Product updated successfully");
      } catch (error: any) {
        console.error("[PRODUCT_STORE] Error updating product:", error.message);
        set({
          error: error.message || "Failed to update product",
          isLoading: false,
        });
        throw error;
      }
    },

    /**
     * Delete product (admin only)
     */
    deleteProduct: async (id: string) => {
      try {
        set({ isLoading: true, error: null });
        console.log("[PRODUCT_STORE] Deleting product:", id);

        await api.deleteProduct(id);

        // Remove from products list
        set((state) => ({
          products: state.products.filter((p) => p._id !== id),
          isLoading: false,
        }));

        console.log("[PRODUCT_STORE] Product deleted successfully");
      } catch (error: any) {
        console.error("[PRODUCT_STORE] Error deleting product:", error.message);
        set({
          error: error.message || "Failed to delete product",
          isLoading: false,
        });
        throw error;
      }
    },

    /**
     * Clear error
     */
    clearError: () => set({ error: null }),
  };
});
