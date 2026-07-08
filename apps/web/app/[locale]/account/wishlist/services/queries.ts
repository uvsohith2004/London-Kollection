import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useWishlistQuery = () => {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      try {
        const response = await api.get('/wishlist');
        // @ts-ignore
        return response.items || [];
      } catch {
        return [];
      }
    }
  });
};
