"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Loader2 } from "lucide-react";
import { clearAuthFlowState } from "@/lib/auth-flow.server";
import { toast } from "sonner";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/sign-up");
    }
  }, [email, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: verifyError } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });

      if (verifyError) {
        throw new Error(verifyError.message || "Invalid verification code.");
      }

      await clearAuthFlowState();
      toast.success("Email verified successfully! Please sign in.");
      router.push("/sign-in");
    } catch (err: any) {
      setError(err.message || "Failed to verify email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setResending(true);
    setError("");
    try {
      const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (resendError) {
        throw new Error(resendError.message || "Failed to resend code.");
      }
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || "An error occurred while resending the code.");
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif tracking-tight">Verify Email</h1>
        <p className="text-muted-foreground text-sm font-light">
          We've sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-none text-center">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Input
            id="otp"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            disabled={loading}
            maxLength={6}
            className="text-center text-2xl tracking-[0.5em] h-14 uppercase"
            autoComplete="one-time-code"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 uppercase tracking-widest text-xs rounded-none bg-black text-white hover:bg-black/90 transition-colors relative overflow-hidden group"
          disabled={loading || otp.length !== 6}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify Account"}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          className="text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resending
            ? "Sending..."
            : cooldown > 0
            ? `Resend code in ${cooldown}s`
            : "Didn't receive a code? Resend"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
