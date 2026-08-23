from fastapi import APIRouter
from app.schemas.models import Wallet, AddCreditRequest
router = APIRouter()

@router.get("/{user_id}", response_model=Wallet)
async def get_wallet(user_id: str): raise NotImplementedError

@router.post("/{user_id}/add-credit", response_model=Wallet)
async def add_credit(user_id: str, req: AddCreditRequest): raise NotImplementedError
