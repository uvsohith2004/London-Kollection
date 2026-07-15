import { get, post, put, del } from "../client";

export const CategoryApi = {
  getAll: async () => {
    return await get("/categories");
  },
  getById: async (id: string) => {
    return await get(`/categories/${id}`);
  },
  getFeatured: async () => {
    return await get("/categories/featured");
  },
  getRecentlyUpdated: async () => {
    return await get("/categories/recently-updated");
  },
  create: async (payload: any) => {
    return await post("/admin/categories", payload);
  },
  update: async (id: string, payload: any) => {
    return await put(`/admin/categories/${id}`, payload);
  },
  delete: async (id: string) => {
    return await del(`/admin/categories/${id}`);
  }
};
