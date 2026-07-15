import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckoutService } from "@/services/checkout.service";

export const ADDRESSES_QUERY_KEY = ["addresses"];

export function useAddressesQuery() {
  return useQuery({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: () => CheckoutService.getAddresses(),
  });
}

export function useCreateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => CheckoutService.createAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}

export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => CheckoutService.updateAddress(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}
