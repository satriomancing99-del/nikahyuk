import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

// Feature Flag: Default to false, active only if VITE_USE_D1_AUTH is true
const USE_D1_AUTH = import.meta.env.VITE_USE_D1_AUTH === 'true';
const CLOUDFLARE_API_URL = import.meta.env.VITE_CLOUDFLARE_WORKER_API_URL || 'http://localhost:8787';

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
    if (USE_D1_AUTH) {
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
    } else {
      // Supabase Path
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const defaultProfile: Profile = {
            id: session.user.id,
            name: session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            phone: null,
            role: (session.user.email === 'admin@nikahyuk.com' ? 'super_admin' : 'customer') as 'super_admin' | 'customer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          set({ user: session.user, profile: (profile || defaultProfile) as Profile, loading: false, initialized: true });
        } else {
          set({ user: null, profile: null, loading: false, initialized: true });
        }
      } catch (error) {
        console.error('Session error', error);
        set({ user: null, profile: null, loading: false, initialized: true });
      }
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    if (USE_D1_AUTH) {
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
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        set({ loading: false });
        throw error;
      }
      // Trigger profile fetch manually
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        const defaultProfile: Profile = {
          id: session.user.id,
          name: session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          phone: null,
          role: (session.user.email === 'admin@nikahyuk.com' ? 'super_admin' : 'customer') as 'super_admin' | 'customer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set({ user: session.user, profile: (profile || defaultProfile) as Profile, loading: false });
      } else {
        set({ loading: false });
      }
    }
  },

  signUp: async (email, password, name, phone) => {
    set({ loading: true });
    if (USE_D1_AUTH) {
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
    } else {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        set({ loading: false });
        throw signUpError;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: name || email.split('@')[0],
            email,
            phone: phone || null,
            role: 'customer',
          });

        if (profileError) {
          set({ loading: false });
          throw profileError;
        }
      }
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    if (USE_D1_AUTH) {
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
    } else {
      try {
        await supabase.auth.signOut();
        set({ user: null, profile: null, loading: false });
      } catch (error) {
        console.error('Error signing out:', error);
        set({ loading: false });
      }
    }
  },
}));

// Initialize auth state securely on load
useAuthStore.getState().initialize();

// Initialize auth state listener only for Supabase mode
if (!USE_D1_AUTH) {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        const defaultProfile: Profile = {
          id: session.user.id,
          name: session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          phone: null,
          role: (session.user.email === 'admin@nikahyuk.com' ? 'super_admin' : 'customer') as 'super_admin' | 'customer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        useAuthStore.setState({ user: session.user, profile: (profile || defaultProfile) as Profile, loading: false, initialized: true });
      } else {
        useAuthStore.setState({ user: null, profile: null, loading: false, initialized: true });
      }
    }
  });
}

