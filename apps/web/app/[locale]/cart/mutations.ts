import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { CartSummary } from "./queries";
import { toast } from "sonner";

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { productId: string; variantId?: string | null; quantity: number }) => {
      const { data } = await apiClient.post("/cart/items", payload);
      return data;
    },
    onSuccess: (data: any) => {
      if (data?.cart) {
        queryClient.setQueryData(["cart"], data.cart);
      } else {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      }
      toast.success("Added to cart");
    },
    onError: (error) => {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add item to cart");
    },
  });
};

export const useUpdateCartItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const { data } = await apiClient.put(`/cart/items/${itemId}`, { quantity });
      return data;
    },
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<CartSummary>(["cart"]);

      if (previousCart) {
        queryClient.setQueryData<CartSummary>(["cart"], {
          ...previousCart,
          items: previousCart.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
      }

      return { previousCart };
    },
    onSuccess: (data: any) => {
      if (data?.cart) {
        queryClient.setQueryData(["cart"], data.cart);
      } else {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      }
    },
    onError: (err, newTodo, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      toast.error("Failed to update cart quantity");
    },
    onSettled: () => {
      // Re-fetch to guarantee perfect synchronization
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useRemoveCartItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await apiClient.delete(`/cart/items/${itemId}`);
      return data;
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<CartSummary>(["cart"]);

      if (previousCart) {
        queryClient.setQueryData<CartSummary>(["cart"], {
          ...previousCart,
          items: previousCart.items.filter((item) => item.id !== itemId),
        });
      }

      return { previousCart };
    },
    onSuccess: (data: any) => {
      if (data?.cart) {
        queryClient.setQueryData(["cart"], data.cart);
      } else {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      }
      toast.success("Item removed");
    },
    onError: (err, itemId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      toast.error("Failed to remove item");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useMergeCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: Array<{ productId: string; variantId?: string | null; quantity: number }>) => {
      const { data } = await apiClient.post("/cart/merge", { items });
      return data;
    },
    onSuccess: (data: any) => {
      if (data?.cart) {
        queryClient.setQueryData(["cart"], data.cart);
      } else {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      }
    },
    onError: (error) => {
      console.error("Failed to merge cart:", error);
    },
  });
};
