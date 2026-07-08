import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreAuthUIState {
  variantId?: string;
  size?: string;
  color?: string;
  quantity?: number;
  scrollPosition?: number;
  [key: string]: any;
}

interface AuthState {
  redirectUrl: string | null;
  pendingAction: string | null;
  uiState: PreAuthUIState | null;
  setRedirectUrl: (url: string | null) => void;
  setPendingAction: (action: string | null) => void;
  setUiState: (state: PreAuthUIState | null) => void;
  clearPreAuthState: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      redirectUrl: null,
      pendingAction: null,
      uiState: null,
      setRedirectUrl: (url) => set({ redirectUrl: url }),
      setPendingAction: (action) => set({ pendingAction: action }),
      setUiState: (state) => set({ uiState: state }),
      clearPreAuthState: () => set({ redirectUrl: null, pendingAction: null, uiState: null }),
    }),
    {
      name: 'auth-redirect-storage', // unique name
    }
  )
)
