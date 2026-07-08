import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface HomeState {
  isCategoriesLoading: boolean;
  setCategoriesLoading: (loading: boolean) => void;
  
  recentlyViewedIds: string[];
  addRecentlyViewed: (id: string) => void;
}

export const useHomeStore = create<HomeState>()(
  persist(
    (set) => ({
      isCategoriesLoading: false,
      setCategoriesLoading: (loading) => set({ isCategoriesLoading: loading }),
      
      recentlyViewedIds: [],
      addRecentlyViewed: (id) => set((state) => {
        // Keep unique and max 10 items, newest first
        const newIds = [id, ...state.recentlyViewedIds.filter(existingId => existingId !== id)].slice(0, 10);
        return { recentlyViewedIds: newIds };
      }),
    }),
    {
      name: 'home-storage',
      // Only persist recently viewed
      partialize: (state) => ({ recentlyViewedIds: state.recentlyViewedIds }),
    }
  )
)
