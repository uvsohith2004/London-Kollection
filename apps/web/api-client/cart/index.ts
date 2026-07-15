import { get, post } from "../client";

export interface CartSummary {
  id: string;
  items: Array<{
    id: string;
    productId: string;
    variantId: string | null;
    productName: string;
    productSlug: string;
    sku: string;
    image?: string;
    optionValues: Record<string, string>;
    quantity: number;
    unitPrice: number;
    compareAtPrice?: number;
    discountValue: number;
    subtotal: number;
    isAvailable: boolean;
    stock: number;
  }>;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  deliveryFee: number;
  grandTotal: number;
  couponCode?: string | null;
}

export const CartApi = {
  getCart: async (): Promise<CartSummary> => {
    const res = await get<{ cart?: CartSummary }>(`/cart`);
    if (typeof window !== "undefined" && res?.cart?.id) {
      localStorage.setItem("guest-cart-id", res.cart.id);
    }
    return (res?.cart || res) as CartSummary;
  },
  addItem: async (productId: string, quantity: number, variantId?: string | null): Promise<CartSummary> => {
    return await post(`/cart/items`, { productId, variantId, quantity });
  },
  mergeCart: async (items: Array<{ productId: string; variantId?: string | null; quantity: number }>): Promise<CartSummary> => {
    return await post(`/cart/merge`, { items });
  }
};
