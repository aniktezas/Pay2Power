// ============================================================
// SmartPay Switch — TypeScript Types
// ============================================================

export type UserRole = 'owner' | 'consumer';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export type DeviceStatus = 'online' | 'offline' | 'active' | 'disabled' | 'fault' | 'power_on' | 'power_off';

export interface Device {
  id: string;
  device_code: string;
  name: string;
  owner_id: string;
  status: DeviceStatus;
  location?: string;
  created_at: string;
  last_seen_at?: string;
}

export interface DeviceWithReadings extends Device {
  latest_reading?: EnergyReading;
  active_session?: UsageSession;
  pricing?: Pricing;
}

export interface Pricing {
  id: string;
  device_id: string;
  price: number;
  time_limit_minutes: number;
  energy_limit_kwh: number;
  active: boolean;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  updated_at: string;
}

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface Transaction {
  id: string;
  user_id: string;
  device_id: string;
  device?: Device;
  amount: number;
  status: TransactionStatus;
  payment_reference: string;
  created_at: string;
}

export type SessionStatus = 'active' | 'completed' | 'terminated';
export type TerminationReason =
  | 'TIME_LIMIT_REACHED'
  | 'ENERGY_LIMIT_REACHED'
  | 'MANUAL_STOP'
  | 'DEVICE_DISABLED'
  | 'DEVICE_FAULT'
  | 'SERVER_ERROR';

export interface UsageSession {
  id: string;
  user_id: string;
  device_id: string;
  started_at: string;
  ended_at?: string;
  amount_paid: number;
  time_limit_seconds: number;
  energy_limit_kwh: number;
  duration_seconds: number;
  energy_consumed_kwh: number;
  status: SessionStatus;
  termination_reason?: TerminationReason;
}

export interface EnergyReading {
  id: string;
  device_id: string;
  timestamp: string;
  voltage: number;
  current: number;
  power: number;
  energy_kwh: number;
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface AIAlert {
  id: string;
  device_id: string;
  device?: Device;
  timestamp: string;
  anomaly_score: number;
  severity: AlertSeverity;
  message: string;
  status: AlertStatus;
}

// ---- Simulator types ----

export interface SimulatorState {
  deviceId: string;
  deviceCode: string;
  isOnline: boolean;
  isPowerOn: boolean;
  voltage: number;
  current: number;
  power: number;
  energyKwh: number;
  sessionStartedAt?: Date;
  anomalyMode: boolean;
  targetPower: number;
}

// ---- Billing types ----

export interface BillingConfig {
  pricePerUnit: number;     // e.g. 10 (₹10)
  timePerUnit: number;      // minutes per unit
  energyPerUnit: number;    // kWh per unit
}

export interface SessionLimits {
  timeLimitSeconds: number;
  energyLimitKwh: number;
  amountPaid: number;
}

export interface SessionProgress {
  elapsedSeconds: number;
  energyConsumedKwh: number;
  timeRemainingSeconds: number;
  energyRemainingKwh: number;
  timeProgressPercent: number;
  energyProgressPercent: number;
  isExpired: boolean;
  terminationReason?: TerminationReason;
}

// ---- Analytics types ----

export interface DailyAnalytics {
  date: string;
  energy_kwh: number;
  revenue: number;
  sessions: number;
}

export interface DeviceAnalytics {
  device_id: string;
  device_name: string;
  total_energy: number;
  total_revenue: number;
  total_sessions: number;
  avg_session_duration_min: number;
  peak_power: number;
}

export interface OwnerDashboardStats {
  total_devices: number;
  online_devices: number;
  active_sessions: number;
  energy_today_kwh: number;
  revenue_today: number;
}
