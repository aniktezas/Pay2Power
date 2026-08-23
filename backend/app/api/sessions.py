from fastapi import APIRouter
from app.schemas.models import UsageSession, SessionStartRequest
from app.services.billing_engine import calculate_session_limits, BillingConfig

router = APIRouter()


@router.post("/{device_id}/sessions/start", response_model=UsageSession)
async def start_session(device_id: str, req: SessionStartRequest):
    """
    Start a prepaid electricity session.
    1. Verify device is available
    2. Deduct wallet balance
    3. Calculate time + energy limits via billing engine
    4. Create session record
    5. Send TURN_ON command to device (via MQTT in production)
    TODO: implement with Supabase
    """
    raise NotImplementedError("Supabase integration pending")


@router.get("/{device_id}/sessions/active", response_model=UsageSession)
async def get_active_session(device_id: str):
    """Get the currently active session for a device. TODO: implement."""
    raise NotImplementedError("Supabase integration pending")


@router.post("/{device_id}/sessions/{session_id}/stop")
async def stop_session(device_id: str, session_id: str):
    """
    Manually stop an active session.
    1. Send TURN_OFF to device
    2. Record termination with MANUAL_STOP reason
    3. Update session record
    TODO: implement with Supabase
    """
    raise NotImplementedError("Supabase integration pending")


@router.get("/{device_id}/sessions", response_model=list[UsageSession])
async def get_session_history(device_id: str, limit: int = 20):
    """Get session history for a device. TODO: implement."""
    return []
