# ============================================================
# SmartPay Switch — FastAPI Backend
# ============================================================
# Architecture:
#   ESP32 → Wi-Fi → MQTT → FastAPI → Supabase → React
#
# This file is the entry point. Run with:
#   uvicorn main:app --reload
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import devices, pricing, sessions, wallet, transactions, simulator, ai_alerts
from app.core.config import settings

app = FastAPI(
    title="SmartPay Switch API",
    description="IoT Prepaid Electricity Management Platform",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(devices.router, prefix="/devices", tags=["Devices"])
app.include_router(pricing.router, prefix="/devices", tags=["Pricing"])
app.include_router(sessions.router, prefix="/devices", tags=["Sessions"])
app.include_router(wallet.router, prefix="/wallet", tags=["Wallet"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
app.include_router(ai_alerts.router, prefix="/ai-alerts", tags=["AI Alerts"])
app.include_router(simulator.router, prefix="/simulator", tags=["Device Simulator"])


@app.get("/")
async def root():
    return {
        "service": "SmartPay Switch API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
