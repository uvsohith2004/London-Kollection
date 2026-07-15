"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { authClient } from "@/lib/auth-client"
import { mergeCartApi } from "@/api-client"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const redirectUrl = useAuthStore((state) => state.redirectUrl)
  const pendingAction = useAuthStore((state) => state.pendingAction)
  const uiState = useAuthStore((state) => state.uiState)
  const clearPreAuthState = useAuthStore((state) => state.clearPreAuthState)

  const [status, setStatus] = useState("Validating session...")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const processCallback = async () => {
      try {
        // Check URL parameters for OAuth errors FIRST
        const searchParams = new URLSearchParams(window.location.search);
        const authError = searchParams.get("error");
        
        if (authError) {
          if (
            authError === "AccountExistsWithDifferentProvider" || 
            authError === "OAuthAccountNotLinked" || 
            authError === "UserExistsWithDifferentProvider" ||
            authError === "EmailAlreadyInUse"
          ) {
            throw new Error("This account was created using Email & Password. Please sign in with your password first. After signing in, you can connect your Google account from your Account Settings.");
          } else {
            throw new Error(authError);
          }
        }

        // 1. Validate session
        setStatus("Validating session...")
        let session = await authClient.getSession({
          fetchOptions: {
            cache: "no-store"
          }
        })
        
        if (!session?.data?.session) {
          // Add a short delay and retry to avoid race conditions with cookie setting
          await new Promise(resolve => setTimeout(resolve, 1500))
          session = await authClient.getSession({
            fetchOptions: {
              cache: "no-store"
            }
          })
          
          if (!session?.data?.session) {
            throw new Error("Invalid session. Please try logging in again.")
          }
        }

        // 2. Synchronize Data (Cart & Wishlist)
        setStatus("Synchronizing your data...")
        try {
          const localCart: any = queryClient.getQueryData(["cart"]);
          const localItems = localCart?.items || [];
          if (localItems && localItems.length > 0) {
            await mergeCartApi(localItems.map((item: any) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity
            })))
          }
        } catch (err) {
          console.error("Cart merge failed:", err)
          // Non-fatal error, continue
        }

        // (Future: Wishlist merge could go here)

        // 3. Process Pending Actions
        if (pendingAction === 'ADD_TO_CART' && uiState?.productId) {
          setStatus("Restoring your selections...")
          // The cart state will be re-fetched by react-query soon, 
          // but we can also execute the API call here if needed
          // e.g. await addToCartApi(uiState.productId, uiState.quantity || 1, uiState.variantId)
        }

        // 4. Refresh Caches
        setStatus("Preparing your account...")
        await queryClient.invalidateQueries()
        
        // Clear guest cart ID
        localStorage.removeItem("guest-cart-id");

        // 5. Fire Analytics
        const w = typeof window !== "undefined" ? window as any : null;
        if (w && w.gtag) {
          w.gtag("event", "login", {
            method: "auth", // better-auth session doesn't directly expose provider
            user_id: session.data.user.id
          });
        } else {
          console.log("[Analytics] Auth Callback Success:", { userId: session.data.user.id })
        }

        if (!mounted) return

        // 6. Redirect
        const destination = redirectUrl || "/account"
        clearPreAuthState()
        router.replace(destination)
        
      } catch (err: any) {
        if (!mounted) return
        console.error("Auth callback error:", err)
        // Fire analytics for error
        const w = typeof window !== "undefined" ? window as any : null;
        if (w && w.gtag) {
          w.gtag("event", "exception", {
            description: "auth_callback_error",
            fatal: false
          });
        }
        setError(err.message || "An unexpected error occurred during authentication.")
      }
    }

    processCallback()

    return () => {
      mounted = false
    }
  }, [router, redirectUrl, pendingAction, uiState, clearPreAuthState, queryClient])

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-serif text-destructive">Authentication Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => router.push("/sign-in")}
            className="px-6 py-2 bg-primary text-primary-foreground text-sm uppercase tracking-widest font-semibold hover:bg-primary/90 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-500">
        <Loader2 className="h-12 w-12 animate-spin text-primary" strokeWidth={1} />
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-serif tracking-tight">Please wait...</h1>
          <p className="text-muted-foreground font-light">We're securely signing you in and restoring your session.</p>
          <p className="text-xs text-muted-foreground/70 uppercase tracking-widest mt-4 h-4 transition-all duration-300">
            {status}
          </p>
        </div>
      </div>
    </div>
  )
}
