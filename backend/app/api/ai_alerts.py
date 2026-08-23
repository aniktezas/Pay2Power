from fastapi import APIRouter
from app.schemas.models import AIAlert
router = APIRouter()

@router.get("/", response_model=list[AIAlert])
async def get_alerts(device_ids: str = ""): return []

@router.post("/{alert_id}/acknowledge")
async def acknowledge(alert_id: str): return {"status": "ok"}

@router.post("/{alert_id}/resolve")
async def resolve(alert_id: str): return {"status": "ok"}
