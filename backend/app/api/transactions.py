from fastapi import APIRouter
from app.schemas.models import Transaction
router = APIRouter()

@router.get("/{user_id}", response_model=list[Transaction])
async def get_transactions(user_id: str, limit: int = 50): return []
