 "use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Input } from "@workspace/ui/components/input";
import { PasswordInput } from "@workspace/ui/components/password-input";
import { Button } from "@workspace/ui/components/button";
import { Loader2 } from "lucide-react";
import { useSubtleEntrance } from "@/hooks/use-subtle-animation";
import { clearAuthFlowState } from "@/lib/auth-flow.server";

function ResetPasswordForm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useSubtleEntrance(containerRef);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!email || !otp) {
      setError("Missing email or verification code.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const { error: resetError } = await authClient.emailOtp.resetPassword({
        email,
        otp,
        password,
      });

      if (resetError) {
        setError(resetError.message || "Failed to reset password.");
      } else {
        await clearAuthFlowState();
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-serif text-foreground mb-4">Invalid Request</h1>
        <p className="text-muted-foreground mb-6">No email address provided for password reset.</p>
        <Link 
          href="/forgot-password"
          className="flex items-center justify-center h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none w-auto"
        >
          Try Again
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full max-w-sm mx-auto">
      <div className="mb-10 animate-item text-center md:text-left">
        <h1 className="text-3xl font-light tracking-tight font-heading text-foreground mb-2">
          New Password
        </h1>
        <p className="text-muted-foreground text-sm font-light">
          Enter your new password below to secure your account.
        </p>
      </div>

      {success ? (
        <div className="animate-item space-y-6">
          <div className="p-4 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-sm font-medium text-center">
            Your password has been successfully reset.
          </div>
          <Link 
            href="/sign-in"
            className="flex items-center justify-center w-full h-14 bg-foreground text-background hover:bg-foreground/90 rounded-none uppercase tracking-[0.15em] text-xs font-medium transition-all"
          >
            Sign In Now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="relative animate-item">
              <Input
                id="otp"
                placeholder="6-Digit Code"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                className="h-12 w-full bg-transparent border-0 border-b border-border/60 rounded-none px-0 text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>

            <div className="relative animate-item">
              <PasswordInput
                id="password"
                placeholder="New Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full bg-transparent border-0 border-b border-border/60 rounded-none px-0 text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
              />
            </div>
            
            <div className="relative animate-item">
              <PasswordInput
                id="confirm-password"
                placeholder="Confirm New Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 w-full bg-transparent border-0 border-b border-border/60 rounded-none px-0 text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/5 text-destructive text-sm font-medium animate-item text-center">
              {error}
            </div>
          )}

          <div className="animate-item space-y-4 pt-2">
            <Button 
              type="submit" 
              className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 rounded-none uppercase tracking-[0.15em] text-xs font-medium transition-all" 
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset Password"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-dvh flex flex-col md:grid md:grid-cols-2 bg-background relative overflow-hidden font-sans">
      {/* Left Pane - Cinematic Fashion Hero */}
      <div className="hidden md:flex flex-col justify-between relative h-full w-full bg-black overflow-hidden p-12">
        <div className="absolute inset-0 w-full h-full">
          <Image 
            src="/assets/auth-bg.png" 
            alt="London Kollection Fashion" 
            fill 
            className="object-cover opacity-90"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-black/30" />
        
        <div className="relative z-10">
          <Link href="/" className="text-white text-xl font-bold tracking-[0.2em] uppercase font-heading">
            LK.
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="font-heading text-4xl lg:text-5xl font-light tracking-tight mb-4 text-white">
            Secure your <br/><span className="font-medium italic">account.</span>
          </h2>
          <p className="text-white/70 text-base font-light leading-relaxed">
            Choose a strong password to ensure your wardrobe and personal information remains safe.
          </p>
        </div>
      </div>

      {/* Right Pane - Form Area */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-32 relative z-10 bg-background overflow-y-auto">
        <div className="md:hidden flex justify-center mb-12">
          <Link href="/" className="text-foreground text-2xl font-bold tracking-[0.2em] uppercase font-heading">
            LK.
          </Link>
        </div>

        <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
