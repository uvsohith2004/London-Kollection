import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { setAuthFlowState } from "@/lib/auth-flow.server";

export function useSignInMutation() {
  const router = useRouter();
  const redirectUrl = useAuthStore((state) => state.redirectUrl);
  const setRedirectUrl = useAuthStore((state) => state.setRedirectUrl);

  return useMutation({
    mutationFn: async (credentials: Parameters<typeof authClient.signIn.email>[0]) => {
      const { data, error } = await authClient.signIn.email(credentials);
      
      if (error) {
        // Throwing error allows React Query's onError to catch it
        throw new Error(error.message || "Failed to sign in");
      }
      
      return data;
    },
    onSuccess: async (data) => {
      if ((data as any)?.twoFactorRedirect) {
        await setAuthFlowState("verify_otp");
        router.push("/verify-otp");
      } else {
        router.push("/auth/callback");
      }
    }
  });
}

export function useGoogleSignInMutation() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/auth/callback"
      });

      if (error) {
        throw new Error(error.message || "Failed to sign in with Google");
      }
      return data;
    }
  });
}
