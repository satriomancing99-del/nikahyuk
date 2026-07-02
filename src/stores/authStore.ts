import { create } from 'zustand';

const CLOUDFLARE_API_URL = import.meta.env.VITE_CLOUDFLARE_WORKER_API_URL || 'http://localhost:8787';

export interface User {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'super_admin' | 'customer';
  active_package_id?: string | null;
  package_expired_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    if (import.meta.env.DEV) {
      console.log('[Auth Store] Initializing with Cloudflare D1 Auth');
    }
    try {
      const response = await fetch(`${CLOUDFLARE_API_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          const mockUser = {
            id: data.user.id,
            email: data.user.email,
          } as User;
          set({ user: mockUser, profile: data.user, loading: false, initialized: true });
          return;
        }
      }
      set({ user: null, profile: null, loading: false, initialized: true });
    } catch (error) {
      console.error('[Auth Store] D1 Auth Initialization error:', error);
      set({ user: null, profile: null, loading: false, initialized: true });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const response = await fetch(`${CLOUDFLARE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Login gagal.');
      }

      const data = await response.json();
      const mockUser = {
        id: data.user.id,
        email: data.user.email,
      } as User;

      set({ user: mockUser, profile: data.user, loading: false });
    } catch (error: any) {
      set({ loading: false });
      throw error;
    }
  },

  signUp: async (email, password, name, phone) => {
    set({ loading: true });
    try {
      const response = await fetch(`${CLOUDFLARE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Registrasi gagal.');
      }

      set({ loading: false });
    } catch (error: any) {
      set({ loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await fetch(`${CLOUDFLARE_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      set({ user: null, profile: null, loading: false });
    } catch (error) {
      console.error('[Auth Store] Logout error:', error);
      set({ user: null, profile: null, loading: false });
    }
  },
}));

// Initialize auth state securely on load
useAuthStore.getState().initialize();
