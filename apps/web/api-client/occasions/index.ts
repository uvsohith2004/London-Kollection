import { get } from "../client";
import type { OccasionResponse } from "@workspace/api-contracts";

export const OccasionApi = {
  getAll: async (): Promise<OccasionResponse> => {
    return await get(`/collections/occasions`);
  }
};
