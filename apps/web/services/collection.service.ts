import { CollectionApi } from "@/api-client/collections";

export const CollectionService = {
  getFeatured: async () => {
    return await CollectionApi.getFeatured();
  },
  getAdminAll: async (params?: any) => {
    return await CollectionApi.getAdminAll(params);
  }
};
