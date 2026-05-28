import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

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
  setAuth: (user: User | null) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await get().setAuth(session?.user || null);
    } catch (error) {
      console.error('Session error', error);
      set({ user: null, profile: null, loading: false, initialized: true });
    }
  },

  setAuth: async (user) => {
    if (!user) {
      set({ user: null, profile: null, loading: false, initialized: true });
      return;
    }

    set({ loading: true });
    try {
      // Fetch profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Warning fetching profile (Table might not exist yet):', error.message);
      }

      // Provide a fallback if profile is not found or DB errors (so users can still test UI)
      const defaultProfile: Profile = {
        id: user.id,
        name: user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone: null,
        role: (user.email === 'admin@nikahyuk.com' ? 'super_admin' : 'customer') as 'super_admin' | 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      set({ user, profile: (profile || defaultProfile) as Profile, loading: false, initialized: true });
    } catch (error) {
      console.error('Error setting auth:', error);
      // Don't log out user if database querying fails. Just provide fallback.
      const fallbackProfile: Profile = {
        id: user.id,
        name: 'Guest (DB Error)',
        email: user.email || '',
        phone: null,
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set({ user, profile: fallbackProfile, loading: false, initialized: true });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, profile: null, loading: false });
    } catch (error) {
      console.error('Error signing out:', error);
      set({ loading: false });
    }
  },
}));

// Initialize auth state securely on load
useAuthStore.getState().initialize();

// Initialize auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
    useAuthStore.getState().setAuth(session?.user || null);
  }
});
