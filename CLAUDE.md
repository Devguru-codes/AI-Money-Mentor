# CLAUDE.md — AI Money Mentor Project Context

> This file should be read by AI agents at the start of each session to understand the full project context.

---

## Project Overview

**AI Money Mentor** is India's first multi-agent personal finance platform. It consists of a **Next.js frontend**, a **FastAPI backend**, and an **OpenClaw multi-agent swarm** with 9 specialized AI agents. The system routes financial queries through **DhanSarthi** ("The Brain") to the right specialist agent.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Next.js Frontend (Port 3000)                       │
│    ├── UI Pages (src/app/agents/*)                  │
│    ├── BFF Proxy Routes (src/app/api/*)             │
│    ├── Auth (login, signup, update)                  │
│    └── Prisma + SQLite (user data + chat history)   │
└─────────────────┬───────────────────────────────────┘
                  ↓ HTTP Proxy
┌─────────────────────────────────────────────────────┐
│  FastAPI Backend (Port 8000)                        │
│    ├── DhanSarthi Coordinator (keyword scoring)     │
│    └── 9 Python Agent Modules (25+ endpoints)       │
└─────────────────┬───────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────┐
│  OpenClaw Agent Swarm (Ollama / GLM-5 Cloud)        │
└─────────────────────────────────────────────────────┘
```

**Key Pattern:** Next.js API routes (`/api/*`) proxy all requests to FastAPI (`localhost:8000`). The frontend NEVER calls FastAPI directly from the browser.

---

## The 9 Agents

| # | Agent ID | Name | Key Endpoints |
|---|----------|------|---------------|
| 1 | `dhan-sarthi` | DhanSarthi (Coordinator) | `POST /dhan-sarthi/route` |
| 2 | `karvid` | KarVid (Tax Wizard) | `POST /karvid/calculate-tax`, `/compare-regimes`, `/80c`, `/capital-gains` |
| 3 | `yojana` | YojanaKarta (FIRE) | `POST /yojana/fire-number`, `/sip-recommendation`, `/retirement-plan` |
| 4 | `bazaar` | BazaarGuru (Markets) | `POST /bazaar/stock-quote`, `GET /bazaar/nifty50` |
| 5 | `dhan` | DhanRaksha (Health) | `POST /dhan/health-score` |
| 6 | `niveshak` | Niveshak (MF X-Ray) | `POST /niveshak/analyze`, `/risk-metrics` |
| 7 | `vidhi` | Vidhi (Compliance) | `GET /vidhi/disclaimers`, `/regulations` |
| 8 | `life-event` | Life Event Advisor | `POST /life-event/plan`, `/comprehensive` |
| 9 | `couple-planner` | Couple's Planner | `POST /couple/finances`, `/budget`, `/split-expense`, `/debt-payoff` |

---

## DhanSarthi Routing

The coordinator uses `coordinator.py` with keyword-based scoring:

1. **Greeting Check** (pre-scoring): hello, hi, namaste, help, thanks → self-response
2. **Finance Guard**: If greeting + finance keywords → routes to agent instead of self-handling
3. **Keyword Scoring**: Each of 10 agent types has weighted keywords; best score wins
4. **Priority Boost**: Life Event (+3.0) and Couple Planner (+3.0) to prevent misrouting

The `AgentType` enum has 10 entries: `DHAN_SARTHI`, `NIVESHAK`, `KARVID`, `YOJANA`, `BAZAAR`, `DHAN`, `VIDHI`, `LIFE_EVENT`, `COUPLE_PLANNER`.

---

## Project Structure

```
AI-Money-Mentor/
├── frontend/
│   ├── src/app/
│   │   ├── agents/                # 9 agent UI pages
│   │   │   └── dhan-sarthi/page.tsx  # Main chat UI (700 lines)
│   │   ├── api/                   # BFF proxy routes → FastAPI
│   │   │   ├── auth/{login,signup,update}/route.ts
│   │   │   ├── save/{chat,fire,health,tax}/route.ts
│   │   │   └── {agent}/route.ts   # 8 agent proxies
│   │   ├── login/page.tsx
│   │   └── profile/page.tsx
│   ├── src/lib/
│   │   ├── api.ts                 # Axios clients (9 agents)
│   │   ├── prisma.ts              # Prisma singleton
│   │   └── store.ts               # Zustand store
│   └── prisma/schema.prisma       # DB models (6 tables)
│
├── backend/
│   ├── api_server.py              # FastAPI (25+ endpoints)
│   ├── chat_bridge.py             # OpenClaw CLI bridge
│   ├── agents/
│   │   ├── dhan_sarthi/coordinator.py  # Routing (10 agents, greeting aware)
│   │   ├── karvid/                # Tax engine
│   │   ├── yojana/                # FIRE calculator
│   │   ├── bazaar/                # Stock data
│   │   ├── dhan/                  # Health score
│   │   ├── niveshak/              # Portfolio analyzer
│   │   ├── vidhi/                 # SEBI compliance
│   │   ├── life_event/            # Life event planner
│   │   └── couple_planner/        # Couple finance
│   └── tests/
│       ├── deep_agent_test.py     # 26 tests
│       └── greeting_test.py       # 25 tests
│
├── README.md
├── ARCHITECTURE.md
├── IMPLEMENTATION.md
└── CLAUDE.md                      # This file
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind v4, shadcn/ui |
| Backend | FastAPI, Python 3.11+ |
| Database | SQLite via Prisma ORM (6 tables) |
| State | Zustand + localStorage |
| AI Swarm | OpenClaw + Ollama (glm-5:cloud) |
| Testing | Deep + Greeting tests (51 total) |

---

## How to Run

```bash
# Full stack (dev)
./start-dev.sh    # or: make dev

# Backend only
cd backend && source venv/bin/activate
uvicorn api_server:app --host 0.0.0.0 --port 8000

# Frontend only
cd frontend && npm install && npx prisma generate && npx prisma db push
npm run dev

# Tests (on EC2)
python3 tests/deep_agent_test.py     # 26 tests
python3 tests/greeting_test.py       # 25 tests
```

---

## Deployment

- **EC2:** `ubuntu@3.109.186.88`
- **Frontend:** Port 3000
- **Backend:** Port 8000
- **GitHub:** https://github.com/Devguru-codes/AI-Money-Mentor

---

## Bug Fixes Applied (v2.0)

### Backend (5 fixes)
1. Yojana retirement: `NoneType` comparison fix
2. LifeEvent comprehensive: defensive age/income handling
3. Couple debt-payoff: `Person` dataclass updated
4. KarVid LTCG: parameter mismatch fix
5. KarVid 80C: `lic` → `life_insurance_premium` remapping

### Routing (3 fixes)
6. DhanSarthi greeting/help/thanks/explain self-handling
7. Life Event agent with priority boost (+3.0)
8. Couple Planner agent with priority boost (+3.0)

### Frontend (5 fixes)
9. Login calls real API (not localStorage-only)
10. Chat messages saved to Prisma DB
11. Chat history GET endpoint for loading
12. Profile update via `/api/auth/update`
13. DhanSarthi greeting response display

---

## Common Tasks

### Add a New Agent
1. Create `backend/agents/new_agent/` with `__init__.py`
2. Import and add endpoints in `api_server.py`
3. Add AgentType + capability in `coordinator.py`
4. Create `frontend/src/app/agents/new-agent/page.tsx`
5. Create `frontend/src/app/api/new-agent/route.ts`
6. Add API helper in `frontend/src/lib/api.ts`

### Database Migration
```bash
cd frontend
npx prisma migrate dev --name description
npx prisma generate
```

---

## Security Notes

**Never commit:** `.env` files, API keys, Telegram bot tokens, `*.db` files.

**Already in .gitignore:** `.env`, `*.db`, `*.db-journal`, `node_modules/`, `.next/`, `__pycache__/`, `venv/`

---

*Last Updated: March 26, 2026*
