import { create } from "zustand";

interface SearchState {
  isMobileFiltersOpen: boolean;
  setMobileFiltersOpen: (isOpen: boolean) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isMobileFiltersOpen: false,
  setMobileFiltersOpen: (isOpen) => set({ isMobileFiltersOpen: isOpen }),
}));
