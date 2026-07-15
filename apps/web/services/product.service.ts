import { ProductApi } from "@/api/products";
import type { SearchQuery, ProductsResponse, Product } from "@workspace/api-contracts";
import { mapProductToView, type ProductViewModel } from "./mappers/product.mapper";

export const ProductService = {
  search: async (params: SearchQuery) => {
    const response = await ProductApi.search(params);
    return {
      ...response,
      items: response.items.map(mapProductToView),
    };
  },
  
  getNewArrivals: async () => {
    const response = await ProductApi.getNewArrivals();
    return {
      ...response,
      items: response.items.map(mapProductToView),
    };
  },

  getTrending: async () => {
    const response = await ProductApi.getTrending();
    return {
      ...response,
      items: response.items.map(mapProductToView),
    };
  },

  getRelatedProducts: async (productId: string, limit?: number) => {
    const response = await ProductApi.getRelatedProducts(productId, limit);
    return {
      ...response,
      items: response.items.map(mapProductToView),
    };
  },

  getSuggestions: async (productId: string, limit?: number) => {
    const response = await ProductApi.getSuggestions(productId, limit);
    return {
      sameBrand: response.sameBrand.map(mapProductToView),
      otherBrands: response.otherBrands.map(mapProductToView),
    };
  },

  getBySlug: async (slug: string): Promise<ProductViewModel> => {
    const product = await ProductApi.getBySlug(slug);
    return mapProductToView(product);
  },

  getById: async (id: string): Promise<ProductViewModel> => {
    const product = await ProductApi.getById(id);
    return mapProductToView(product);
  },

  getPersonalizedRecommendations: async () => {
    const response = await ProductApi.getPersonalizedRecommendations();
    return {
      ...response,
      items: response.items.map(mapProductToView),
    };
  },
};
