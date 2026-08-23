from fastapi import APIRouter
from app.schemas.models import Device, DeviceCreate, DeviceUpdate, EnergyReading, EnergyReadingCreate

router = APIRouter()


@router.get("/{owner_id}", response_model=list[Device])
async def get_devices(owner_id: str):
    """Get all devices for an owner. TODO: implement with Supabase."""
    return []


@router.post("/", response_model=Device)
async def create_device(payload: DeviceCreate):
    """Register a new SmartPay device. TODO: implement with Supabase."""
    raise NotImplementedError("Supabase integration pending")


@router.get("/{device_id}", response_model=Device)
async def get_device(device_id: str):
    """Get a device by ID. TODO: implement with Supabase."""
    raise NotImplementedError("Supabase integration pending")


@router.patch("/{device_id}", response_model=Device)
async def update_device(device_id: str, updates: DeviceUpdate):
    """Update device status/name/location. TODO: implement."""
    raise NotImplementedError("Supabase integration pending")


@router.get("/{device_id}/readings", response_model=list[EnergyReading])
async def get_readings(device_id: str, limit: int = 60):
    """Get energy reading history for a device. TODO: implement."""
    return []


@router.post("/{device_id}/readings")
async def submit_reading(device_id: str, reading: EnergyReadingCreate):
    """
    Submit an energy reading from a device.
    Future: This endpoint will be called by the ESP32 via HTTP or via MQTT bridge.
    """
    return {"status": "ok", "message": "Reading received (stub)"}
