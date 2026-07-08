import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartStoreItem {
  id: string; // Unique cart item ID (productId-variantId or productId)
  productId: string;
  variantId?: string | null;
  productName: string;
  productSlug: string;
  sku: string;
  image?: string;
  optionValues: Record<string, string>;
  quantity: number;
  unitPrice: number;
  compareAtPrice?: number;
  discountValue: number;
  subtotal: number;
}

interface CartState {
  items: CartStoreItem[];
  addItem: (item: Omit<CartStoreItem, 'subtotal'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

function computeSubtotal(item: { unitPrice: number; discountValue: number; quantity: number }) {
  return (item.unitPrice - item.discountValue) * item.quantity
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex((item) => item.id === newItem.id);
          
          if (existingItemIndex >= 0) {
            const updatedItems = [...state.items];
            const itemToUpdate = updatedItems[existingItemIndex];
            if (itemToUpdate) {
              const newQty = Math.max(itemToUpdate.quantity, newItem.quantity || 1);
              updatedItems[existingItemIndex] = {
                ...itemToUpdate,
                quantity: newQty,
                subtotal: computeSubtotal({ ...itemToUpdate, quantity: newQty }),
              };
            }
            return { items: updatedItems };
          }
          
          const qty = newItem.quantity || 1
          return {
            items: [
              ...state.items,
              {
                ...newItem,
                quantity: qty,
                subtotal: computeSubtotal({ unitPrice: newItem.unitPrice, discountValue: newItem.discountValue, quantity: qty }),
              },
            ],
          };
        });
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: Math.max(1, quantity),
                  subtotal: computeSubtotal({ ...item, quantity: Math.max(1, quantity) }),
                }
              : item
          ),
        }));
      },
      clearCart: () => {
        set({ items: [] });
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.subtotal, 0);
      },
    }),
    {
      name: 'lk-cart-storage',
    }
  )
);
