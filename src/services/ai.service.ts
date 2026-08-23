// ============================================================
// SmartPay Switch — AI Anomaly Detection Service
// Mock implementation. Replace with Python Isolation Forest later.
// ============================================================

import type { AIAlert, AlertSeverity } from '../types';

const MOCK_ALERTS_KEY = 'smartpay_ai_alerts';

function getMockAlerts(): AIAlert[] {
  const stored = localStorage.getItem(MOCK_ALERTS_KEY);
  if (!stored) return getDefaultAlerts();
  try { return JSON.parse(stored); } catch { return getDefaultAlerts(); }
}

function saveMockAlerts(alerts: AIAlert[]): void {
  localStorage.setItem(MOCK_ALERTS_KEY, JSON.stringify(alerts));
}

function getDefaultAlerts(): AIAlert[] {
  return [
    {
      id: 'alert-001',
      device_id: 'dev-002',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      anomaly_score: 0.91,
      severity: 'high',
      message: 'Abnormal power consumption detected. Current: 287W (Normal range: 50-100W)',
      status: 'active',
    },
    {
      id: 'alert-002',
      device_id: 'dev-001',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      anomaly_score: 0.64,
      severity: 'medium',
      message: 'Unusual consumption spike detected. Possible high-wattage appliance.',
      status: 'acknowledged',
    },
  ];
}

/**
 * Detect anomalies from a power reading.
 * Mock implementation using simple threshold rules.
 * Replace with ML model (Isolation Forest) for production.
 */
export function detectAnomaly(
  deviceId: string,
  currentPower: number,
  normalMin: number,
  normalMax: number
): AIAlert | null {
  if (currentPower <= normalMax * 2) return null; // within 2x normal = not anomalous

  const anomalyScore = Math.min(0.99, (currentPower - normalMax) / normalMax);
  let severity: AlertSeverity = 'low';
  if (anomalyScore > 0.8) severity = 'high';
  else if (anomalyScore > 0.5) severity = 'medium';

  const alert: AIAlert = {
    id: 'alert-' + Math.random().toString(36).slice(2, 8),
    device_id: deviceId,
    timestamp: new Date().toISOString(),
    anomaly_score: parseFloat(anomalyScore.toFixed(2)),
    severity,
    message: `Abnormal power consumption detected. Current: ${currentPower.toFixed(0)}W (Normal range: ${normalMin}-${normalMax}W)`,
    status: 'active',
  };

  const alerts = getMockAlerts();
  alerts.unshift(alert);
  saveMockAlerts(alerts);
  return alert;
}

export const aiService = {
  async getAlerts(deviceIds?: string[]): Promise<AIAlert[]> {
    const alerts = getMockAlerts();
    if (!deviceIds || deviceIds.length === 0) return alerts;
    return alerts.filter(a => deviceIds.includes(a.device_id));
  },

  async acknowledgeAlert(alertId: string): Promise<void> {
    const alerts = getMockAlerts();
    const idx = alerts.findIndex(a => a.id === alertId);
    if (idx !== -1) {
      alerts[idx].status = 'acknowledged';
      saveMockAlerts(alerts);
    }
  },

  async resolveAlert(alertId: string): Promise<void> {
    const alerts = getMockAlerts();
    const idx = alerts.findIndex(a => a.id === alertId);
    if (idx !== -1) {
      alerts[idx].status = 'resolved';
      saveMockAlerts(alerts);
    }
  },

  async triggerSimulatedAnomaly(deviceId: string): Promise<AIAlert> {
    const power = 280 + Math.random() * 150;
    const alert = detectAnomaly(deviceId, power, 50, 100)!;
    return alert;
  },
};