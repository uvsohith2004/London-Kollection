import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CartApi } from "@/api/cart";
import { cartQueries } from "@/queries/cart.queries";
import { toast } from "sonner";
import { CartViewModel } from "@/services/mappers/cart.mapper";

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { productId: string; variantId?: string | null; quantity: number }) => {
      return await CartApi.addItem(payload.productId, payload.quantity, payload.variantId);
    },
    onSuccess: (data: any) => {
      if (data?.cart) {
        queryClient.setQueryData(cartQueries.current().queryKey, data.cart);
      } else {
        queryClient.invalidateQueries(cartQueries.current());
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
      const { put } = await import("@/api/client");
      return (await put(`/cart/items/${itemId}`, { quantity })) as any;
    },
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries(cartQueries.current());
      const previousCart = queryClient.getQueryData<CartViewModel>(cartQueries.current().queryKey);

      if (previousCart) {
        queryClient.setQueryData<CartViewModel>(cartQueries.current().queryKey, {
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
        queryClient.setQueryData(cartQueries.current().queryKey, data.cart);
      } else {
        queryClient.invalidateQueries(cartQueries.current());
      }
    },
    onError: (err, newTodo, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueries.current().queryKey, context.previousCart);
      }
      toast.error("Failed to update cart quantity");
    },
    onSettled: () => {
      queryClient.invalidateQueries(cartQueries.current());
    },
  });
};

export const useRemoveCartItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { del } = await import("@/api/client");
      return (await del(`/cart/items/${itemId}`)) as any;
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries(cartQueries.current());
      const previousCart = queryClient.getQueryData<CartViewModel>(cartQueries.current().queryKey);

      if (previousCart) {
        queryClient.setQueryData<CartViewModel>(cartQueries.current().queryKey, {
          ...previousCart,
          items: previousCart.items.filter((item) => item.id !== itemId),
        });
      }

      return { previousCart };
    },
    onSuccess: (data: any) => {
      if (data?.cart) {
        queryClient.setQueryData(cartQueries.current().queryKey, data.cart);
      } else {
        queryClient.invalidateQueries(cartQueries.current());
      }
      toast.success("Item removed");
    },
    onError: (err, itemId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueries.current().queryKey, context.previousCart);
      }
      toast.error("Failed to remove item");
    },
    onSettled: () => {
      queryClient.invalidateQueries(cartQueries.current());
    },
  });
};

export const useMergeCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: Array<{ productId: string; variantId?: string | null; quantity: number }>) => {
      return await CartApi.mergeCart(items);
    },
    onSuccess: (data: any) => {
      if (data?.cart) {
        queryClient.setQueryData(cartQueries.current().queryKey, data.cart);
      } else {
        queryClient.invalidateQueries(cartQueries.current());
      }
    },
    onError: (error) => {
      console.error("Failed to merge cart:", error);
    },
  });
};
