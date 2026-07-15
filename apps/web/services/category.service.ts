import { CategoryApi } from "@/api/categories";

export const CategoryService = {
  getAll: async () => {
    return await CategoryApi.getAll();
  },
  getById: async (id: string) => {
    return await CategoryApi.getById(id);
  },
  getFeatured: async () => {
    return await CategoryApi.getFeatured();
  },
  getRecentlyUpdated: async () => {
    return await CategoryApi.getRecentlyUpdated();
  }
};
