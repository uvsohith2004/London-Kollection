import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

import { useAuthStore } from "@/store/auth-store"

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const clearPreAuthState = useAuthStore((state) => state.clearPreAuthState)

  const logout = async () => {
    // 1. Sign out on the backend
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
        }
      }
    })

    // 2. Clear React Query Cache completely (User cache, Checkout state, Coupons, etc.)
    queryClient.clear()

    // 3. Clear auth state and guest cart
    clearPreAuthState()
    localStorage.removeItem("guest-cart-id")
    
    // (Future: Wishlist cache clearing)

    // 4. Force a hard reload if needed or just replace the route
    // router.push("/")
    // Generating a fresh guest session is handled implicitly as soon as they add a new item or via the API middleware
  }

  return { logout }
}
