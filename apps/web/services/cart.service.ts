import { CartApi } from "@/api-client/cart";
import { mapCartToView, type CartViewModel } from "./mappers/cart.mapper";

export const CartService = {
  getCart: async (): Promise<CartViewModel> => {
    const cart = await CartApi.getCart();
    return mapCartToView(cart);
  },
  
  addItem: async (productId: string, quantity: number, variantId?: string | null): Promise<CartViewModel> => {
    const cart = await CartApi.addItem(productId, quantity, variantId);
    return mapCartToView(cart);
  },

  mergeCart: async (items: Array<{ productId: string; variantId?: string | null; quantity: number }>): Promise<CartViewModel> => {
    const cart = await CartApi.mergeCart(items);
    return mapCartToView(cart);
  }
};
