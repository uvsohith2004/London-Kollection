import { get, post, put, del } from "../client";

export const AddressApi = {
  getAll: async () => {
    return await get(`/fulfillment/addresses`);
  },
  create: async (payload: any) => {
    return await post(`/fulfillment/addresses`, payload);
  },
  update: async (id: string, payload: any) => {
    return await put(`/fulfillment/addresses/${id}`, payload);
  },
  delete: async (id: string) => {
    return await del(`/fulfillment/addresses/${id}`);
  },
  setDefault: async (id: string, type: string) => {
    return await put(`/fulfillment/addresses/${id}`, { default: true, type });
  }
};
