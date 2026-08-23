// ============================================================
// SmartPay Switch — Session Service
// Manages active usage sessions with hybrid billing.
// ============================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UsageSession, Pricing, TerminationReason } from '../types';
import { calculateSessionLimits } from '../utils/billingEngine';

const MOCK_SESSIONS_KEY = 'smartpay_mock_sessions';
const ACTIVE_SESSION_KEY = 'smartpay_active_session';

function getMockSessions(userId: string): UsageSession[] {
  const stored = localStorage.getItem(MOCK_SESSIONS_KEY + '_' + userId);
  if (!stored) return [];
  try { return JSON.parse(stored); } catch { return []; }
}

function saveMockSessions(userId: string, sessions: UsageSession[]): void {
  localStorage.setItem(MOCK_SESSIONS_KEY + '_' + userId, JSON.stringify(sessions));
}

export const sessionService = {
  async startSession(
    userId: string,
    deviceId: string,
    amountPaid: number,
    pricing: Pricing
  ): Promise<UsageSession> {
    const limits = calculateSessionLimits(amountPaid, {
      pricePerUnit: pricing.price,
      timePerUnit: pricing.time_limit_minutes,
      energyPerUnit: pricing.energy_limit_kwh,
    });

    const session: UsageSession = {
      id: 'sess-' + Math.random().toString(36).slice(2, 10),
      user_id: userId,
      device_id: deviceId,
      started_at: new Date().toISOString(),
      ended_at: undefined,
      amount_paid: amountPaid,
      time_limit_seconds: limits.timeLimitSeconds,
      energy_limit_kwh: limits.energyLimitKwh,
      duration_seconds: 0,
      energy_consumed_kwh: 0,
      status: 'active',
    };

    if (!isSupabaseConfigured) {
      const sessions = getMockSessions(userId);
      sessions.unshift(session);
      saveMockSessions(userId, sessions);
      localStorage.setItem(ACTIVE_SESSION_KEY + '_' + deviceId, JSON.stringify(session));
      return session;
    }

    const { data, error } = await supabase.from('usage_sessions').insert({
      user_id: userId,
      device_id: deviceId,
      amount_paid: amountPaid,
      time_limit_seconds: limits.timeLimitSeconds,
      energy_limit_kwh: limits.energyLimitKwh,
    }).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getActiveSession(deviceId: string): Promise<UsageSession | null> {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(ACTIVE_SESSION_KEY + '_' + deviceId);
      if (!stored) return null;
      try { return JSON.parse(stored); } catch { return null; }
    }
    const { data } = await supabase
      .from('usage_sessions')
      .select('*')
      .eq('device_id', deviceId)
      .eq('status', 'active')
      .single();
    return data;
  },

  async endSession(
    sessionId: string,
    deviceId: string,
    userId: string,
    durationSeconds: number,
    energyConsumedKwh: number,
    reason: TerminationReason
  ): Promise<UsageSession> {
    const updates = {
      ended_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
      energy_consumed_kwh: energyConsumedKwh,
      status: 'completed' as const,
      termination_reason: reason,
    };

    if (!isSupabaseConfigured) {
      const sessions = getMockSessions(userId);
      const idx = sessions.findIndex(s => s.id === sessionId);
      if (idx !== -1) {
        sessions[idx] = { ...sessions[idx], ...updates };
        saveMockSessions(userId, sessions);
      }
      localStorage.removeItem(ACTIVE_SESSION_KEY + '_' + deviceId);
      return { ...sessions[idx], ...updates };
    }

    const { data, error } = await supabase
      .from('usage_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select().single();
    if (error) throw new Error(error.message);
    localStorage.removeItem(ACTIVE_SESSION_KEY + '_' + deviceId);
    return data;
  },

  async getSessionHistory(userId: string): Promise<UsageSession[]> {
    if (!isSupabaseConfigured) return getMockSessions(userId).filter(s => s.status !== 'active');
    const { data, error } = await supabase
      .from('usage_sessions')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'active')
      .order('started_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
};