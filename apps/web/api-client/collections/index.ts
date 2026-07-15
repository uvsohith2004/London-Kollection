import { get, post, put, del } from "../client";
import type { Collection } from "@workspace/api-contracts";

export const CollectionApi = {
  getFeatured: async (): Promise<Collection[]> => {
    return await get(`/featured/collections`);
  },
  getAdminAll: async (params?: any) => {
    return await get("/collections", { params });
  },
  create: async (payload: any) => {
    return await post("/admin/collections", payload);
  },
  update: async (id: string, payload: any) => {
    return await put(`/admin/collections/${id}`, payload);
  },
  delete: async (id: string) => {
    return await del(`/admin/collections/${id}`);
  }
};
