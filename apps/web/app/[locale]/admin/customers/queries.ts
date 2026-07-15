import { useQuery } from "@tanstack/react-query"
import { fetchAdminUsers } from "@/api/index"

export const adminCustomerKeys = {
  all: ["adminCustomers"] as const,
}

export function useAdminCustomersQuery(params?: any) {
  return useQuery({
    queryKey: [...adminCustomerKeys.all, params],
    queryFn: () => fetchAdminUsers(params),
  })
}
