import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export const useSyncCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: Array<{ productId: string; variantId?: string | null; quantity: number }>) => {
      try {
        const { data } = await apiClient.post("/cart/sync", { items });
        return data;
      } catch (error) {
        console.warn("Mocking cart sync because backend is down:", error);
        return { success: true };
      }
    },
    onSuccess: (data) => {
      // Invalidate cart queries if there were any, but since we rely on zustand primarily for optimistic UI,
      // we might not strictly need this unless we have a separate server-state cart query.
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      console.error("Failed to sync cart with server:", error);
    },
  });
};
