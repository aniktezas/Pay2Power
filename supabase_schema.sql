-- ============================================================
-- SmartPay Switch — Supabase Database Schema
-- Run this SQL in your Supabase SQL editor:
-- https://app.supabase.com → SQL Editor → New Query
-- ============================================================

-- Enable Row Level Security on all tables (run AFTER creating tables)

-- ============================================================
-- 1. PROFILES
-- Linked to Supabase auth.users
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'consumer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger: auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'consumer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ============================================================
-- 2. DEVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'active', 'disabled', 'fault', 'power_on', 'power_off')),
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ
);

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their devices" ON devices
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can view device by code" ON devices
  FOR SELECT USING (true);

-- ============================================================
-- 3. PRICING
-- ============================================================
CREATE TABLE IF NOT EXISTS pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL CHECK (price > 0),
  time_limit_minutes INTEGER NOT NULL CHECK (time_limit_minutes > 0),
  energy_limit_kwh NUMERIC NOT NULL CHECK (energy_limit_kwh > 0),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Device owners can manage pricing" ON pricing
  FOR ALL USING (
    auth.uid() = (SELECT owner_id FROM devices WHERE id = pricing.device_id)
  );

CREATE POLICY "Anyone can view active pricing" ON pricing
  FOR SELECT USING (active = TRUE);

-- ============================================================
-- 4. WALLETS
-- ============================================================
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance NUMERIC DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 5. TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  payment_reference TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 6. USAGE SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS usage_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  amount_paid NUMERIC NOT NULL CHECK (amount_paid > 0),
  time_limit_seconds INTEGER NOT NULL CHECK (time_limit_seconds > 0),
  energy_limit_kwh NUMERIC NOT NULL CHECK (energy_limit_kwh > 0),
  duration_seconds INTEGER DEFAULT 0,
  energy_consumed_kwh NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated')),
  termination_reason TEXT CHECK (termination_reason IN (
    'TIME_LIMIT_REACHED', 'ENERGY_LIMIT_REACHED', 'MANUAL_STOP',
    'DEVICE_DISABLED', 'DEVICE_FAULT', 'SERVER_ERROR'
  ))
);

ALTER TABLE usage_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON usage_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON usage_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON usage_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Device owners can view device sessions" ON usage_sessions
  FOR SELECT USING (
    auth.uid() = (SELECT owner_id FROM devices WHERE id = usage_sessions.device_id)
  );

-- ============================================================
-- 7. ENERGY READINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS energy_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  voltage NUMERIC,
  current NUMERIC,
  power NUMERIC,
  energy_kwh NUMERIC
);

ALTER TABLE energy_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Device owners can view readings" ON energy_readings
  FOR SELECT USING (
    auth.uid() = (SELECT owner_id FROM devices WHERE id = energy_readings.device_id)
  );

CREATE POLICY "Device owners can insert readings" ON energy_readings
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT owner_id FROM devices WHERE id = energy_readings.device_id)
  );

-- Create index for efficient time-series queries
CREATE INDEX IF NOT EXISTS energy_readings_device_time_idx
  ON energy_readings (device_id, timestamp DESC);

-- ============================================================
-- 8. AI ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  anomaly_score NUMERIC CHECK (anomaly_score BETWEEN 0 AND 1),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved'))
);

ALTER TABLE ai_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Device owners can manage alerts" ON ai_alerts
  FOR ALL USING (
    auth.uid() = (SELECT owner_id FROM devices WHERE id = ai_alerts.device_id)
  );

-- ============================================================
-- REALTIME SUBSCRIPTIONS (enable for live updates)
-- Run in Supabase dashboard: Database → Replication → Tables
-- Enable for: devices, energy_readings, usage_sessions, ai_alerts
-- ============================================================
-- ALTER PUBLICATION supabase_realtime ADD TABLE devices;
-- ALTER PUBLICATION supabase_realtime ADD TABLE energy_readings;
-- ALTER PUBLICATION supabase_realtime ADD TABLE usage_sessions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE ai_alerts;
