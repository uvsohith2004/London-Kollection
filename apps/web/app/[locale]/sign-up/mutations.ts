import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { setAuthFlowState } from "@/lib/auth-flow.server";

export function useSignUpMutation() {
  const router = useRouter();
  const redirectUrl = useAuthStore((state) => state.redirectUrl);
  const setRedirectUrl = useAuthStore((state) => state.setRedirectUrl);

  return useMutation({
    mutationFn: async (credentials: Parameters<typeof authClient.signUp.email>[0]) => {
      // Pre-check if email exists and is verified
      const res = await fetch(`/api/users/check-email?email=${encodeURIComponent(credentials.email)}`);
      const { data: { exists, verified } = {} } = await res.json();
      
      if (exists && verified) {
        throw new Error("This email is already registered. Please sign in.");
      }

      if (exists && !verified) {
        // User exists but hasn't verified their email.
        // We bypass `signUp.email` (which would throw "User already exists") 
        // and just return so `onSuccess` can resend the OTP.
        return { isResendOnly: true, email: credentials.email };
      }

      const { data, error } = await authClient.signUp.email(credentials);
      
      if (error) {
        throw new Error(error.message || "Failed to create account");
      }
      
      return { ...data, email: credentials.email };
    },
    onSuccess: async (data: any) => {
      // Send OTP automatically after sign up (or for unverified existing users)
      const targetEmail = data?.email || data?.user?.email;
      if (targetEmail) {
        authClient.emailOtp.sendVerificationOtp({
          email: targetEmail,
          type: "email-verification"
        }).catch(console.error);
        
        await setAuthFlowState("verify_email");
        router.push(`/verify-email?email=${encodeURIComponent(targetEmail)}`);
      }
    }
  });
}
