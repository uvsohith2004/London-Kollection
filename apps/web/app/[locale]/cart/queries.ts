import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

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

export const useCartQuery = () => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ cart: CartSummary }>("/cart");
      if (typeof window !== "undefined" && data.cart?.id) {
        localStorage.setItem("guest-cart-id", data.cart.id);
      }
      return data.cart;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
