import { get } from "../client";
import type { ProductsResponse } from "@workspace/api-contracts";

export const FlashSaleApi = {
  getProducts: async (): Promise<ProductsResponse> => {
    return await get(`/flash-sale/flash-sale-products`);
  }
};
