import { useQuery } from "@tanstack/react-query";
import { fetchAddresses } from "@/lib/api";

export const useAddressesQuery = () => {
  return useQuery({
    queryKey: ["addresses"],
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
