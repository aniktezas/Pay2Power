import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, type AuthUser } from '../services/auth.service';
import type { UserRole } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, roleHint?: UserRole) => Promise<AuthUser>;
  register: (email: string, password: string, fullName: string, role: UserRole) => Promise<AuthUser>;
  logout: () => Promise<void>;
  role: UserRole | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    authService.getSession().then(u => {
      setUser(u);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  async function login(email: string, password: string, roleHint?: UserRole): Promise<AuthUser> {
    const u = await authService.login(email, password, roleHint);
    setUser(u);
    return u;
  }

  async function register(email: string, password: string, fullName: string, role: UserRole): Promise<AuthUser> {
    const u = await authService.register(email, password, fullName, role);
    setUser(u);
    return u;
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  const role = user?.profile?.role ?? null;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, role }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
