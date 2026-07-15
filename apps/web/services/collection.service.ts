import { CollectionApi } from "@/api/collections";

export const CollectionService = {
  getFeatured: async () => {
    return await CollectionApi.getFeatured();
  },
  getAdminAll: async (params?: any) => {
    return await CollectionApi.getAdminAll(params);
  }
};
