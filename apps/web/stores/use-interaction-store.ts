import { create } from 'zustand'

interface InteractionState {
  productViews: string[]
  searchTerms: string[]
  trackProductView: (productId: string) => void
  trackSearch: (term: string) => void
  flush: () => { productViews: string[]; searchTerms: string[] }
}

export const useInteractionStore = create<InteractionState>((set, get) => ({
  productViews: [],
  searchTerms: [],

  trackProductView: (productId: string) => {
    set((state) => ({
      productViews: [...state.productViews, productId]
    }))
  },

  trackSearch: (term: string) => {
    set((state) => ({
      searchTerms: [...state.searchTerms, term]
    }))
  },

  flush: () => {
    const { productViews, searchTerms } = get()
    set({ productViews: [], searchTerms: [] })
    return { productViews, searchTerms }
  }
}))
