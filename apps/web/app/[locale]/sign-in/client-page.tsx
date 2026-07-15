"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";
import { useSignInMutation, useGoogleSignInMutation } from "./mutations";
import { Input } from "@workspace/ui/components/input";
import { PasswordInput } from "@workspace/ui/components/password-input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { useSubtleEntrance } from "@/hooks/use-subtle-animation";
import { toast } from "sonner";
import { setAuthFlowState } from "@/lib/auth-flow.server";

export default function SignInPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const redirectUrl = useAuthStore((state) => state.redirectUrl);
  const setRedirectUrl = useAuthStore((state) => state.setRedirectUrl);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resending, setResending] = useState(false);
  const { mutate: signIn, isPending: loading, error: signInError } = useSignInMutation();
  const { mutate: googleSignIn } = useGoogleSignInMutation();

  const { data: session, isPending: sessionLoading } = authClient.useSession();

  useEffect(() => {
    if (session) {
      router.push("/account");
    }
  }, [session, router]);

  useSubtleEntrance(containerRef);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    signIn({
      email,
      password,
    }, {
      onError: (err) => {
        if (err.message?.toLowerCase().includes("not verified") || (err as any).code === "EMAIL_NOT_VERIFIED") {
          setUnverifiedEmail(email);
        } else {
          setError(err.message || "Failed to sign in");
        }
      }
    });
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/users/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to resend verification email");
      }
      toast.success("Verification email sent!");
      await setAuthFlowState("verify_email");
      router.push(`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to resend verification email");
    } finally {
      setResending(false);
    }
  };

  const handleGoogleSignIn = () => {
    googleSignIn();
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Loader2 className="h-10 w-10 animate-spin text-foreground mb-4" />
          <p className="text-sm font-medium tracking-widest uppercase animate-pulse">Authenticating...</p>
        </div>
      )}
      <div className="min-h-dvh flex flex-col md:grid md:grid-cols-2 bg-background relative overflow-hidden font-sans">
      
      {/* Left Pane - Cinematic Fashion Hero (Hidden on Mobile) */}
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
        
        {/* Top Logo Area */}
        <div className="relative z-10">
          <Link href="/" className="text-white text-xl font-bold tracking-[0.2em] uppercase font-heading">
            LK.
          </Link>
        </div>

        {/* Bottom Text Area */}
        <div className="relative z-10 max-w-md">
          <h2 className="font-heading text-4xl lg:text-5xl font-light tracking-tight mb-4 text-white">
            Elegance <br/><span className="font-medium italic">redefined.</span>
          </h2>
          <p className="text-white/70 text-base font-light leading-relaxed">
            Curated pieces for the modern aesthete. Sign in to access your exclusive wardrobe and luxury experiences.
          </p>
        </div>
      </div>

      {/* Right Pane - Minimalist Form Area */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-32 relative z-10 bg-background overflow-y-auto">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex justify-center mb-12">
          <Link href="/" className="text-foreground text-2xl font-bold tracking-[0.2em] uppercase font-heading">
            LK.
          </Link>
        </div>

        {unverifiedEmail ? (
          <div ref={containerRef} className="w-full max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-300 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-light tracking-tight font-heading text-foreground mb-4">
              Email Not Verified
            </h1>
            <p className="text-muted-foreground text-sm font-light mb-8 leading-relaxed">
              Your email address <span className="font-medium text-foreground">{unverifiedEmail}</span> has not been verified yet. Please verify your email before signing in.
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={handleResendVerification} 
                disabled={resending}
                className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 rounded-none uppercase tracking-[0.15em] text-xs font-medium transition-all"
              >
                {resending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Resend Verification Email"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setUnverifiedEmail("")}
                className="w-full h-14 bg-transparent border-border hover:bg-muted/50 rounded-none text-foreground text-xs uppercase tracking-[0.15em] font-medium transition-all"
              >
                Use a Different Email
              </Button>
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="w-full max-w-sm mx-auto">
            
            <div className="mb-10 animate-item text-center md:text-left">
              <h1 className="text-3xl font-light tracking-tight font-heading text-foreground mb-2">
                Welcome back
              </h1>
              <p className="text-muted-foreground text-sm font-light">
                Enter your details to sign in to your account.
              </p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="relative animate-item">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full bg-transparent border-0 border-b border-border/60 rounded-none px-0 text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                />
              </div>
              
              <div className="relative animate-item flex flex-col gap-2">
                <PasswordInput
                  id="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full bg-transparent border-0 border-b border-border/60 rounded-none px-0 text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:border-foreground transition-colors"
                />
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
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
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign in"}
              </Button>

              <div className="relative flex items-center py-2">
                <div className="grow border-t border-border/50"></div>
                <span className="shrink-0 px-4 text-xs text-muted-foreground uppercase tracking-widest">Or</span>
                <div className="grow border-t border-border/50"></div>
              </div>

              <Button 
                type="button" 
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full h-14 bg-transparent border-border hover:bg-muted/50 rounded-none text-foreground text-sm font-medium transition-all flex items-center justify-center gap-3" 
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>
            </div>
          </form>

          <div className="mt-12 text-center animate-item">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-foreground font-medium hover:underline underline-offset-4">
                Create one
              </Link>
            </p>
          </div>
        </div>
        )}

      </div>
    </div>
    </>
  );
}
