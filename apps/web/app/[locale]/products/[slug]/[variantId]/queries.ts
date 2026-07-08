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
  specifications?: { key: string; value: string }[];
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
    lengthUnit?: string;
    weightUnit?: string;
  };
}

export const useProductQuery = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/products/slug/${slug}`);
      return (response.data || null) as Product | null;
    },
  });
};

export const useRelatedProductsQuery = (productId?: string) => {
  return useQuery({
    queryKey: ["product", productId, "related"],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/products/${productId}/related?limit=4`);
      return ((response as any).items || response.data || []) as Product[];
    },
    enabled: !!productId,
  });
};
