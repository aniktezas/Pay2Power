// ============================================================
// SmartPay Switch — Hybrid Billing Engine
//// Core business logic: time + energy dual-limit model.
// NEVER simplify to only time-based or only energy-based.
// The FIRST limit reached terminates the session.
// ============================================================

import type { BillingConfig, SessionLimits, SessionProgress, TerminationReason } from '../types';

/**
 * Calculate session limits from a payment amount.
 * Uses a per-unit pricing model:
 *   amountPaid / pricePerUnit = number of units
 *   units * timePerUnit = total time (minutes)
 *   units * energyPerUnit = total energy (kWh)
 */
export function calculateSessionLimits(
  amountPaid: number,
  config: BillingConfig
): SessionLimits {
  const units = amountPaid / config.pricePerUnit;
  const timeLimitSeconds = Math.floor(units * config.timePerUnit * 60);
  const energyLimitKwh = units * config.energyPerUnit;

  return {
    timeLimitSeconds,
    energyLimitKwh,
    amountPaid,
  };
}

/**
 * Calculate the current progress of a session.
 * Checks BOTH time and energy limits.
 */
export function calculateSessionProgress(
  limits: SessionLimits,
  startedAt: Date,
  energyConsumedKwh: number
): SessionProgress {
  const now = new Date();
  const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

  const timeRemainingSeconds = Math.max(0, limits.timeLimitSeconds - elapsedSeconds);
  const energyRemainingKwh = Math.max(0, limits.energyLimitKwh - energyConsumedKwh);

  const timeProgressPercent = Math.min(100, (elapsedSeconds / limits.timeLimitSeconds) * 100);
  const energyProgressPercent = Math.min(100, (energyConsumedKwh / limits.energyLimitKwh) * 100);

  // Check termination conditions — first limit reached wins
  let isExpired = false;
  let terminationReason: TerminationReason | undefined;

  if (energyConsumedKwh >= limits.energyLimitKwh) {
    isExpired = true;
    terminationReason = 'ENERGY_LIMIT_REACHED';
  } else if (elapsedSeconds >= limits.timeLimitSeconds) {
    isExpired = true;
    terminationReason = 'TIME_LIMIT_REACHED';
  }

  return {
    elapsedSeconds,
    energyConsumedKwh,
    timeRemainingSeconds,
    energyRemainingKwh,
    timeProgressPercent,
    energyProgressPercent,
    isExpired,
    terminationReason,
  };
}

/**
 * Format a billing config into a human-readable description.
 */
export function describePricing(config: BillingConfig): string {
  const hours = config.timePerUnit / 60;
  return `₹${config.pricePerUnit} gives up to ${hours} hour${hours !== 1 ? 's' : ''} OR ${config.energyPerUnit} kWh`;
}

/**
 * Describe why a session was terminated.
 */
export function describeTermination(reason: TerminationReason): string {
  switch (reason) {
    case 'TIME_LIMIT_REACHED': return 'Time limit reached';
    case 'ENERGY_LIMIT_REACHED': return 'Energy limit reached';
    case 'MANUAL_STOP': return 'Manually stopped';
    case 'DEVICE_DISABLED': return 'Device was disabled';
    case 'DEVICE_FAULT': return 'Device fault detected';
    case 'SERVER_ERROR': return 'Server error';
    default: return 'Session ended';
  }
}
