import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAddresses, createAddress, updateAddress } from "@/lib/api";

export const ADDRESSES_QUERY_KEY = ["addresses"];

export function useAddressesQuery() {
  return useQuery({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: async () => {
      const response = await fetchAddresses();
      // Assume the backend returns { data: [...] } or just [...]
      return (response as any)?.data || response || [];
    },
  });
}

export function useCreateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      return await createAddress(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}

export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return await updateAddress(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}
