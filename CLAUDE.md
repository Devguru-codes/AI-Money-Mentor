# CLAUDE.md — AI Money Mentor Project Context

> This file should be read by AI agents at the start of each session to understand the full project context.

---

## Project Overview

**AI Money Mentor** is an AI-powered personal finance advisory platform for Indian users. It consists of a **Next.js frontend**, a **FastAPI backend**, and an **OpenClaw multi-agent swarm** connected to **9 Telegram bots**. The system makes financial planning as accessible as checking WhatsApp.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Telegram (9 Bots)  ←→  OpenClaw Agent Swarm        │
│                          (glm-5:cloud via Ollama)    │
└─────────────────────────────────────────────────────┘
           ↕ Native Agent-to-Agent Delegation
┌─────────────────────────────────────────────────────┐
│  Next.js Frontend (Port 80/3000)                    │
│    ├── UI Pages (src/app/agents/*)                  │
│    ├── BFF Proxy Routes (src/app/api/*)             │
│    └── Prisma + SQLite (user data persistence)      │
└─────────────────┬───────────────────────────────────┘
                  ↓ HTTP Proxy
┌─────────────────────────────────────────────────────┐
│  FastAPI Backend (Port 8000)                        │
│    └── backend/agents/ (9 Python calculation modules)│
└─────────────────────────────────────────────────────┘
```

**Key Pattern:** Next.js API routes (`/api/*`) proxy all requests to FastAPI (`localhost:8000`). The frontend NEVER calls FastAPI directly from the browser.

---

## The 9 Agents

| # | Agent ID         | Name                     | FastAPI Endpoints                                     | Telegram Bot                  |
|---|------------------|--------------------------|-------------------------------------------------------|-------------------------------|
| 1 | `dhan-sarthi`    | DhanSarthi (Coordinator) | `POST /dhan-sarthi/route`                             | @dhansarthi                   |
| 2 | `karvid`         | KarVid (Tax Wizard)      | `POST /karvid/calculate-tax`, `/karvid/compare-regimes` | @karvid                      |
| 3 | `yojana`         | YojanaKarta (FIRE)       | `POST /yojana/fire-number`                            | @yojana                       |
| 4 | `bazaar`         | BazaarGuru (Markets)     | `POST /bazaar/stock-quote`                            | @bazaar                       |
| 5 | `dhan`           | DhanRaksha (Health)      | `POST /dhan/health-score`                             | @dhan                         |
| 6 | `niveshak`       | Niveshak (MF X-Ray)      | `POST /niveshak/xirr`                                 | @niveshak                     |
| 7 | `vidhi`          | Vidhi (Compliance)       | `GET /vidhi/disclaimers`                              | @vidhi                        |
| 8 | `life-event`     | Life Event Advisor       | `POST /life-event/plan`, `/life-event/comprehensive`  | @financeadvisorisabot         |
| 9 | `couple-planner` | Couple's Money Planner   | `POST /couple/plan`, `/couple/budget`, `/couple/goals` | @coupleplannerisabot          |

---

## Project Structure

```
ai-money-mentor-unified/
├── backend/
│   ├── api_server.py              # FastAPI main server (574 lines)
│   ├── requirements.txt           # Python dependencies
│   ├── agents/
│   │   ├── dhan_sarthi/           # Coordinator (routes queries)
│   │   │   ├── coordinator.py
│   │   │   ├── ai_endpoint.py
│   │   │   └── ai_responder.py
│   │   ├── karvid/                # Tax calculations
│   │   │   ├── tax_calculator.py
│   │   │   ├── tax_brackets.py
│   │   │   ├── deductions.py
│   │   │   ├── capital_gains.py
│   │   │   └── indian_tax_laws.py
│   │   ├── yojana/                # FIRE planning
│   │   │   └── fire_calculator.py
│   │   ├── bazaar/                # Stock data
│   │   │   └── stock_data.py
│   │   ├── dhan/                  # Health scoring
│   │   │   └── health_score.py
│   │   ├── niveshak/              # MF portfolio analysis
│   │   │   ├── portfolio_analyzer.py
│   │   │   ├── cas_parser.py
│   │   │   ├── mf_data.py
│   │   │   └── demo_portfolios.py
│   │   ├── vidhi/                 # Compliance
│   │   │   ├── compliance.py
│   │   │   └── legal_knowledge.py
│   │   ├── life_event/            # Life event advisor (345 lines)
│   │   │   └── __init__.py
│   │   └── couple_planner/        # Couples planner (431 lines)
│   │       └── __init__.py
│   ├── bots/
│   │   └── telegram_bot.py
│   └── tests/
│       ├── test_all.py
│       ├── test_karvid.py
│       └── test_yojana.py
│
├── frontend/
│   ├── src/app/
│   │   ├── agents/                # 9 agent UI pages
│   │   │   ├── dhan-sarthi/page.tsx
│   │   │   ├── karvid/page.tsx
│   │   │   ├── yojana/page.tsx
│   │   │   ├── bazaar/page.tsx
│   │   │   ├── dhan/page.tsx
│   │   │   ├── niveshak/page.tsx
│   │   │   ├── vidhi/page.tsx
│   │   │   ├── life-event/page.tsx
│   │   │   └── couple-planner/page.tsx
│   │   ├── api/                   # BFF proxy routes → FastAPI
│   │   │   ├── dhan-sarthi/route.ts
│   │   │   ├── karvid/route.ts
│   │   │   ├── yojana/route.ts
│   │   │   ├── bazaar/route.ts
│   │   │   ├── dhan/route.ts
│   │   │   ├── vidhi/route.ts
│   │   │   ├── life-event/route.ts
│   │   │   ├── couple-planner/route.ts
│   │   │   ├── auth/login/route.ts
│   │   │   ├── auth/signup/route.ts
│   │   │   └── save/*/route.ts
│   │   ├── login/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── layout.tsx             # Server component (metadata)
│   │   └── page.tsx               # Homepage
│   ├── src/components/
│   │   ├── ClientLayout.tsx       # Client component (nav, theme)
│   │   ├── AgentCard.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── ui/                    # shadcn/ui components
│   ├── src/lib/
│   │   ├── api.ts                 # Axios clients
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── store.ts               # State store
│   │   └── utils.ts
│   ├── prisma/schema.prisma       # Database schema
│   └── package.json
│
├── start-dev.sh                   # Dev startup script
├── start-prod.sh                  # Production startup script
├── Makefile                       # Common commands
├── ARCHITECTURE.md
├── IMPLEMENTATION.md
└── CLAUDE.md                      # This file
```

---

## OpenClaw Swarm Configuration

Located at `~/.openclaw/openclaw.json` on the EC2 instance.

- **Model:** `ollama/glm-5:cloud`
- **Agent-to-Agent:** Enabled. All 9 agents listed in `tools.agentToAgent.allow`
- **Routing:** DhanSarthi delegates semantically via native OpenClaw tools (NOT keyword parsing)
- **Skills:** Each agent has a `SKILL.md` with YAML frontmatter in `~/.openclaw/skills/`
- **Personas:** Each agent has an `AGENTS.md` in `~/.openclaw/agents/{id}/agent/`

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | Next.js 16, React 19, Tailwind v4, shadcn/ui |
| Backend   | FastAPI, Python 3.10+                   |
| Database  | SQLite via Prisma ORM                   |
| AI Swarm  | OpenClaw + Ollama (glm-5:cloud)         |
| Telegram  | python-telegram-bot + OpenClaw bindings |
| CI/CD     | GitHub Actions (Jest + build)           |

---

## How to Run

```bash
# Full stack (dev)
./start-dev.sh    # or: make dev

# Backend only
cd backend && source venv/bin/activate
uvicorn api_server:app --host 0.0.0.0 --port 8000

# Frontend only
cd frontend && npm run dev

# Tests
cd frontend && npm test       # Jest (17 tests)
cd backend && pytest tests/   # Python tests
```

---

## Deployment

- **EC2:** `ubuntu@3.109.186.88`
- **Frontend:** Port 80 (Nginx → Next.js :3000)
- **Backend:** Port 8000 (uvicorn)
- **GitHub:** https://github.com/Devguru-codes/AI-Money-Mentor

---

## Common Tasks

### Add a New Agent
1. Create `backend/agents/new_agent/` with `__init__.py`
2. Import and add endpoints in `api_server.py`
3. Create `frontend/src/app/agents/new-agent/page.tsx`
4. Create `frontend/src/app/api/new-agent/route.ts`
5. Register in `~/.openclaw/openclaw.json` (agents.list + agentToAgent.allow + bindings)
6. Create `~/.openclaw/skills/new-agent/SKILL.md` with YAML frontmatter
7. Create `~/.openclaw/agents/new-agent/agent/AGENTS.md` persona

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
