import { useQuery } from "@tanstack/react-query";
import { fetchAddresses } from "@/api-client";

export const useAddressesQuery = (initialData?: any[]) => {
  return useQuery({
    queryKey: ["addresses"],
    initialData,
    queryFn: async () => {
      try {
        const response = await fetchAddresses();
        return (response as any)?.items || response || [];
      } catch {
        return [];
      }
    }
  });
};
