"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Loader2 } from "lucide-react";
import { useSubtleEntrance } from "@/hooks/use-subtle-animation";
import { setAuthFlowState } from "@/lib/auth-flow.server";

export default function ForgotPasswordPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useSubtleEntrance(containerRef);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError("");

    try {
      const { error: resetError } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "forget-password"
      });

      if (resetError) {
        setError(resetError.message || "Failed to send reset instructions.");
      } else {
        await setAuthFlowState("reset_password");
        window.location.href = `/reset-password?email=${encodeURIComponent(email)}`;
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

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
            Lost your key? <br/><span className="font-medium italic">Let's find it.</span>
          </h2>
          <p className="text-white/70 text-base font-light leading-relaxed">
            Enter your email to receive a 6-digit verification code to reset your password and regain access to your exclusive wardrobe.
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

        <div ref={containerRef} className="w-full max-w-sm mx-auto">
          <div className="mb-10 animate-item text-center md:text-left">
            <h1 className="text-3xl font-light tracking-tight font-heading text-foreground mb-2">
              Forgot Password
            </h1>
            <p className="text-muted-foreground text-sm font-light">
              Enter the email address associated with your account.
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
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
                </Button>
                
                <div className="text-center pt-4">
                  <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}
