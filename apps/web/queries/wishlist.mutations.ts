import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api-client";
import { wishlistQueries } from "./wishlist.queries";

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, variantId }: { productId: string; variantId?: string | null }) => {
      const res = await api.post("/wishlist", { productId, variantId });
      return res.data || res;
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries(wishlistQueries.current());
      const previousWishlist = queryClient.getQueryData<any[]>(wishlistQueries.current().queryKey);
      
      queryClient.setQueryData(wishlistQueries.current().queryKey, (old: any) => {
        const items = Array.isArray(old) ? old : (old?.items || []);
        return [...items, { ...newItem, id: newItem.productId }];
      });

      return { previousWishlist };
    },
    onError: (err, newItem, context) => {
      queryClient.setQueryData(wishlistQueries.current().queryKey, context?.previousWishlist);
    },
    onSettled: () => {
      queryClient.invalidateQueries(wishlistQueries.current());
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.delete(`/wishlist/${productId}`);
      return res.data || res;
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries(wishlistQueries.current());
      const previousWishlist = queryClient.getQueryData<any[]>(wishlistQueries.current().queryKey);
      
      queryClient.setQueryData(wishlistQueries.current().queryKey, (old: any) => {
        const items = Array.isArray(old) ? old : (old?.items || []);
        return items.filter((item: any) => item.productId !== productId && item.id !== productId);
      });

      return { previousWishlist };
    },
    onError: (err, productId, context) => {
      queryClient.setQueryData(wishlistQueries.current().queryKey, context?.previousWishlist);
    },
    onSettled: () => {
      queryClient.invalidateQueries(wishlistQueries.current());
    },
  });
};
