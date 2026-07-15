import { get, post, del } from "../client";

export const WishlistApi = {
  getWishlist: async () => {
    return await get(`/wishlist`);
  },
  addItem: async (productId: string, variantId?: string | null) => {
    return await post(`/wishlist`, { productId, variantId });
  },
  removeItem: async (productId: string) => {
    return await del(`/wishlist/${productId}`);
  }
};
