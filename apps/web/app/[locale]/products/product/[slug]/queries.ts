import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export interface ProductVariant {
  id: string;
  sku: string;
  price: string | null;
  compareAtPrice?: number | null;
  stock: number;
  inventoryStatus?: "in_stock" | "out_of_stock" | "pre_order" | "coming_soon";
  combinations: Record<string, string>;
}

export interface ProductOption {
  id: string;
  name: string;
  position: number;
  values: { id: string; value: string }[];
}

import type { OptimizedImageAsset } from "@/components/optimized-image";

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: string;
  discount: string | null;
  images: { id: string; url?: string; asset?: OptimizedImageAsset | null; isPrimary: boolean; sortOrder: number }[];
  options: ProductOption[];
  variants: ProductVariant[];
}

export const useProductQuery = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; item: Product }>(`/products/slug/${slug}`);
      return (response as unknown as { success: boolean; item: Product }).item;
    },
  });
};
