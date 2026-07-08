import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistStoreItem {
  id: string; // productId or productId-variantId
  productId: string;
  variantId?: string | null;
  productName: string;
  productSlug: string;
  image: string;
  optionValues?: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  discountValue: number;
  stockStatus: "in_stock" | "out_of_stock" | "coming_soon" | "pre_order";
  createdAt: string;
}

interface WishlistState {
  items: WishlistStoreItem[];
  addToWishlist: (item: WishlistStoreItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addToWishlist: (newItem) => {
        set((state) => {
          if (state.items.find((item) => item.id === newItem.id)) {
            return state; // Already exists
          }
          return { items: [...state.items, newItem] };
        });
      },
      removeFromWishlist: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      isInWishlist: (id) => {
        return get().items.some((item) => item.id === id);
      },
      clearWishlist: () => {
        set({ items: [] });
      }
    }),
    {
      name: 'lk-wishlist-storage',
    }
  )
);
