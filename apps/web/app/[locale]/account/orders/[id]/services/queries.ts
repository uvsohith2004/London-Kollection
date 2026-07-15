import { useQuery } from "@tanstack/react-query";
import { api } from "@/api-client";

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

export const useOrderReturnQuery = (orderId: string) => {
  return useQuery({
    queryKey: ["order-return", orderId],
    queryFn: async () => {
      try {
        const response: any = await api.get(`/commerce/returns`);
        const allReturns = response?.data || response || [];
        return allReturns.find((r: any) => r.orderId === orderId) || null;
      } catch {
        return null;
      }
    },
    enabled: !!orderId
  });
};
