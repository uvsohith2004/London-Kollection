import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api-client";

export const useRemoveFromWishlistMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      return await api.delete(`/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    }
  });
};
