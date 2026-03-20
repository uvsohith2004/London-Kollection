import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';

console.log('[AUTH_STORE] Auth store loaded');

/**
 * Auth Store
 * Manages authentication state
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Set user and token
      setAuth: (user, accessToken) => {
        console.log('[AUTH_STORE] setAuth called with user:', user?.email);
        api.setAccessToken(accessToken);
        set({
          user,
          accessToken,
          isAuthenticated: true,
        });
      },

      // Clear auth
      clearAuth: () => {
        console.log('[AUTH_STORE] clearAuth called');
        api.clearAccessToken();
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },

      // Register
      register: async (userData) => {
        console.log('[AUTH_STORE] register called with email:', userData.email);
        set({ isLoading: true });
        try {
          console.log('[AUTH_STORE] Calling api.register()');
          const response = await api.register(userData);
          console.log('[AUTH_STORE] api.register() returned successfully');
          console.log('[AUTH_STORE] Setting auth with email:', response.data.user.email);
          get().setAuth(response.data.user, response.data.accessToken);
          set({ isLoading: false });
          console.log('[AUTH_STORE] register completed successfully');
          return { success: true, data: response.data };
        } catch (error) {
          console.error('[AUTH_STORE] register failed:', error.message);
          set({ isLoading: false });
          return { success: false, error: error.message, code: error.code };
        }
      },

      // Login
      login: async (credentials) => {
        console.log('[AUTH_STORE] login called with email:', credentials.email);
        set({ isLoading: true });
        try {
          console.log('[AUTH_STORE] Calling api.login()');
          const response = await api.login(credentials);
          console.log('[AUTH_STORE] api.login() returned successfully');
          console.log('[AUTH_STORE] Setting auth with email:', response.data.user.email);
          get().setAuth(response.data.user, response.data.accessToken);
          set({ isLoading: false });
          console.log('[AUTH_STORE] login completed successfully');
          return { success: true, data: response.data };
        } catch (error) {
          console.error('[AUTH_STORE] login failed:', error.message);
          set({ isLoading: false });
          return { success: false, error: error.message, code: error.code };
        }
      },

      // Logout
      logout: async () => {
        console.log('[AUTH_STORE] logout called');
        set({ isLoading: true });
        try {
          await api.logout();
        } catch (error) {
          console.error('[AUTH_STORE] Logout error:', error);
        } finally {
          get().clearAuth();
          set({ isLoading: false });
          console.log('[AUTH_STORE] logout completed');
        }
      },

      // Refresh token
      refreshToken: async (refreshToken) => {
        console.log('[AUTH_STORE] refreshToken called');
        try {
          const response = await api.refreshToken(refreshToken);
          get().setAuth(get().user, response.data.accessToken);
          console.log('[AUTH_STORE] refreshToken completed successfully');
          return { success: true };
        } catch (error) {
          console.error('[AUTH_STORE] refreshToken failed:', error.message);
          get().clearAuth();
          return { success: false, error: error.message };
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize API token when store is rehydrated
        console.log('[AUTH_STORE] onRehydrateStorage called');
        if (state?.accessToken) {
          console.log('[AUTH_STORE] Found persisted token, setting it');
          api.setAccessToken(state.accessToken);
        }
      },
    }
  )
);

export default useAuthStore;
