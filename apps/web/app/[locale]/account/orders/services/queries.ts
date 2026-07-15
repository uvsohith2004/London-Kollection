import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";

export const useUserOrdersQuery = () => {
  return useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const response = await api.get('/orders');
      // @ts-ignore
      return response.items || [];
    }
  });
};
