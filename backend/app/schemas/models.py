from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid


# ---- Profiles ----

class ProfileBase(BaseModel):
    full_name: str
    role: Literal["owner", "consumer"]

class ProfileCreate(ProfileBase):
    id: str  # Supabase auth user ID

class Profile(ProfileBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Devices ----

DeviceStatus = Literal["online", "offline", "active", "disabled", "fault", "power_on", "power_off"]

class DeviceBase(BaseModel):
    device_code: str = Field(..., pattern=r"^SP-SW-\d{5}$", example="SP-SW-00001")
    name: str
    location: Optional[str] = None

class DeviceCreate(DeviceBase):
    owner_id: str

class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[DeviceStatus] = None
    location: Optional[str] = None

class Device(DeviceBase):
    id: str
    owner_id: str
    status: DeviceStatus = "offline"
    created_at: datetime
    last_seen_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---- Pricing ----

class PricingBase(BaseModel):
    price: float = Field(..., gt=0, description="Price in INR")
    time_limit_minutes: int = Field(..., gt=0, description="Max time in minutes")
    energy_limit_kwh: float = Field(..., gt=0, description="Max energy in kWh")

class PricingCreate(PricingBase):
    device_id: str

class Pricing(PricingBase):
    id: str
    device_id: str
    active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Wallet ----

class Wallet(BaseModel):
    id: str
    user_id: str
    balance: float
    updated_at: datetime

    class Config:
        from_attributes = True

class AddCreditRequest(BaseModel):
    amount: float = Field(..., gt=0)
    user_id: str


# ---- Transactions ----

TransactionStatus = Literal["pending", "success", "failed", "refunded"]

class Transaction(BaseModel):
    id: str
    user_id: str
    device_id: Optional[str] = None
    amount: float
    status: TransactionStatus
    payment_reference: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Sessions ----

class SessionStartRequest(BaseModel):
    user_id: str
    amount_paid: float = Field(..., gt=0)

class SessionLimits(BaseModel):
    time_limit_seconds: int
    energy_limit_kwh: float
    amount_paid: float

TerminationReason = Literal[
    "TIME_LIMIT_REACHED", "ENERGY_LIMIT_REACHED",
    "MANUAL_STOP", "DEVICE_DISABLED", "DEVICE_FAULT", "SERVER_ERROR"
]

class UsageSession(BaseModel):
    id: str
    user_id: str
    device_id: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    amount_paid: float
    time_limit_seconds: int
    energy_limit_kwh: float
    duration_seconds: int = 0
    energy_consumed_kwh: float = 0
    status: Literal["active", "completed", "terminated"] = "active"
    termination_reason: Optional[TerminationReason] = None

    class Config:
        from_attributes = True


# ---- Energy Readings ----

class EnergyReading(BaseModel):
    id: Optional[str] = None
    device_id: str
    timestamp: datetime
    voltage: float
    current: float
    power: float
    energy_kwh: float

    class Config:
        from_attributes = True

class EnergyReadingCreate(BaseModel):
    voltage: float
    current: float
    power: float
    energy_kwh: float


# ---- AI Alerts ----

AlertSeverity = Literal["low", "medium", "high", "critical"]
AlertStatus = Literal["active", "acknowledged", "resolved"]

class AIAlert(BaseModel):
    id: str
    device_id: str
    timestamp: datetime
    anomaly_score: float = Field(..., ge=0, le=1)
    severity: AlertSeverity
    message: str
    status: AlertStatus = "active"

    class Config:
        from_attributes = True


# ---- Simulator (future ESP32 interface) ----

class SimulatorCommand(BaseModel):
    """Commands sent to device. Future: replace with MQTT publish."""
    command: Literal["TURN_ON", "TURN_OFF", "GET_STATUS", "GET_READINGS"]
    device_id: str
    payload: Optional[dict] = None

class SimulatorReading(BaseModel):
    """Readings received from device. Future: received via MQTT subscribe."""
    device_id: str
    timestamp: datetime
    voltage: float
    current: float
    power: float
    energy_kwh: float
    switch_state: bool = False
    device_health: str = "ok"
