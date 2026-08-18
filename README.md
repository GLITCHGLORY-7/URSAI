<div align="center">
  <img src="./public/ursai-logo.jpg" alt="URSAI Logo" width="400" />
  
  *The URSAI identity: A modern, enterprise-ready symbol representing autonomous urban resource swarm intelligence.*

  # URSAI

  **URBAN RESOURCE SWARM AI INTELLIGENCE.**

  Enterprise grade smart city command. No human latency. Just autonomous swarm logic.

  🎬 [Watch URSAI AI in action — Full Tactical Map Demo](https://drive.google.com/drive/folders/18dUl6W1lwACDIuqiNb_m9BF8IZDsyly6)
</div>

---

## 📊 PROJECT STATISTICS

*Codebase statistics are calculated from project-owned source files at the time of documentation generation. Dependency directories, build artifacts, caches, generated files, binaries, and README documentation are excluded from the primary source LOC calculation.*

```text
+-------------------------------------------------------------------------+
| 📄 SOURCE      | 💻 CODE         | 🧩 MODULES     | 🚀 PERFORMANCE    |
|----------------|-----------------|----------------|-------------------|
| 123 FILES      | 18,539 LINES    | 4 MODULES      | 60 FPS WebGL      |
+-------------------------------------------------------------------------+
```

| Metric | Lines |
| :--- | :--- |
| **Total Lines** | 18,539 |
| **Code Lines** | 15,759 |
| **Blank Lines** | 2,780 |

**Module Breakdown:**

| Module | Files | Lines of Code | Primary Role |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | 35 | 5,600 | React SPA / Command Dashboard |
| **Map Engine** | 6 | 4,300 | Three.js / WebGL 3D Tactical Map |
| **AI Swarm Core** | 16 | 1,460 | Multi-Agent Coordination / Logic |
| **Simulation** | 66 | 7,179 | Data models / City Environment |

---

## 📚 CONTENTS

- [Project Statistics](#-project-statistics)
- [Overview & Philosophy](#-overview--philosophy)
- [Project Scenario: The Chennai Simulation](#-project-scenario-the-chennai-simulation)
- [Problem & Solution](#-problem---solution)
- [Key Features](#-key-features)
- [COMPLETE VISUAL PRODUCT WALKTHROUGH](#-complete-visual-product-walkthrough)
- [System Architecture Flow](#-system-architecture-flow)
- [Module Architecture](#-module-architecture)
- [Languages & Technology Stack](#-languages--technology-stack)
- [Configuration & Setup](#-configuration---setup)

---

## 🎯 OVERVIEW & PHILOSOPHY

**URSAI** stands for **Urban Resource Swarm AI Intelligence**. 

It is a next-generation smart city emergency command and control platform that wraps an entire metropolitan grid in an autonomous AI agent swarm and a highly immersive 3D Digital Twin environment.

### The URSAI Philosophy
The acronym encapsulates the core architecture of the platform:
- **Urban Resource**: Managing and directing critical city infrastructure, such as ambulances, police interceptors, and dynamic traffic grids.
- **Swarm AI Intelligence**: Moving away from centralized human dispatchers and instead utilizing decentralized, multi-agent artificial intelligence. Individual AI agents operate independently but collaborate dynamically as a "swarm" to solve complex logistical problems in real-time.

By integrating multi-agent coordination with **NVIDIA NIM LLMs** for strategic decision-making, URSAI demonstrates how future cities can handle critical incidents—from traffic accidents to severe weather emergencies—entirely autonomously with zero human latency.

---

## 🏙️ PROJECT SCENARIO: THE CHENNAI SIMULATION

To prove the efficacy of the swarm, URSAI features a live **Chennai Command Sector** simulation. The project drops the user into a high-stakes, 3D interactive simulation of downtown Chennai, India. 

**The Use Case:**
A severe, multi-vehicle collision occurs at a major intersection (e.g., Anna Salai / Teynampet DMS Junction Corridor). Human dispatchers would typically take minutes to parse the chaos, contact emergency units, and navigate traffic. URSAI handles it in milliseconds:

1. **Incident Detected**: The Swarm Orchestrator parses the severity of the crash and establishes a V2X (Vehicle-to-Everything) Mesh Network.
2. **Police Interceptor (PD-28)**: Dispatched ahead of medical teams to secure a 150m crash perimeter and establish civilian diversions.
3. **Ambulance Agent (AM-15)**: A Type-IV Advanced Life Support unit is routed to the scene, streaming live ECG telemetry. 
4. **Traffic Controller (TR-07)**: Hijacks the SCATS traffic signal grid. As the ambulance moves, the AI forcibly overrides traffic lights, creating a "Green Wave" corridor that eliminates red-light stops entirely.
5. **Hospital Agent**: Pre-allocates Trauma Bay #2 at Apollo Hospitals (Greams Road) before the patient even arrives.

---

## ❗ PROBLEM → 💡 SOLUTION

```text
           PROBLEM
+---------------------------+
| Human dispatch latency    |
| Fragmented city systems   |
| Traffic gridlock delays   |
| Suboptimal unit routing   |
+---------------------------+
             |
             v
           SOLUTION
+---------------------------+
| Autonomous Agent Swarms   |
| V2X Green Wave Corridors  |
| 3D Digital Command        |
| Sub-second AI Dispatch    |
+---------------------------+
```

---

## ✨ KEY FEATURES

*   **🧠 AI Decision Engine (NVIDIA NIM)**: Utilizes `meta/llama-3.3-70b-instruct` to instantly analyze incident reports, assess severity, and autonomously dispatch the optimal mix of emergency services.
*   **🗺️ 3D Digital Twin Interface**: A fully interactive, high-density WebGL tactical map built on Three.js, featuring real-time tracking of AI agents, live traffic simulation, and dynamic routing.
*   **🤖 Multi-Agent Swarm Logic**: Independent, cooperative agents for Ambulance, Police, Fire Rescue, and Traffic Control. Agents communicate via a central event bus to synchronize complex operations.
*   **🚥 V2X Green Wave Corridors**: The Traffic Agent dynamically preempts SCATS traffic signals, creating zero-stop corridors for emergency vehicles.
*   **📊 Operational Intelligence**: Live telemetry dashboards providing command-center visibility into system health, response times, active dispatches, and hospital availability.
*   **📱 Responsive Command Dashboard**: A meticulously crafted, responsive UI that allows commanders to monitor the swarm from desktop, tablet, or mobile.

---

## 📸 COMPLETE VISUAL PRODUCT WALKTHROUGH

### 1. 2D Tactical Command Interface
<img src="./public/docs/2d_map.png" alt="2D Tactical Map" width="800" />

*The overarching 2D command view providing a macro-level perspective of the city grid. Autonomous agents—such as Police and Traffic units—are tracked in real-time as they maneuver to secure the incident zone and establish V2X green corridors.*

### 2. 3D Digital Twin Cityscape
<img src="./public/docs/3d_twin.png" alt="3D Digital Twin" width="800" />

*A highly optimized, 60FPS WebGL immersive view. This detailed 3D environment allows dispatchers to monitor the swarm's activity at ground level, visualizing building coordinates and the cyber-physical mesh network.*

### 3. Satellite Telemetry Mode
<img src="./public/docs/satellite_map.jpg" alt="Satellite Map Mode" width="800" />

*High-resolution satellite overlay enabling precision geographic coordination. The active tracking paths of the AM-15 Ambulance and PD-28 Interceptor are traced across the actual topography of the Chennai sector.*

### 4. Live Mission Activity & Agent Handover
<img src="./public/docs/agent_activity_1.png" alt="Mission Activity - Handover" width="400" />

*Real-time telemetry sidebar tracking the autonomous actions of the swarm. As Ambulance AM-15 arrives at the hospital, the Hospital Agent updates ICU capacity and the Traffic Agent releases the green corridor locks automatically.*

### 5. Automated Incident Classification
<img src="./public/docs/agent_activity_2.png" alt="Incident Classification" width="400" />

*The NVIDIA NIM LLM orchestrator instantly parsing the incoming raw data (a severe rollover crash at Kathipara Cloverleaf Junction), classifying it as CRITICAL, and assigning the optimal destination hospital without human intervention.*

### 6. Ambulance & Police Agent Roles
<img src="./public/docs/agent_roles_1.png" alt="Ambulance & Police Agents" width="400" />

*Granular telemetry detailing the Ambulance Agent's ongoing task (handing over the patient to Trauma Bay 2) and the Police Agent's rapid response to secure a 150m crash perimeter and manage civilian diversion.*

### 7. Traffic & Hospital Agent Roles
<img src="./public/docs/agent_roles_2.png" alt="Traffic & Hospital Agents" width="400" />

*Telemetry cards for the Traffic Agent (overriding 4 junctions to save 4.8 minutes via dynamic V2X signal extension) and the Hospital ER Agent (pre-allocating trauma bays to eliminate wait times).*

### 8. Autonomous V2X Inter-Agent Comms
<img src="./public/docs/ai_comms.png" alt="AI Comms Log" width="400" />

*The transparent AI communication stream. The Swarm Orchestrator dispatches units, while autonomous agents negotiate strategies and confirm completion—entirely without human input.*

---

## 🏗️ SYSTEM ARCHITECTURE FLOW

URSAI operates on a decentralized swarm architecture. Instead of a single monolithic brain dictating all moves, URSAI utilizes a **Coordinator** that delegates objectives to specialized, autonomous agents.

```mermaid
graph TD
    A[Emergency Detected] -->|Raw Text / Telemetry| B(NVIDIA NIM LLM)
    B -->|Analyzes Severity & Classifies Incident| C{Swarm Coordinator}
    
    C -->|Dispatch| D[Ambulance Agent]
    C -->|Dispatch| E[Police Agent]
    C -->|Activate| F[Traffic Agent]
    C -->|Notify| G[Hospital Agent]
    
    D -->|Streams Real-time GPS Location| F
    F -->|V2X Preemption| H((City Traffic Signals))
    H -->|Creates Green Wave| D
    
    E -->|Secures Perimeter & Diversions| I((Crash Site))
    D -->|Navigates at High Speed to| I
    D -->|Loads & Transports Patient to| G
```

1. **Incident Injection**: A simulated multi-vehicle collision is fed to the swarm.
2. **LLM Evaluation**: NVIDIA NIM processes the text, extracts severity, and determines the required agent payload.
3. **Swarm Execution**: The Coordinator wakes up the respective agents.
4. **Agent Collaboration**: The Traffic Agent observes the Ambulance Agent's location in real-time and actively turns traffic lights green ahead of it.
5. **3D Visualization**: The React frontend subscribes to the Agent Event Bus and updates the Three.js canvas at 60 FPS.

---

## 🧩 MODULE ARCHITECTURE

```text
src/
├── agents/            # Autonomous Swarm Agents (Ambulance, Police, Traffic)
├── components/        # React UI Components
│   ├── ai/            # Decision Engine Interfaces
│   ├── map/           # Three.js Tactical 3D Map
│   └── mission/       # Agent Telemetry Sidebars
├── coordination/      # Central Event Bus & Mission Coordinator
├── data/              # City infrastructure datasets & coordinates
├── services/          # Core business logic & API integrations
└── types/             # TypeScript interfaces
```

---

## 💻 LANGUAGES & TECHNOLOGY STACK

URSAI is built for maximum performance, utilizing a modern, strictly-typed web stack to handle intensive rendering and high-frequency telemetry.

*   **TypeScript (85%)**: The core backbone of the URSAI engine. Chosen for its strict type safety, which is absolutely critical when handling concurrent agent states, complex event-bus payloads, and 3D coordinate math without runtime errors.
*   **React 18**: Powers the reactive data layer and UI rendering. The component tree is heavily optimized to prevent unnecessary re-renders when the high-frequency telemetry streams push updates.
*   **Three.js (WebGL)**: The engine driving the 3D Digital Twin. It utilizes advanced PBR (Physically Based Rendering) materials, dynamic shadows, and thousands of instanced geometries to render the cityscape at 60 FPS directly in the browser.
*   **Tailwind CSS**: The utility-first styling framework used to design the cyberpunk, data-dense command center dashboard and ensure it remains responsive across all devices.
*   **Vite**: The lightning-fast build tool and development server powering the project.
*   **NVIDIA NIM Cloud APIs**: Provides low-latency access to the `meta/llama-3.3-70b-instruct` model, which acts as the intelligent brain parsing unstructured emergencies into structured swarm actions.

---

## 🔮 FUTURE ROADMAP: THE 2030 VISION

URSAI is built to scale. While the current build successfully coordinates terrestrial vehicles, the architecture is designed for full metropolitan integration:
- **[Q1 2027] Airborne Swarm Integration**: Integrating autonomous drone swarms for aerial perimeter surveillance and critical medical supply drops.
- **[Q3 2027] Predictive Weather Analytics**: Interfacing with meteorological APIs to pre-position resources before severe weather events trigger structural emergencies.
- **[2028] Full V2I Integration**: Extending communication beyond traffic lights to include bridge control, metro rail shutdowns, and automated street barrier deployments.
- **[2030] Zero-Latency Smart City Grid**: 100% autonomous emergency response capabilities operating across every sector of Chennai.

---

## 🎮 COMMAND CENTER OPERATIONS GUIDE

While URSAI operates autonomously, human commanders retain full oversight capabilities:
1. **Presentation Mode**: Use the toggle in the top navigation bar to enter full-screen immersive command center mode.
2. **View Toggles**: Instantly switch between `2D Streets`, `3D Tilt`, and `Satellite` telemetry to gain the optimal perspective for the ongoing incident.
3. **3D View Adjuster**: Use the on-screen D-Pad or your mouse (Left-Click to Orbit, Scroll to Zoom, Right-Click to Pan) to inspect ground-level agent movements.
4. **Agent Telemetry**: Monitor the `MISSION & AGENT ACTIVITY` sidebar to view real-time log outputs, ensuring that the AI Swarm is negotiating priorities efficiently.

---

## 🚀 CONFIGURATION & SETUP

### Prerequisites
*   Node.js (v18 or higher)
*   NVIDIA NIM API Key (Required for the AI Decision Engine)

### Local Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GLITCHGLORY-7/URSAI.git
   cd URSAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   NVIDIA_API_KEY=your_nvidia_api_key_here
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

---

## 🚢 DEPLOYMENT (Vercel)

URSAI is fully optimized for zero-config deployment on Vercel.

1. Import your GitHub repository into Vercel.
2. Vercel will automatically detect the **Vite** configuration.
3. Add your `NVIDIA_API_KEY` to the Vercel Environment Variables.
4. Click **Deploy**.

---

<div align="center">
  <p>Engineered for the future of urban resilience.</p>
</div>
