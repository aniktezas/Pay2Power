// ============================================================
// SmartPay Switch — Device Simulator Service
//
// Simulates a real ESP32 SmartPay device.
// This is the ONLY file that needs to change when real hardware arrives.
// All other services call this abstraction.
//
// Architecture:
//   SIMULATED DEVICE (this file)
//       (future: replace with)
//   REAL ESP32 via MQTT FastAPI Supabase
// ============================================================

import type { EnergyReading, SimulatorState } from '../types';

type ReadingCallback = (reading: EnergyReading) => void;
type StateChangeCallback = (state: SimulatorState) => void;

class DeviceSimulator {
  private state: SimulatorState;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readingCallbacks: Set<ReadingCallback> = new Set();
  private stateCallbacks: Set<StateChangeCallback> = new Set();
  private readingHistory: EnergyReading[] = [];
  private sessionEnergyStart = 0;

  constructor(deviceId: string, deviceCode: string) {
    this.state = {
      deviceId,
      deviceCode,
      isOnline: true,
      isPowerOn: false,
      voltage: 230.0,
      current: 0,
      power: 0,
      energyKwh: 0,
      anomalyMode: false,
      targetPower: 75,
    };
  }

  // ----------- Public controls -----------

  turnOn(): void {
    if (!this.state.isOnline) return;
    this.state.isPowerOn = true;
    this.state.sessionStartedAt = new Date();
    this.sessionEnergyStart = this.state.energyKwh;
    this.notifyState();
  }

  turnOff(): void {
    this.state.isPowerOn = false;
    this.state.current = 0;
    this.state.power = 0;
    this.notifyState();
  }

  setTargetPower(watts: number): void {
    this.state.targetPower = Math.max(0, Math.min(3500, watts));
  }

  setOnline(online: boolean): void {
    this.state.isOnline = online;
    if (!online) this.state.isPowerOn = false;
    this.notifyState();
  }

  setAnomalyMode(enabled: boolean): void {
    this.state.anomalyMode = enabled;
    if (enabled) {
      this.state.targetPower = 350 + Math.random() * 200;
    } else {
      this.state.targetPower = 75;
    }
  }

  fastForwardEnergy(kwh: number): void {
    this.state.energyKwh += kwh;
    this.notifyState();
  }

  fastForwardTime(seconds: number): void {
    if (this.state.sessionStartedAt) {
      this.state.sessionStartedAt = new Date(
        this.state.sessionStartedAt.getTime() - seconds * 1000
      );
    }
  }

  getSessionEnergyConsumed(): number {
    return Math.max(0, this.state.energyKwh - this.sessionEnergyStart);
  }

  resetSessionEnergy(): void {
    this.sessionEnergyStart = this.state.energyKwh;
  }

  getState(): SimulatorState {
    return { ...this.state };
  }

  getHistory(limit = 60): EnergyReading[] {
    return this.readingHistory.slice(-limit);
  }

  // ----------- Event subscriptions -----------

  onReading(cb: ReadingCallback): () => void {
    this.readingCallbacks.add(cb);
    return () => this.readingCallbacks.delete(cb);
  }

  onStateChange(cb: StateChangeCallback): () => void {
    this.stateCallbacks.add(cb);
    return () => this.stateCallbacks.delete(cb);
  }

  // ----------- Simulation loop -----------

  start(intervalMs = 2000): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.tick(), intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick(): void {
    if (!this.state.isOnline) return;

    if (this.state.isPowerOn) {
      // Simulate realistic voltage variation
      this.state.voltage = 229 + Math.random() * 3; // 229-232 V

      // Gradually approach target power with small noise
      const noise = (Math.random() - 0.5) * 10;
      const currentPower = this.state.power;
      const target = this.state.anomalyMode
        ? this.state.targetPower + (Math.random() - 0.5) * 50
        : this.state.targetPower + noise;

      // Slowly ramp to target
      this.state.power = currentPower + (target - currentPower) * 0.3;
      this.state.power = Math.max(0, this.state.power);
      this.state.current = this.state.power / this.state.voltage;

      // Accumulate energy: E = P * t (kWh)
      // interval is 2 seconds = 2/3600 hours
      const deltaHours = 2 / 3600;
      this.state.energyKwh += (this.state.power / 1000) * deltaHours;
    } else {
      this.state.voltage = 229 + Math.random() * 3;
      this.state.current = 0;
      this.state.power = 0;
    }

    const reading: EnergyReading = {
      id: Math.random().toString(36).slice(2),
      device_id: this.state.deviceId,
      timestamp: new Date().toISOString(),
      voltage: parseFloat(this.state.voltage.toFixed(1)),
      current: parseFloat(this.state.current.toFixed(3)),
      power: parseFloat(this.state.power.toFixed(1)),
      energy_kwh: parseFloat(this.state.energyKwh.toFixed(5)),
    };

    this.readingHistory.push(reading);
    if (this.readingHistory.length > 500) this.readingHistory.shift();

    this.readingCallbacks.forEach(cb => cb(reading));
    this.notifyState();
  }

  private notifyState(): void {
    this.stateCallbacks.forEach(cb => cb({ ...this.state }));
  }
}

// ----------- Simulator registry -----------
// Multiple simulated devices can coexist

const simulators = new Map<string, DeviceSimulator>();

export function getSimulator(deviceId: string, deviceCode?: string): DeviceSimulator {
  if (!simulators.has(deviceId)) {
    const sim = new DeviceSimulator(deviceId, deviceCode ?? deviceId);
    sim.start(2000);
    simulators.set(deviceId, sim);
  }
  return simulators.get(deviceId)!;
}

export function stopAllSimulators(): void {
  simulators.forEach(sim => sim.stop());
  simulators.clear();
}

export { DeviceSimulator };