"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { authClient } from "@/lib/auth-client"
import { useAuthStore } from "@/store/auth-store"
import { useEffect } from "react"
import { useSignUpMutation } from "./mutations"
import { useGoogleSignInMutation } from "../sign-in/mutations"
import { Input } from "@workspace/ui/components/input"
import { PasswordInput } from "@workspace/ui/components/password-input"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { useSubtleEntrance } from "@/hooks/use-subtle-animation"

export default function SignUpPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const redirectUrl = useAuthStore((state) => state.redirectUrl)
  const setRedirectUrl = useAuthStore((state) => state.setRedirectUrl)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { mutate: signUp, isPending: loading } = useSignUpMutation()
  const { mutate: googleSignIn } = useGoogleSignInMutation()

  const { data: session } = authClient.useSession()

  useEffect(() => {
    if (session) {
      router.push("/account")
    }
  }, [session, router])

  useSubtleEntrance(containerRef)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    signUp({
      email,
      password,
      name,
    }, {
      onError: (err) => {
        setError(err.message || "Failed to create account")
      }
    })
  }

  const handleGoogleSignIn = () => {
    googleSignIn()
  }

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-foreground" />
          <p className="animate-pulse text-sm font-medium tracking-widest uppercase">
            Creating account...
          </p>
        </div>
      )}
      <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background font-sans md:grid md:grid-cols-2">
      {/* Left Pane - Cinematic Fashion Hero (Hidden on Mobile) */}
      <div className="relative hidden h-full w-full flex-col justify-between overflow-hidden bg-black p-12 md:flex">
        <div className="absolute inset-0 h-full w-full">
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
          <Link
            href="/"
            className="font-heading text-xl font-bold tracking-[0.2em] text-white uppercase"
          >
            LK.
          </Link>
        </div>

        {/* Bottom Text Area */}
        <div className="relative z-10 max-w-md">
          <h2 className="mb-4 font-heading text-4xl font-light tracking-tight text-white lg:text-5xl">
            Join the <br />
            <span className="font-medium italic">exclusive.</span>
          </h2>
          <p className="text-base leading-relaxed font-light text-white/70">
            Create an account to unlock personalized recommendations, early
            access to new collections, and faster checkout.
          </p>
        </div>
      </div>

      {/* Right Pane - Minimalist Form Area */}
      <div className="relative z-10 flex flex-1 flex-col justify-center overflow-y-auto bg-background px-6 py-12 md:px-16 lg:px-32">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="mb-12 flex justify-center md:hidden">
          <Link
            href="/"
            className="font-heading text-2xl font-bold tracking-[0.2em] text-foreground uppercase"
          >
            LK.
          </Link>
        </div>

        <div ref={containerRef} className="mx-auto w-full max-w-sm">
          <div className="animate-item mb-10 text-center md:text-left">
            <h1 className="mb-2 font-heading text-3xl font-light tracking-tight text-foreground">
              Create Account
            </h1>
            <p className="text-sm font-light text-muted-foreground">
              Enter your details below to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="animate-item relative">
                <Input
                  id="name"
                  type="text"
                  placeholder="Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 w-full rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-foreground transition-colors placeholder:text-muted-foreground/70 focus-visible:border-foreground focus-visible:ring-0"
                />
              </div>

              <div className="animate-item relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-foreground transition-colors placeholder:text-muted-foreground/70 focus-visible:border-foreground focus-visible:ring-0"
                />
              </div>

              <div className="animate-item relative">
                <PasswordInput
                  id="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-foreground transition-colors placeholder:text-muted-foreground/70 focus-visible:border-foreground focus-visible:ring-0"
                />
              </div>
            </div>

            {error && (
              <div className="animate-item bg-destructive/5 p-3 text-center text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            <div className="animate-item space-y-4 pt-2">
              <Button
                type="submit"
                className="h-14 w-full rounded-none bg-foreground text-xs font-medium tracking-[0.15em] text-background uppercase transition-all hover:bg-foreground/90"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="relative flex items-center py-2">
                <div className="grow border-t border-border/50"></div>
                <span className="shrink-0 px-4 text-xs tracking-widest text-muted-foreground uppercase">
                  Or
                </span>
                <div className="grow border-t border-border/50"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-none border-border bg-transparent text-sm font-medium text-foreground transition-all hover:bg-muted/50"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>
          </form>

          <div className="animate-item mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
