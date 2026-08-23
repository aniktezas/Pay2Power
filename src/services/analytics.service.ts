// ============================================================
// SmartPay Switch — Analytics Service
// ============================================================

import type { DailyAnalytics, DeviceAnalytics, OwnerDashboardStats } from '../types';

// Generate realistic demo analytics data
function generateDailyData(days: number): DailyAnalytics[] {
  const result: DailyAnalytics[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const sessions = Math.floor(8 + Math.random() * 20);
    const energy = parseFloat((sessions * (0.3 + Math.random() * 0.8)).toFixed(2));
    const revenue = parseFloat((sessions * (10 + Math.random() * 15)).toFixed(0));
    result.push({
      date: date.toISOString().slice(0, 10),
      energy_kwh: energy,
      revenue,
      sessions,
    });
  }
  return result;
}

export const analyticsService = {
  async getDailyAnalytics(days = 30): Promise<DailyAnalytics[]> {
    return generateDailyData(days);
  },

  async getOwnerStats(): Promise<OwnerDashboardStats> {
    return {
      total_devices: 3,
      online_devices: 2,
      active_sessions: 1,
      energy_today_kwh: 12.42,
      revenue_today: 380,
    };
  },

  async getDeviceAnalytics(): Promise<DeviceAnalytics[]> {
    return [
      { device_id: 'dev-001', device_name: 'Room 101 Socket', total_energy: 45.2, total_revenue: 1200, total_sessions: 48, avg_session_duration_min: 87, peak_power: 350 },
      { device_id: 'dev-002', device_name: 'Common Room TV', total_energy: 28.1, total_revenue: 780, total_sessions: 31, avg_session_duration_min: 62, peak_power: 180 },
      { device_id: 'dev-003', device_name: 'Laundry Machine', total_energy: 18.7, total_revenue: 520, total_sessions: 22, avg_session_duration_min: 45, peak_power: 1850 },
    ];
  },
};