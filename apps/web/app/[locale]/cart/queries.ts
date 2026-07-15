import { useQuery } from "@tanstack/react-query";
import { cartQueries } from "@/queries/cart.queries";

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
  return useQuery(cartQueries.current());
};

