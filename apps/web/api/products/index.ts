import { get } from "../client";
import type {
  Product,
  ProductsResponse,
  SearchQuery,
} from "@workspace/api-contracts";

export const ProductApi = {
  search: async (params: SearchQuery): Promise<ProductsResponse> => {
    return await get("/products/search", { params });
  },
  getNewArrivals: async (): Promise<ProductsResponse> => {
    return await get("/products/new-arrivals");
  },
  getTrending: async (): Promise<ProductsResponse> => {
    return await get("/products/trending");
  },
  getRelatedProducts: async (productId: string, limit: number = 4): Promise<ProductsResponse> => {
    return await get(`/products/${productId}/related`, { params: { limit } });
  },
  getSuggestions: async (productId: string, limit: number = 10): Promise<{ sameBrand: Product[], otherBrands: Product[] }> => {
    return await get(`/products/${productId}/suggestions`, { params: { limit } });
  },
  getBySlug: async (slug: string): Promise<Product> => {
    return await get(`/products/slug/${slug}`);
  },
  getById: async (id: string): Promise<Product> => {
    return await get(`/products/${id}`);
  },
  getPersonalizedRecommendations: async (): Promise<ProductsResponse> => {
    return await get("/history/recommended");
  }
};
