"""
SmartPay Switch — Simulator API Endpoints
These endpoints simulate the device control interface.
When the ESP32 is connected, replace this with actual MQTT publish/subscribe.

MQTT Topics (future):
  smartpay/{device_id}/readings  ← device publishes
  smartpay/{device_id}/command   ← server publishes TURN_ON / TURN_OFF
  smartpay/{device_id}/status    ← device publishes connection status
"""

from fastapi import APIRouter
from app.schemas.models import SimulatorCommand, SimulatorReading
from datetime import datetime
import random

router = APIRouter()


@router.post("/command")
async def send_command(cmd: SimulatorCommand):
    """
    Send a command to a device.
    CURRENT: In-memory mock response.
    FUTURE: Publish to MQTT broker → ESP32 receives → executes → publishes result.
    """
    return {
        "device_id": cmd.device_id,
        "command": cmd.command,
        "status": "sent",
        "message": f"Command '{cmd.command}' sent to device {cmd.device_id}",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/{device_id}/reading")
async def get_simulated_reading(device_id: str):
    """
    Get a simulated energy reading.
    CURRENT: Generates mock data.
    FUTURE: Fetch latest reading from Supabase (published by ESP32 via MQTT bridge).
    """
    voltage = round(229 + random.random() * 3, 1)
    power = round(50 + random.random() * 200, 1)
    current = round(power / voltage, 3)
    energy = round(random.uniform(0.1, 5.0), 5)

    return SimulatorReading(
        device_id=device_id,
        timestamp=datetime.utcnow(),
        voltage=voltage,
        current=current,
        power=power,
        energy_kwh=energy,
        switch_state=True,
        device_health="ok",
    )


@router.get("/demo/devices")
async def get_demo_devices():
    """Returns the list of demo devices for testing."""
    return [
        {"id": "dev-001", "device_code": "SP-SW-00001", "name": "Room 101 Socket"},
        {"id": "dev-002", "device_code": "SP-SW-00002", "name": "Common Room TV"},
        {"id": "dev-003", "device_code": "SP-SW-00003", "name": "Laundry Machine"},
    ]
