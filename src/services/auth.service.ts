// ============================================================
// SmartPay Switch — Auth Service
// Wraps Supabase Auth. Falls back to mock in demo mode.
// ============================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile, UserRole } from '../types';

const DEMO_USER_KEY = 'smartpay_demo_user';
const REGISTERED_USERS_KEY = 'smartpay_registered_users';

export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
}

interface StoredUser extends AuthUser {
  password?: string;
}

function getStoredUsers(): StoredUser[] {
  const stored = localStorage.getItem(REGISTERED_USERS_KEY);
  if (!stored) return [];
  try { return JSON.parse(stored); } catch { return []; }
}

function saveStoredUsers(users: StoredUser[]): void {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

function getDemoUser(): AuthUser | null {
  const stored = localStorage.getItem(DEMO_USER_KEY);
  if (!stored) return null;
  try { return JSON.parse(stored); } catch { return null; }
}

export const authService = {
  async getSession(): Promise<AuthUser | null> {
    if (!isSupabaseConfigured) return getDemoUser();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return {
      id: session.user.id,
      email: session.user.email ?? '',
      profile: profile ?? undefined,
    };
  },

  async register(
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ): Promise<AuthUser> {
    if (!isSupabaseConfigured) {
      // Demo mode: create a mock user and persist to registered users list
      const userId = 'demo-' + Math.random().toString(36).slice(2, 9);
      const user: StoredUser = {
        id: userId,
        email,
        password,
        profile: {
          id: userId,
          full_name: fullName,
          role,
          created_at: new Date().toISOString(),
        },
      };

      const users = getStoredUsers();
      const existingIdx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingIdx !== -1) {
        users[existingIdx] = user;
      } else {
        users.push(user);
      }
      saveStoredUsers(users);

      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
      return user;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Registration failed');

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: fullName,
      role,
    });
    if (profileError) throw new Error(profileError.message);

    return {
      id: data.user.id,
      email: data.user.email ?? '',
      profile: { id: data.user.id, full_name: fullName, role, created_at: new Date().toISOString() },
    };
  },

  async login(email: string, password: string, roleHint?: UserRole): Promise<AuthUser> {
    if (!isSupabaseConfigured) {
      const users = getStoredUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      let role: UserRole = roleHint || (existing?.profile?.role) || (email.toLowerCase().includes('consumer') ? 'consumer' : 'owner');
      let fullName = existing?.profile?.full_name || email.split('@')[0];
      let userId = existing?.id || (role === 'owner' ? 'demo-owner-001' : 'demo-consumer-001');

      const user: AuthUser = {
        id: userId,
        email,
        profile: {
          id: userId,
          full_name: fullName,
          role,
          created_at: existing?.profile?.created_at || new Date().toISOString(),
        },
      };

      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
      return user;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Login failed');

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      id: data.user.id,
      email: data.user.email ?? '',
      profile: profile ?? undefined,
    };
  },

  async logout(): Promise<void> {
    localStorage.removeItem(DEMO_USER_KEY);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },

  async forgotPassword(email: string): Promise<void> {
    if (!isSupabaseConfigured) {
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
  },
};