import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CartService } from "../services/cart.service";
import { cartQueries } from "./cart.queries";
import { toast } from "sonner";

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity, variantId }: { productId: string; quantity: number; variantId?: string | null }) =>
      CartService.addItem(productId, quantity, variantId),
    onMutate: async (newItem) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(cartQueries.current());

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(cartQueries.current().queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(cartQueries.current().queryKey, (old: any) => {
        if (!old) return old;
        // Simple optimistic addition
        return {
          ...old,
          items: [
            ...old.items,
            { ...newItem, id: 'temp-id', productName: 'Loading...', unitPrice: 0 }
          ]
        };
      });

      // Return a context object with the snapshotted value
      return { previousCart };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(cartQueries.current().queryKey, context?.previousCart);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(cartQueries.current());
    },
  });
};
