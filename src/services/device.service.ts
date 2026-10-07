// ============================================================
// SmartPay Switch — Device Service
// ============================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Device, DeviceWithReadings, Pricing } from '../types';
import { getSimulator } from './simulator.service';

// ---- Mock data for demo mode ----

const MOCK_DEVICES_KEY = 'smartpay_mock_devices';

function getMockDevices(): Device[] {
  const stored = localStorage.getItem(MOCK_DEVICES_KEY);
  if (!stored) return getDefaultDevices();
  try { return JSON.parse(stored); } catch { return getDefaultDevices(); }
}

function saveMockDevices(devices: Device[]): void {
  localStorage.setItem(MOCK_DEVICES_KEY, JSON.stringify(devices));
}

function getDefaultDevices(): Device[] {
  return [
    {
      id: 'dev-001',
      device_code: 'SP-SW-00001',
      name: 'Room 101 Socket',
      owner_id: 'demo-owner-001',
      status: 'online',
      location: 'Hostel Block A',
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      last_seen_at: new Date().toISOString(),
    },
    {
      id: 'dev-002',
      device_code: 'SP-SW-00002',
      name: 'Common Room TV',
      owner_id: 'demo-owner-001',
      status: 'active',
      location: 'Common Room',
      created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
      last_seen_at: new Date().toISOString(),
    },
    {
      id: 'dev-003',
      device_code: 'SP-SW-00003',
      name: 'Laundry Machine',
      owner_id: 'demo-owner-001',
      status: 'offline',
      location: 'Laundry Room',
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      last_seen_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

const MOCK_PRICING_KEY = 'smartpay_mock_pricing';

function getMockPricing(): Record<string, Pricing> {
  const stored = localStorage.getItem(MOCK_PRICING_KEY);
  if (!stored) return getDefaultPricing();
  try { return JSON.parse(stored); } catch { return getDefaultPricing(); }
}

function getDefaultPricing(): Record<string, Pricing> {
  return {
    'dev-001': { id: 'pr-001', device_id: 'dev-001', price: 10, time_limit_minutes: 120, energy_limit_kwh: 1, active: true, created_at: new Date().toISOString() },
    'dev-002': { id: 'pr-002', device_id: 'dev-002', price: 10, time_limit_minutes: 60, energy_limit_kwh: 0.5, active: true, created_at: new Date().toISOString() },
    'dev-003': { id: 'pr-003', device_id: 'dev-003', price: 20, time_limit_minutes: 45, energy_limit_kwh: 2, active: true, created_at: new Date().toISOString() },
  };
}

// ---- Service ----

export const deviceService = {
  async getAllDevices(): Promise<Device[]> {
    if (!isSupabaseConfigured) {
      return getMockDevices();
    }
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getDevices(ownerId: string): Promise<Device[]> {
    if (!isSupabaseConfigured) {
      return getMockDevices().filter(d => d.owner_id === ownerId || ownerId.startsWith('demo'));
    }
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getDevice(deviceId: string): Promise<Device | null> {
    if (!isSupabaseConfigured) {
      return getMockDevices().find(d => d.id === deviceId) ?? null;
    }
    const { data } = await supabase.from('devices').select('*').eq('id', deviceId).single();
    return data;
  },

  async getDeviceByCode(deviceCode: string): Promise<Device | null> {
    if (!isSupabaseConfigured) {
      return getMockDevices().find(d => d.device_code === deviceCode) ?? null;
    }
    const { data } = await supabase.from('devices').select('*').eq('device_code', deviceCode).single();
    return data;
  },

  async addDevice(ownerId: string, deviceCode: string, name: string, location?: string): Promise<Device> {
    if (!isSupabaseConfigured) {
      const devices = getMockDevices();
      const existing = devices.find(d => d.device_code === deviceCode);
      if (existing) throw new Error('Device code already registered');
      const newDevice: Device = {
        id: 'dev-' + Math.random().toString(36).slice(2, 8),
        device_code: deviceCode,
        name,
        owner_id: ownerId,
        status: 'offline',
        location,
        created_at: new Date().toISOString(),
        last_seen_at: undefined,
      };
      devices.push(newDevice);
      saveMockDevices(devices);
      return newDevice;
    }
    const { data, error } = await supabase.from('devices').insert({
      device_code: deviceCode, name, owner_id: ownerId, location,
    }).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateDevice(deviceId: string, updates: Partial<Device>): Promise<Device> {
    if (!isSupabaseConfigured) {
      const devices = getMockDevices();
      const idx = devices.findIndex(d => d.id === deviceId);
      if (idx === -1) throw new Error('Device not found');
      devices[idx] = { ...devices[idx], ...updates };
      saveMockDevices(devices);
      return devices[idx];
    }
    const { data, error } = await supabase.from('devices').update(updates).eq('id', deviceId).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getPricing(deviceId: string): Promise<Pricing | null> {
    if (!isSupabaseConfigured) {
      const pricing = getMockPricing();
      return pricing[deviceId] ?? null;
    }
    const { data } = await supabase
      .from('pricing')
      .select('*')
      .eq('device_id', deviceId)
      .eq('active', true)
      .single();
    return data;
  },

  async setPricing(deviceId: string, price: number, timeLimitMinutes: number, energyLimitKwh: number): Promise<Pricing> {
    if (!isSupabaseConfigured) {
      const pricing = getMockPricing();
      const newPricing: Pricing = {
        id: 'pr-' + Math.random().toString(36).slice(2, 8),
        device_id: deviceId,
        price,
        time_limit_minutes: timeLimitMinutes,
        energy_limit_kwh: energyLimitKwh,
        active: true,
        created_at: new Date().toISOString(),
      };
      pricing[deviceId] = newPricing;
      localStorage.setItem(MOCK_PRICING_KEY, JSON.stringify(pricing));
      return newPricing;
    }
    // Deactivate existing
    await supabase.from('pricing').update({ active: false }).eq('device_id', deviceId);
    const { data, error } = await supabase.from('pricing').insert({
      device_id: deviceId, price, time_limit_minutes: timeLimitMinutes, energy_limit_kwh: energyLimitKwh, active: true,
    }).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getDeviceWithReadings(deviceId: string): Promise<DeviceWithReadings | null> {
    const device = await this.getDevice(deviceId);
    if (!device) return null;
    const pricing = await this.getPricing(deviceId);
    const sim = getSimulator(deviceId, device.device_code);
    const state = sim.getState();
    const reading = state.isPowerOn ? {
      id: 'live',
      device_id: deviceId,
      timestamp: new Date().toISOString(),
      voltage: parseFloat(state.voltage.toFixed(1)),
      current: parseFloat(state.current.toFixed(3)),
      power: parseFloat(state.power.toFixed(1)),
      energy_kwh: parseFloat(state.energyKwh.toFixed(5)),
    } : undefined;
    return { ...device, latest_reading: reading, pricing: pricing ?? undefined };
  },
};