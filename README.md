# SmartPay Switch

**IoT-Based Retrofit Prepaid Electricity Management Platform**

> College Project 2026 | React + FastAPI + Supabase | Hybrid Prepaid Billing

---

## Overview

SmartPay Switch is a full-stack web platform for managing prepaid electricity access using IoT devices. The system enables owners to attach a SmartPay device to any electrical switch or socket, configure pricing, and share a QR code with consumers who can then purchase electricity credit and use it.

**Key differentiator:** SmartPay uses a **hybrid billing model** — it tracks both time and energy simultaneously and stops the supply at whichever limit is reached first. This protects both owners (guaranteed revenue per unit) and consumers (guaranteed maximum usage).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v6 |
| Auth/DB | Supabase (PostgreSQL + Auth + Realtime) |
| Backend API | FastAPI (Python 3.11+) |
| Device Comm | Device Simulator → Future: ESP32 + MQTT |

---

## Quick Start

### 1. Frontend (runs in full demo mode — no backend needed)

```bash
cd smartpay-switch
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:5173**

> **Demo mode is ON by default.** All features work without Supabase using localStorage-based mock data.

### 2. With Supabase (for real persistence)

1. Create a free project at https://supabase.com
2. Run `supabase_schema.sql` in the SQL editor
3. Copy your project URL and anon key to `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```

### 3. Backend (optional — stub mode by default)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API docs: **http://localhost:8000/docs**

---

## Features

### Owner (Register with "owner" role)
- **Dashboard** — Live metrics: devices, sessions, energy, revenue
- **Device Management** — Register devices with unique codes, enable/disable
- **QR Codes** — Generate and download QR for each device
- **Pricing** — Configure hybrid billing: ₹X = N hours OR M kWh
- **Analytics** — Energy/revenue charts, device performance table
- **AI Alerts** — Anomaly detection with severity classification

### Consumer (Register with "consumer" role or include "consumer" in email in demo)
- **Wallet** — Demo credit management (₹10, ₹20, ₹50, ₹100, ₹200, ₹500)
- **QR Purchase** — Scan device QR → See pricing → Purchase → Electricity ON
- **Live Session** — Real-time power reading + dual progress bars
- **Auto-Cutoff** — Session ends automatically at time OR energy limit
- **History** — Transaction and session history

---

## Hybrid Billing Model

```
₹10 → 2 hours OR 1 kWh (whichever comes first)

Scenario A: Consumer uses a 500W appliance for 2 hours
  Energy = 500W × 2h = 1 kWh → Energy limit reached → OFF ✓

Scenario B: Consumer uses a 100W appliance for 4 hours
  Time = 4 hours → Time limit reached → OFF ✓

Scenario C: Consumer uses a 200W appliance for 3 hours
  Energy = 200W × 3h = 600Wh = 0.6 kWh
  Time = 3 hours → Time limit reached → OFF ✓
```

---

## Demo Mode

In demo mode (`VITE_DEMO_MODE=true`), a **Demo Control Panel** appears in the bottom-right corner. You can:

- **Turn ON/OFF** the device simulator
- **Set power level** (50W, 100W, 200W, 400W)
- **Fast-forward time** (30 or 60 minutes)
- **Fast-forward energy** (0.5 or 1.0 kWh)
- **Trigger simulated anomaly** — generates an AI alert
- **Toggle offline** — simulates device disconnection

This allows a full demo without physical hardware.

---

## Project Structure

```
smartpay-switch/
├── frontend (/)
│   ├── src/
│   │   ├── types/          # TypeScript interfaces
│   │   ├── lib/            # Supabase client
│   │   ├── contexts/       # Auth context
│   │   ├── services/       # API + device simulator
│   │   │   ├── auth.service.ts
│   │   │   ├── device.service.ts
│   │   │   ├── session.service.ts
│   │   │   ├── wallet.service.ts
│   │   │   ├── simulator.service.ts  ← Replace for real hardware
│   │   │   ├── analytics.service.ts
│   │   │   └── ai.service.ts
│   │   ├── utils/
│   │   │   ├── billingEngine.ts     ← Core hybrid billing logic
│   │   │   └── formatters.ts
│   │   ├── components/
│   │   │   ├── ui/         # Reusable UI components
│   │   │   ├── layout/     # Navbar, Sidebar, AppLayout
│   │   │   ├── device/     # DeviceCard, LiveReading, HybridProgress
│   │   │   └── demo/       # DemoControlPanel
│   │   └── pages/
│   │       ├── LandingPage.tsx
│   │       ├── DevicePage.tsx      ← QR landing for consumers
│   │       ├── TransactionsPage.tsx
│   │       ├── auth/
│   │       ├── owner/
│   │       └── consumer/
│   ├── .env.example
│   └── supabase_schema.sql
│
└── backend/
    ├── main.py                     ← FastAPI entry point
    ├── requirements.txt
    ├── app/
    │   ├── api/              # Route handlers
    │   ├── schemas/          # Pydantic models
    │   ├── services/         # Billing engine
    │   └── core/             # Config
    └── README.md
```

---

## Architecture: Path to Real Hardware

```
Phase 1 (NOW):
  Browser ← React → Simulator (localStorage mock) → UI updates

Phase 2 (Supabase connected):
  Browser ← React → Supabase API → PostgreSQL
                  ↑
            Supabase Realtime subscriptions

Phase 3 (ESP32 connected):
  ESP32 → Wi-Fi → MQTT Broker → FastAPI → Supabase
                                          ↓
                              Supabase Realtime → React UI
```

**Only `simulator.service.ts` needs to change** when moving from simulation to real hardware. All other code remains unchanged.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (safe for frontend) |
| `VITE_DEMO_MODE` | `true` to show Demo Control Panel |

---

## College Project Credits

- **SmartPay Switch** — IoT Prepaid Electricity Platform
- **Academic Year:** 2025–2026
- **Stack:** React · FastAPI · Supabase · ESP32 (planned)
