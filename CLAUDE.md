# CLAUDE.md — AI Money Mentor (The Definitive Master Encyclopedia)

> **FOR AI AGENTS & SENIOR ARCHITECTS**: This is version 4.0 "Aether". It contains the complete technical soul of the AI Money Mentor platform. This document is the single source of truth for all logic, endpoints, script responsibilities, and data types.

---

## 🏗️ 1. System Architecture (The Tri-Layer Model)

AI Money Mentor is an **AI-First Financial Swarm** built on a decoupled architecture.

### Layer 1: Premium Frontend (Next.js 16 + Tailwind v4)
- **Framework**: Next.js 16 (App Router) for high-performance server-side rendering and client-side interactivity.
- **Styling**: Tailwind CSS v4 + Vanilla CSS + Framer Motion for high-end micro-animations.
- **State Management**: 
  - `useLocalStorage`: Custom hook for real-time form persistence.
  - `Zustand`: Global state for theme and user session.
- **Component Strategy**: Atomic Design. Generic UI components in `src/components/ui`, business logic in `src/app/agents/`.

### Layer 2: Secure BFF / Proxy Layer (Node.js)
- **Core**: Next.js API Routes (Edge/Serverless).
- **Purpose**: 
  - Sanitization: Strips sensitive headers before hitting the Python backend.
  - Database Management: Uses **Prisma ORM** to talk to a local SQLite instance (`dev.db`).
  - Auth: JWT-based session handling and Telegram ID mapping.

### Layer 3: Intelligence & Mathematical Core (FastAPI + OpenClaw)
- **Engine**: FastAPI (Python 3.12).
- **Agent Orchestrator**: **OpenClaw**. A standardized framework for multi-agent communication.
- **Inference**: Ollama (Local) or GLM-5 (Cloud) for natural language reasoning.
- **Precision Logic**: Hard-coded Python classes for tax, interest, and risk calculations to prevent LLM hallucinations.

---

## 🛤️ 2. The End-to-End User Lifecycle (Lifecycle Journey)

1.  **Entry**: User hits `http://3.109.186.88:3000`. The `layout.tsx` initializes the session.
2.  **Onboarding**: User provides Email/Name. Prisma creates a record in the `User` table.
3.  **Discovery**: User navigates to the "Agents Hub" (`/agents`). They see cards for 9 specialists.
4.  **Specialist Engagement (Example: KarVid)**:
    - **Session Start**: `useLocalStorage` loads any previously entered data.
    - **Data Entry**: User enters salary and deductions.
    - **Processing**: Click "Calculate". Frontend hits `/api/karvid` (BFF) -> `/karvid/calculate-tax` (Backend).
    - **Feedback**: UI renders a dynamic "Regime Comparison Table".
5.  **Context Injection (The "Aha!" Moment)**:
    - Frontend automatically sends a **hidden system message** to the AI Chat Bridge containing the calculation result.
    - Right-pane AI Assistant initializes with: *"I see your tax is ₹1.4L. Based on section 80C, you can save ₹45k more by..."*
6.  **Persistence**:
    - User chats with the AI. `chat_bridge.py` saves every turn to `chat_history.db`.
    - User clicks "Save Plan". Data is committed to `TaxProfile` or `FIREGoal` via Prisma.

---

## 🤖 3. The 9 Specialist Agents (Mathematical & Behavioral Depth)

| Agent | Script Path | Core Logic & Formulas |
|---|---|---|
| **DhanSarthi** | `backend/agents/dhan_sarthi/coordinator.py` | **Scoring Algorithm**: Keyword-based intent classification. Priority rules ensure `LIFE_EVENT` (boost +3.0) isn't swallowed by generic `NIVESHAK` queries. |
| **KarVid** | `backend/agents/karvid/tax_calculator.py` | **Indian Tax Slabs**: Implements New vs Old regime (FY 2025-26). `Section 87A Rebate` (Income < 7L). `Standard Deduction` (50k/75k). |
| **YojanaKarta** | `backend/agents/yojana/fire_calculator.py` | **FIRE Corp**: `(Annual Exp / 0.04)`. **SIP Calculation**: `PV = PMT * [(1+r)^n - 1] / r`. Includes inflation indexing (def 6%). |
| **BazaarGuru** | `backend/agents/bazaar/stock_data.py` | **Data Sourcing**: Direct `yfinance` realtime extraction with strict `NaN` boundary sanitation and normalized mathematical string padding in Crores (Cr). |
| **DhanRaksha** | `backend/agents/dhan/health_score.py` | **Weighted Audit**: Emergency (15%), Debt (15%), Savings (20%), Investment (20%), Insurance (10%), Retirement (10%), Credit (5%), Expense Ratio (5%). |
| **Niveshak** | `backend/agents/niveshak/portfolio_analyzer.py`| **XIRR Engine**: Newton-Raphson approximation dynamically extracting historical cash flows from absolute user-provided `SIP` and `Month` durations instead of flat mocking. Sharpe Ratio: `(R_p - R_f) / σ_p`. |
| **Vidhi** | `backend/agents/vidhi/compliance.py` | **Regulatory Knowledge**: SEBI (Investment Advisers) Regulations, 2013. I-T Act Sections (Section 10, 80). |
| **Life Event** | `backend/agents/life_event/__init__.py` | **Life Costing**: Marriage (15L), Child (20L), Education (1Cr). `FV = PV * (1+i)^n` where `i` is historical cost inflation (10% for education). |
| **Couple Plan** | `backend/agents/couple_planner/__init__.py` | **Joint Splitting**: Proportional (`Inc1/Total`), Equal (`50/50`), or Custom. 50/30/20 budget automation for joint households. |

---

## 📊 4. Database Encyclopedia (Prisma + SQLite)

### Table: `User`
- **Fields**: `id (UUID)`, `email (String)`, `name (String)`, `telegramId (String)`.
- **Role**: Root object for all financial relationships.

### Table: `Portfolio`
- **Fields**: `totalValue (Float)`, `xirr (Float)`, `holdings (JSON Blob)`.
- **Logic**: Holds parsed CAS (Account Statement) data for Niveshak.

### Table: `HealthScore`
- **Fields**: `overallScore (0-100)`, `grade (A-F)`, `financialAge (Int)`.
- **Meaning**: Snapshot of DhanRaksha's audit.

### Table: `ChatMessage`
- **Fields**: `agentType (Enum)`, `query (Text)`, `response (Text)`.
- **Role**: Allows the user to "pick up where they left off" with any of the 9 agents.

---

## 🔗 5. Complete API Manifest (Brutal Detail)

### 🐍 Backend FastAPI (Port 8000)
- `POST /dhan-sarthi/route`: `{query: str}` -> `{"agent": "karvid", "score": 0.98}`.
- `POST /karvid/calculate-tax`: Returns detailed JSON of slabs, cess, and rebates.
- `POST /bridge/chat`: `{message: str, agent_id: str}` -> LLM Stream.
- `GET /bazaar/nifty50`: Returns live ticker list.

### ⚛️ Frontend BFF (Port 3000)
- `POST /api/bridge/chat`: The "Master Proxy". Routes contextually injected prompts to OpenClaw.
- `POST /api/save/chat`: Commits messages to the SQLite database via Prisma.
- `POST /api/auth/login`: Handles session creation and ID cookie setting.

---

## 📂 6. File Content & Script Knowledge

- **`backend/api_server.py`**: The "Router of Routers". Bootstraps the FastAPI server and handles all mathematical input validation (Pydantic).
- **`backend/chat_bridge.py`**: The "Process Manager". Spawns `openclaw` shell commands via `subprocess` and pipes results to the web.
- **`backend/agents/dhan_sarthi/coordinator.py`**: Implements the `RoutingEngine` class which uses a weight-based scoring system for 50+ keywords.
- **`frontend/src/hooks/use-local-storage.ts`**: A robust React Hook that utilizes `window.localStorage` with JSON serialization to ensure form fields (income, expenses) survive page refreshes.
- **`frontend/src/lib/markdown.tsx`**: A custom wrapper around `react-markdown` that stylingizes financial tables and provides high-contrast bold text for advice.

---

## 🛠️ 7. Developer & Ops Guide

- **Adding an Agent**: 
  1. Create a `__init__.py` in `backend/agents/[new_agent]`.
  2. Implement a `calculate()` function.
  3. Register the route in `api_server.py`.
  4. Add a component in `frontend/src/app/agents/[new_agent]/page.tsx`.
- **Database Refresh**: `npx prisma generate` followed by `npx prisma db push`.
- **Test Suite**: Always run `pytest backend/tests/deep_agent_test.py` before pushing. 51/51 tests must be green.

---

*Project AI Money Mentor — Last Updated: March 28, 2026 — v4.0 "The Source of Truth"*
