import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export const useProfileQuery = () => {
  // We wrap the auth client session hook to maintain consistent data fetching patterns
  const { data: session, isPending, error } = authClient.useSession();
  
  return {
    session,
    isLoading: isPending,
    isError: !!error,
    error
  };
};

export const useConnectedAccountsQuery = () => {
  return useQuery({
    queryKey: ["connected-accounts"],
    queryFn: async () => {
      const res = await fetch("/api/users/accounts");
      if (!res.ok) throw new Error("Failed to fetch accounts");
      const { data } = await res.json();
      return data;
    }
  });
};
