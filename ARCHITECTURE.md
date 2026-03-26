# AI Money Mentor - Architecture Documentation

## Overview

AI Money Mentor is India's first multi-agent personal finance platform for Indian investors. It combines a **Next.js frontend**, a **FastAPI backend**, and an **OpenClaw multi-agent swarm** with 9 specialized AI agents. DhanSarthi ("The Brain") coordinates all queries, routing them to the right specialist agent.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js Frontend                           │
│       Landing • 9 Agent Pages • Auth • Profile • Chat           │
│                      (Port 3000)                                │
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐│
│  │  Prisma + SQLite     │  │  Zustand Store (localStorage)   ││
│  │  User, Chat, Tax,    │  │  user, theme, activeAgent       ││
│  │  FIRE, Health        │  │                                  ││
│  └──────────────────────┘  └──────────────────────────────────┘│
└───────────────────────┬─────────────────────────────────────────┘
                        │  BFF Proxy (/api/*)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FastAPI Backend (Port 8000)                  │
│                                                                 │
│     ┌─────────────────────────────────────────────────┐         │
│     │          🧠 DhanSarthi (Coordinator)             │         │
│     │   "The Brain" — keyword scoring + intent routing │         │
│     │   Handles greetings, help, thanks, explain       │         │
│     └──────┬──────┬──────┬──────┬──────┬──────┬───────┘         │
│            │      │      │      │      │      │                 │
│       ┌────▼─┐┌───▼──┐┌──▼───┐┌─▼────┐┌▼─────┐┌▼──────┐       │
│       │KarVid││Yojana││Bazaar││ Dhan ││Nivesh││ Vidhi │       │
│       │ 🧾   ││ 🎯   ││ 📈   ││ 💪   ││ 📊   ││ ⚖️    │       │
│       │ Tax  ││ FIRE ││Stock ││Health││  MF  ││Legal │       │
│       └──────┘└──────┘└──────┘└──────┘└──────┘└──────┘       │
│       ┌──────────────────┐ ┌──────────────────┐                 │
│       │ Life Event  🎉   │ │ Couple Planner 💑│                 │
│       │ Marriage, Baby   │ │ Joint Finance    │                 │
│       └──────────────────┘ └──────────────────┘                 │
│                                                                 │
│     20+ REST endpoints • Python calculation modules             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
            ┌──────────▼──────────┐
            │  OpenClaw Gateway   │
            │  (Agent Swarm)      │
            │                     │
            │  Ollama / GLM-5     │
            │  (LLM Inference)    │
            └─────────────────────┘
```

---

## Request Flow

### 1. Chat Flow (Primary UX)

```
User types: "Hello" or "Calculate tax for 15 lakhs"
     │
     ▼
Next.js DhanSarthi Chat Page
     │
     │ POST /api/dhan-sarthi (BFF proxy)
     ▼
FastAPI /dhan-sarthi/route
     │
     ▼
DhanSarthi Coordinator (coordinator.py)
     │
     ├─ Is it a greeting/help/thanks? → Return self-response (no agent delegation)
     │
     ├─ Has finance keywords? → Score all agents → Route to best match
     │     │
     │     ├─ "tax 15 lakhs" → KarVid (POST /karvid/calculate-tax)
     │     ├─ "retire early"  → Yojana (POST /yojana/fire-number)
     │     ├─ "RELIANCE price" → Bazaar (POST /bazaar/stock-quote)
     │     ├─ "health score"  → Dhan (POST /dhan/health-score)
     │     ├─ "married next yr" → Life Event (POST /life-event/plan)
     │     └─ "joint budget"  → Couple Planner (POST /couple/plan)
     │
     ▼
Frontend receives agent + data → generates formatted response
     │
     ├─ Displays in chat UI with agent badge
     └─ Saves to Prisma DB (POST /api/save/chat)
```

### 2. Auth Flow

```
User enters email/telegramId
     │
     ├─ Sign Up → POST /api/auth/signup → Prisma user.create → localStorage
     ├─ Login   → POST /api/auth/login  → Prisma user.findUnique → localStorage
     └─ Update  → POST /api/auth/update → Prisma user.update → localStorage
```

---

## Database Schema (Prisma + SQLite)

```
User
├── id (UUID)
├── telegramId? (unique)
├── email? (unique)
├── name, phone
├── createdAt, updatedAt
│
├── Portfolio (1:1) — totalValue, xirr, sharpeRatio, holdings (JSON)
├── TaxProfile[] — financialYear, regime, grossIncome, deductions, taxPayable
├── FIREGoal[] — targetCorpus, monthlyExpenses, targetYears, monthlySIP
├── HealthScore[] — overallScore, emergencyFund, savingsRate, debtToIncome
└── ChatMessage[] — agentType, query, response, createdAt
```

---

## DhanSarthi Routing Logic

DhanSarthi uses a **keyword-based scoring system with priority boosts**:

1. **Greeting Detection** (runs first): `hello`, `hi`, `namaste`, `good morning`, `help`, `thanks` → self-handles with friendly response
2. **Finance Keyword Guard**: If greeting + finance keywords present → route to agent instead
3. **Agent Scoring**: Each agent has keywords + example queries. Score = keyword matches × weight
4. **Priority Boost**: Life Event (+3.0) and Couple Planner (+3.0) get boosted to prevent misrouting to Yojana
5. **Confidence Threshold**: 0.3 minimum to route; below that → default to Niveshak

### Agent Types (10 total)

| AgentType | Handles |
|-----------|---------|
| `DHAN_SARTHI` | Greetings, help, thanks, generic explain |
| `NIVESHAK` | Portfolio analysis, mutual funds, XIRR |
| `KARVID` | Tax calculation, 80C/80D, capital gains |
| `YOJANA` | FIRE planning, retirement, SIP |
| `BAZAAR` | Stock prices, market data |
| `DHAN` | Financial health score |
| `VIDHI` | Legal compliance, SEBI |
| `LIFE_EVENT` | Marriage, baby, education planning |
| `COUPLE_PLANNER` | Joint budgets, expense splitting |

---

## Project Structure

```
AI-Money-Mentor/
├── frontend/                    # Next.js 16 + React 19
│   ├── src/app/
│   │   ├── agents/              # 9 agent UI pages
│   │   ├── api/                 # BFF proxy routes + auth + save
│   │   │   ├── auth/            # login, signup, update
│   │   │   ├── save/            # chat, fire, health, tax
│   │   │   └── [agent]/         # 8 agent proxy routes
│   │   ├── login/page.tsx       # Auth page
│   │   └── profile/page.tsx     # User profile
│   ├── src/lib/
│   │   ├── api.ts               # Axios clients (9 agent APIs)
│   │   ├── prisma.ts            # Prisma singleton
│   │   └── store.ts             # Zustand (user, theme)
│   └── prisma/schema.prisma     # DB models
│
├── backend/
│   ├── api_server.py            # FastAPI (20+ endpoints)
│   ├── chat_bridge.py           # OpenClaw CLI ↔ SQLite bridge
│   ├── agents/
│   │   ├── dhan_sarthi/coordinator.py  # Query routing (10 agents)
│   │   ├── karvid/              # Indian tax engine
│   │   ├── yojana/              # FIRE calculator
│   │   ├── bazaar/              # NSE stock data
│   │   ├── dhan/                # Health score (8-factor)
│   │   ├── niveshak/            # Portfolio analyzer
│   │   ├── vidhi/               # SEBI compliance
│   │   ├── life_event/          # Life event planner
│   │   └── couple_planner/      # Couple finance planner
│   └── tests/
│       ├── deep_agent_test.py   # 26 deep integration tests
│       └── greeting_test.py     # 25 greeting/routing tests
│
├── README.md
├── ARCHITECTURE.md              # This file
├── IMPLEMENTATION.md
└── CLAUDE.md
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16, React 19, TypeScript | App Router, SSR |
| Styling | Tailwind CSS v4, shadcn/ui | Responsive UI |
| Backend | FastAPI, Python 3.11+ | REST API (20+ endpoints) |
| Database | Prisma 5, SQLite | Users, chat, portfolios |
| State | Zustand + localStorage | Client-side auth/theme |
| AI Swarm | OpenClaw 2026.3, Ollama, GLM-5 | Multi-agent orchestration |
| Testing | Deep + Greeting tests (51 total) | Live EC2 integration tests |

---

## Deployment (EC2)

| Service | Port | Command |
|---------|------|---------|
| Frontend | 3000 | `cd frontend && npm run dev` |
| Backend | 8000 | `cd backend && uvicorn api_server:app --host 0.0.0.0 --port 8000` |

**EC2:** `ubuntu@3.109.186.88`
**GitHub:** https://github.com/Devguru-codes/AI-Money-Mentor

---

## Testing

- **Deep Agent Tests (26):** Every backend endpoint with parameter validation
- **Greeting Tests (25):** DhanSarthi routing — greetings, help, thanks, explain, finance keywords, regressions
- **Total: 51/51 PASS** ✅

---

*Last Updated: March 26, 2026*
