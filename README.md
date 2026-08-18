# URSAI — Urban Resource Swarm AI
### AI-Powered Multi-Agent Smart City Resource Coordination System

URSAI (Urban Resource Swarm AI) is an advanced smart-city emergency coordination platform operating across the Chennai Metropolitan Region (`13.0827° N, 80.2707° E`). It demonstrates how emergency agents—Ambulance, Police, Traffic Signal Control, and Hospital Intake—collaborate through an authoritative multi-agent coordination engine backed by NVIDIA NIM AI reasoning.

---

## 🏛 System Architecture & Workflow

```
                    URSAI CORE COMMAND CENTER
                                │
       ┌────────────────────────┼────────────────────────┐
       ▼                        ▼                        ▼
OpenStreetMap Tiles      OSRM Routing          Open-Meteo Weather
       │                        │                        │
       └────────────────────────┼────────────────────────┘
                                ▼
                      CITY DATA SIMULATOR
                  (Congestion, Weather, ICU)
                                │
                                ▼
                       AI DECISION ENGINE
            (NVIDIA NIM Llama 3.3 70B / Rule Fallback)
                                │
                                ▼
                   AUTHORITATIVE COORDINATOR
            (State Machine & Swarm Orchestrator)
                                │
    ┌────────────┬──────────────┴──────────────┬────────────┐
    ▼            ▼                             ▼            ▼
Ambulance      Police                    Traffic Agent   Hospital Agent
(AMB-01)      (POL-01)                  (Green Corridor)  (Intake/ICU)
    │            │                             │            │
    └────────────┴──────────────┬──────────────┴────────────┘
                                ▼
                      ADAPTIVE MISSION MONITOR
                     (Condition & Replan Engine)
                                │
                                ▼
                      PERFORMANCE & EVALUATION
```

---

## ⚡ Key Features Across All 15 Phases

- **Unified Multi-Department Swarm (Phase 20):** Expands URSAI across 12 city departments (EMS, Police, Fire & Rescue, Traffic, Hospital, Disaster Management, Public Works, Electricity/Power Utility, Water & Sewerage, Weather/Environment, Emergency Comms, and City Administration). Only contextually required departments are activated per incident.
- **Command Center Layout & Presentation Mode (Phase 14):** Dominant Leaflet map canvas, tabbed navigation (**Command Center**, **Departments**, **Scenario Lab**, **Swarm & Learning**, **Stress Lab**, **Performance**, **About**), and a clean **Presentation Mode** for executive demonstrations.
- **One-Interaction Demo Engine (Phase 14):** Single-click **`START DEMO`** sequence with reliable **Pause**, **Resume**, **Reset**, and **3x Speed** controls.
- **NVIDIA NIM AI Decision Engine (Phase 5):** Leverages `meta/llama-3.3-70b-instruct` via backend Express proxy routes (`/api/nim-prediction`) with robust rule-based fallback.
- **Autonomous Multi-Agent Swarm (Phases 1-4, 8):**
  - **Ambulance Agent (AMB-01):** Turn-by-turn OSRM routing, live position interpolation, dual-leg mission execution.
  - **Police Agent (POL-01):** Perimeter security and crowd control dispatch.
  - **Traffic Agent:** Dynamic Green Corridor signal clearing along emergency routes.
  - **Hospital Agent:** Multi-factor emergency intake scoring across 5 major Chennai medical centers.
- **Digital Twin & What-If Analysis (Phase 12):** Counterfactual scenario modeling for extreme traffic congestion, heavy rainfall, and ICU capacity stress.
- **Performance Evaluation & AI Benchmarking (Phase 13):** Empirical baseline vs. swarm preemption benchmark calculations with JSON/CSV exporter.
- **System Resilience & Health Layer (Phase 9):** Subsystem invariant monitoring, error boundaries, structured event logging, and instant reset capabilities.

---

## 🎬 Quick Demo Steps (Phase 14)

1. Click **`START DEMO`** in the bottom Action Bar.
2. Observe the automated emergency dispatch on Anna Salai flyover.
3. Watch the synchronized response across Ambulance, Police, Green Corridor Traffic, and Hospital Intake.
4. Click **`PAUSE DEMO`** to inspect situation telemetry, then **`RESUME DEMO`**.
5. Toggle **`DEMO SIMULATION SPEED (3x)`** for accelerated completion.
6. Observe the final **`MISSION COMPLETED`** card detailing measured response metrics.
7. Click **`RESET SIMULATION`** to return to idle state instantly.

---

## 📚 Project Documentation (`/docs`)

- [`docs/demo-script.md`](./docs/demo-script.md) — Step-by-step presentation script.
- [`docs/architecture.md`](./docs/architecture.md) — Comprehensive technical architecture & data flow.
- [`docs/project-summary.md`](./docs/project-summary.md) — Executive summary & capabilities overview.
- [`docs/test-report.md`](./docs/test-report.md) — QA verification matrix and test results.
- [`docs/release-checklist.md`](./docs/release-checklist.md) — Production release checklist.

---

## 🔒 Environment Configuration

Copy `.env.example` to `.env`:

```env
NVIDIA_API_KEY=your_nvidia_nim_api_key_here
NVIDIA_NIM_MODEL=meta/llama-3.3-70b-instruct
```

> **Note:** If `NVIDIA_API_KEY` is not provided or the NIM API is unreachable, URSAI automatically engages its deterministic rule-based fallback engines, ensuring 100% functional continuity.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (Port 3000)
npm run dev

# 3. Build for production
npm run build

# 4. Start production build
npm run start
```

---

## 📊 Data Honesty & Operational Disclaimer

- **REAL / EXTERNAL SERVICES:**
  - OpenStreetMap & CartoDB Dark Matter (Map tiles & spatial imagery)
  - OSRM (Road network route calculations)
  - Open-Meteo API (Live meteorological weather feed)
  - NVIDIA NIM API (LLM multi-agent reasoning when configured)

- **SIMULATED DATA MODELS:**
  - Emergency Incidents & Accidents
  - Swarm unit positions & movement interpolation
  - Hospital bed & ICU capacity registry
  - City traffic congestion indices

> 🚨 **OPERATIONAL DISCLAIMER:** URSAI is a working simulation prototype for research and demonstration purposes. It is not a certified emergency-response system and must not be used for real-world emergency dispatch or operational control.
