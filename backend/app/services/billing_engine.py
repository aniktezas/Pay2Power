"""
SmartPay Switch — Hybrid Billing Engine (Python)

This is the authoritative server-side billing logic.
The same logic exists in the frontend (billingEngine.ts) for real-time UI feedback.
The server-side implementation is the source of truth.

Future: When ESP32 is connected, it will ALSO run limit enforcement locally
so that loss of internet connectivity cannot leave power running past the limit.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class BillingConfig:
    price_per_unit: float      # e.g. 10.0 (₹10)
    time_per_unit_minutes: int # e.g. 120 (2 hours per ₹10)
    energy_per_unit_kwh: float # e.g. 1.0 (1 kWh per ₹10)


@dataclass
class SessionLimits:
    time_limit_seconds: int
    energy_limit_kwh: float
    amount_paid: float


@dataclass
class SessionProgress:
    elapsed_seconds: int
    energy_consumed_kwh: float
    time_remaining_seconds: int
    energy_remaining_kwh: float
    time_progress_percent: float
    energy_progress_percent: float
    is_expired: bool
    termination_reason: Optional[str] = None


def calculate_session_limits(amount_paid: float, config: BillingConfig) -> SessionLimits:
    """
    Calculate time and energy limits from a payment amount.
    
    Example:
        config: ₹10 = 120 min, 1 kWh
        amount_paid: ₹20
        → units = 20/10 = 2
        → time_limit = 2 * 120 * 60 = 14400 seconds (4 hours)
        → energy_limit = 2 * 1.0 = 2.0 kWh
    """
    units = amount_paid / config.price_per_unit
    time_limit_seconds = int(units * config.time_per_unit_minutes * 60)
    energy_limit_kwh = units * config.energy_per_unit_kwh

    return SessionLimits(
        time_limit_seconds=time_limit_seconds,
        energy_limit_kwh=energy_limit_kwh,
        amount_paid=amount_paid,
    )


def calculate_session_progress(
    limits: SessionLimits,
    started_at: datetime,
    energy_consumed_kwh: float,
) -> SessionProgress:
    """
    Calculate current session progress.
    ALWAYS checks BOTH time and energy limits.
    The first limit reached terminates the session.
    
    This is the core SmartPay hybrid billing logic.
    Never simplify to only time-based or only energy-based.
    """
    now = datetime.utcnow()
    elapsed_seconds = int((now - started_at).total_seconds())

    time_remaining = max(0, limits.time_limit_seconds - elapsed_seconds)
    energy_remaining = max(0.0, limits.energy_limit_kwh - energy_consumed_kwh)

    time_progress = min(100.0, (elapsed_seconds / limits.time_limit_seconds) * 100)
    energy_progress = min(100.0, (energy_consumed_kwh / limits.energy_limit_kwh) * 100)

    is_expired = False
    termination_reason = None

    # Check energy limit FIRST (often reached before time in high-load scenarios)
    if energy_consumed_kwh >= limits.energy_limit_kwh:
        is_expired = True
        termination_reason = "ENERGY_LIMIT_REACHED"
    elif elapsed_seconds >= limits.time_limit_seconds:
        is_expired = True
        termination_reason = "TIME_LIMIT_REACHED"

    return SessionProgress(
        elapsed_seconds=elapsed_seconds,
        energy_consumed_kwh=energy_consumed_kwh,
        time_remaining_seconds=time_remaining,
        energy_remaining_kwh=energy_remaining,
        time_progress_percent=time_progress,
        energy_progress_percent=energy_progress,
        is_expired=is_expired,
        termination_reason=termination_reason,
    )


def describe_termination(reason: str) -> str:
    descriptions = {
        "TIME_LIMIT_REACHED": "Time limit reached",
        "ENERGY_LIMIT_REACHED": "Energy limit reached",
        "MANUAL_STOP": "Manually stopped",
        "DEVICE_DISABLED": "Device was disabled",
        "DEVICE_FAULT": "Device fault detected",
        "SERVER_ERROR": "Server error",
    }
    return descriptions.get(reason, "Session ended")
