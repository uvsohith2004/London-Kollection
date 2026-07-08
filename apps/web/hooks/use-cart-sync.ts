import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cart-store";
import { useSyncCartMutation } from "@/app/[locale]/cart/mutations";
import { authClient } from "@/lib/auth-client";

export function useCartSync() {
  const items = useCartStore((state) => state.items);
  const { mutate: syncCart } = useSyncCartMutation();
  const { data: session } = authClient.useSession();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip the very first mount so we don't unnecessarily sync an empty cart on page load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Do not sync if the user is not authenticated
    if (!session) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Format items for the backend
      const syncItems = items.map((item) => {
        return {
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
        };
      });

      syncCart(syncItems);
    }, 1000); // 1-second debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [items, syncCart]);
}
