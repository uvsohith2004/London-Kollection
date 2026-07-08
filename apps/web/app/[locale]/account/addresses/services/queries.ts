import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useAddressesQuery = () => {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      try {
        const response = await api.get('/addresses');
        // @ts-ignore
        return response.items || [];
      } catch {
        return [];
      }
    }
  });
};
