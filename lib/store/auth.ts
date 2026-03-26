/**
 * Auth Store — Client-side PIN authentication state
 */

import { create } from 'zustand';

export interface AuthState {
  /** Whether auth check has completed */
  initialized: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether PIN auth is enabled on the server */
  pinEnabled: boolean;
  /** Authenticated user info */
  user: { index: number; name: string } | null;

  /** Check session status on mount */
  checkSession: () => Promise<void>;
  /** Login with PIN */
  login: (pin: string) => Promise<{ success: boolean; error?: string }>;
  /** Logout */
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  initialized: false,
  isAuthenticated: false,
  pinEnabled: false,
  user: null,

  checkSession: async () => {
    try {
      const res = await fetch('/api/auth/pin', { credentials: 'include' });
      const data = await res.json();
      set({
        initialized: true,
        isAuthenticated: data.authenticated === true,
        pinEnabled: data.pinEnabled === true,
        user: data.user || null,
      });
    } catch {
      set({ initialized: true, isAuthenticated: false, pinEnabled: false, user: null });
    }
  },

  login: async (pin: string) => {
    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.user) {
        set({
          isAuthenticated: true,
          pinEnabled: true,
          user: data.user,
        });
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid PIN' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/pin', {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    set({ isAuthenticated: false, user: null });
  },
}));
