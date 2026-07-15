import { get, post, put } from "../client";
import type { CustomerReviewResponse } from "@workspace/api-contracts";

export const ReviewApi = {
  getAll: async (): Promise<CustomerReviewResponse> => {
    return await get(`/customer-reviews`);
  },
  createDraft: async (payload: { orderId: string, orderItemId: string }) => {
    return await post(`/reviews/draft`, payload);
  },
  getDraft: async (id: string) => {
    return await get(`/reviews/${id}/form`);
  },
  updateDraft: async (id: string, payload: any) => {
    return await put(`/reviews/${id}/draft`, payload);
  },
  submitDraft: async (id: string, payload: any) => {
    return await post(`/reviews/${id}/submit`, payload);
  }
};
