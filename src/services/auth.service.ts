// ============================================================
// SmartPay Switch — Auth Service
// Wraps Supabase Auth. Falls back to mock in demo mode.
// ============================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile, UserRole } from '../types';

const DEMO_USER_KEY = 'smartpay_demo_user';

export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
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
      // Demo mode: create a mock user
      const user: AuthUser = {
        id: 'demo-' + Math.random().toString(36).slice(2),
        email,
        profile: {
          id: 'demo-' + Math.random().toString(36).slice(2),
          full_name: fullName,
          role,
          created_at: new Date().toISOString(),
        },
      };
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

  async login(email: string, password: string): Promise<AuthUser> {
    if (!isSupabaseConfigured) {
      const demo = getDemoUser();
      if (demo && demo.email === email) return demo;
      // Auto-create demo owner for easy demo
      const user: AuthUser = {
        id: 'demo-owner-001',
        email,
        profile: {
          id: 'demo-owner-001',
          full_name: email.split('@')[0],
          role: email.includes('consumer') ? 'consumer' : 'owner',
          created_at: new Date().toISOString(),
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
      // Mock: just pretend it worked
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
  },
};