from fastapi import APIRouter
from app.schemas.models import Pricing, PricingCreate
router = APIRouter()

@router.get("/{device_id}/pricing", response_model=Pricing)
async def get_pricing(device_id: str):
    """Get active pricing for a device. TODO: implement."""
    raise NotImplementedError

@router.post("/{device_id}/pricing", response_model=Pricing)
async def set_pricing(device_id: str, payload: PricingCreate):
    """Set pricing for a device. TODO: implement."""
    raise NotImplementedError
