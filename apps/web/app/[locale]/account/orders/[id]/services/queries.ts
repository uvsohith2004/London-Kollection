import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useOrderDetailsQuery = (id: string) => {
  return useQuery({
    queryKey: ["order-details", id],
    queryFn: async () => {
      const response: any = await api.get(`/orders/${id}`);
      return response?.order ?? response;
    },
    enabled: !!id
  });
};
