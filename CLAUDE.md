# CLAUDE.md - AI Money Mentor Project Context

> **Purpose:** This file provides complete context to Claude (or any AI coding agent) when working on this project via Remote SSH or any other access method.

---

## Project Overview

**Name:** AI Money Mentor
**Type:** Full-stack financial advisory platform for Indian investors
**Architecture:** Next.js 16 (Frontend) + FastAPI (Backend) + SQLite (Prisma)

### What This Project Does

AI Money Mentor is a comprehensive financial advisory platform with 7 specialized AI agents:

| Agent | Purpose | Key Features |
|-------|---------|--------------|
| **KarVid** | Tax Wizard | Tax calculation, regime comparison, 80C deductions, capital gains |
| **Yojana** | FIRE Planner | FIRE number calculation, SIP recommendations, retirement planning |
| **Bazaar** | Market Research | Stock quotes, NIFTY 50 data, top gainers/losers |
| **Dhan** | Health Score | Financial health assessment, credit score factors |
| **Niveshak** | MF Portfolio | XIRR calculation, risk metrics, portfolio analysis |
| **Vidhi** | Compliance | SEBI regulations, RBI guidelines, tax disclaimers |
| **DhanSarthi** | Coordinator | Routes queries to appropriate agents |

---

## Project Structure

```
ai-money-mentor-unified/
├── frontend/                    # Next.js 16 + React 19
│   ├── src/
│   │   ├── app/
│   │   │   ├── agents/         # 7 Agent pages
│   │   │   │   ├── karvid/     # Tax Wizard UI
│   │   │   │   ├── yojana/     # FIRE Planner UI
│   │   │   │   ├── bazaar/     # Market Research UI
│   │   │   │   ├── dhan/       # Health Score UI
│   │   │   │   ├── niveshak/   # Portfolio UI
│   │   │   │   ├── vidhi/      # Compliance UI
│   │   │   │   └── dhan-sarthi/ # Coordinator UI
│   │   │   ├── api/            # API routes (proxy to backend)
│   │   │   │   ├── karvid/route.ts
│   │   │   │   ├── yojana/route.ts
│   │   │   │   ├── bazaar/route.ts
│   │   │   │   ├── dhan/route.ts
│   │   │   │   ├── niveshak/route.ts
│   │   │   │   ├── vidhi/route.ts
│   │   │   │   ├── dhan-sarthi/route.ts
│   │   │   │   ├── save/       # Save to database
│   │   │   │   └── auth/       # Authentication
│   │   │   ├── layout.tsx     # Root layout
│   │   │   └── page.tsx       # Home page
│   │   ├── components/        # Reusable components
│   │   │   └── ui/            # shadcn/ui components
│   │   └── lib/
│   │       └── api.ts         # Axios clients for backend
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── package.json
│   └── .env.local             # Frontend env vars
│
├── backend/                     # FastAPI + Python
│   ├── agents/                 # 7 AI agents
│   │   ├── karvid/            # Tax calculations
│   │   ├── yojana/            # FIRE planning
│   │   ├── bazaar/            # Stock data
│   │   ├── dhan/              # Health scoring
│   │   ├── niveshak/          # Portfolio analysis
│   │   ├── vidhi/             # Compliance
│   │   ├── dhan_sarthi/       # Query routing
│   │   └── dhan/               # Health score
│   ├── bots/
│   │   └── telegram_bot.py    # Telegram bot handlers
│   ├── api_server.py          # FastAPI server (main)
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Backend env vars (shared)
│
├── .env                        # Shared environment variables
├── start-dev.sh               # Development start script
├── start-prod.sh              # Production start script
├── Makefile                   # Common commands
├── ARCHITECTURE.md            # Detailed architecture docs
└── CLAUDE.md                  # This file
```

---

## Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **React:** 19
- **UI:** Tailwind CSS v4 + shadcn/ui
- **Database:** SQLite via Prisma ORM
- **HTTP Client:** Axios

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **Data Processing:** pandas, numpy, scipy
- **Financial Data:** yfinance, mftool
- **Telegram:** python-telegram-bot
- **AI Integration:** OpenAI API (optional)

### Key Dependencies
```json
// Frontend (package.json)
"next": "^16.0.0",
"react": "^19.0.0",
"@prisma/client": "^5.22.0",
"axios": "^1.6.0"
```

```txt
# Backend (requirements.txt)
fastapi>=0.135.0
uvicorn>=0.42.0
yfinance>=1.2.0
pandas>=2.3.0
mftool>=3.2
python-telegram-bot>=21.0
openai>=1.0.0
python-dotenv
```

---

## Environment Variables

### Required (.env)

```env
# Database
DATABASE_URL="file:./frontend/prisma/dev.db"

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:8000
BACKEND_URL=http://localhost:8000

# Telegram Bot Tokens (7 bots)
DHANSARTHI_BOT_TOKEN=your_token_here
KARVID_BOT_TOKEN=your_token_here
NIVESHAK_BOT_TOKEN=your_token_here
YOJANA_BOT_TOKEN=your_token_here
BAZAAR_BOT_TOKEN=your_token_here
DHAN_BOT_TOKEN=your_token_here
VIDHI_BOT_TOKEN=your_token_here

# OpenAI (optional, for AI explanations)
OPENAI_API_KEY=your_key_here
```

---

## How to Run

### Development
```bash
# Start both frontend and backend
./start-dev.sh

# Or use Makefile
make dev

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Production
```bash
./start-prod.sh
# or
make start
```

### Individual Services
```bash
# Backend only
cd backend
source venv/bin/activate
uvicorn api_server:app --host 0.0.0.0 --port 8000

# Frontend only
cd frontend
npm run dev  # development
npm run build && npm run start  # production
```

---

## API Endpoints

### Backend (FastAPI)

| Endpoint | Method | Agent | Description |
|----------|--------|-------|-------------|
| `/` | GET | - | Service info |
| `/health` | GET | - | Health check |
| `/karvid/calculate-tax` | POST | KarVid | Calculate tax |
| `/karvid/compare-regimes` | POST | KarVid | Compare old vs new regime |
| `/yojana/fire-number` | POST | Yojana | Calculate FIRE number |
| `/bazaar/stock-quote` | POST | Bazaar | Get stock price |
| `/dhan/health-score` | POST | Dhan | Calculate financial health |
| `/niveshak/xirr` | POST | Niveshak | Calculate XIRR |
| `/vidhi/disclaimers` | GET | Vidhi | Get tax disclaimers |
| `/dhan-sarthi/route` | POST | DhanSarthi | Route query to agent |

### Frontend API Routes (Proxy to Backend)

All routes in `/api/*` proxy requests to `BACKEND_URL` (default: `http://localhost:8000`)

---

## Database Schema (Prisma)

```prisma
model User {
  id            String        @id @default(uuid())
  telegramId    String?       @unique
  email         String?       @unique
  name          String?
  phone         String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  portfolio     Portfolio?
  taxProfiles   TaxProfile[]
  fireGoals     FIREGoal[]
  healthScores  HealthScore[]
  chatHistory   ChatMessage[]
}

model Portfolio {
  id            String        @id @default(uuid())
  userId        String        @unique
  user          User          @relation(fields: [userId])
  holdings      Holding[]
  totalValue    Float
  xirr          Float?
  riskScore     Float?
}

// ... more models in prisma/schema.prisma
```

---

## Key Design Decisions

### 1. Hybrid Architecture
- **Frontend (Next.js)**: Handles UI, routing, and API proxying
- **Backend (FastAPI)**: Handles business logic, calculations, and external APIs
- **Why**: Clean separation, scalable, easy to deploy independently

### 2. API Proxy Pattern
- Frontend API routes (`/api/*`) proxy to backend
- **Why**: Avoids CORS issues, allows same-origin requests
- **How**: `BACKEND_URL` environment variable configures backend location

### 3. SQLite + Prisma
- **Why**: Simple, no external database server needed for MVP
- **Migration**: Can switch to PostgreSQL by changing `DATABASE_URL`

### 4. Agent Architecture
- Each agent is a self-contained Python module
- `api_server.py` imports and exposes agent functions
- **Why**: Modular, easy to add new agents

---

## Common Tasks

### Add a New Agent

1. Create `backend/agents/new_agent/` with `__init__.py` and logic
2. Import in `api_server.py`
3. Add API endpoints
4. Create `frontend/src/app/agents/new_agent/page.tsx`
5. Add API route in `frontend/src/app/api/new_agent/route.ts`
6. Add axios client in `frontend/src/lib/api.ts`

### Add a New API Endpoint

```python
# backend/api_server.py
@app.post("/new-endpoint")
async def new_endpoint(data: RequestModel):
    result = await agent_function(data)
    return result
```

### Database Migration

```bash
cd frontend
npx prisma migrate dev --name description
npx prisma generate
```

---

## Current State & Known Issues

### Working ✅
- All 7 agent pages render correctly
- Backend API endpoints respond
- Tax calculation (KarVid) works
- FIRE planning (Yojana) works
- Stock data (Bazaar) works
- Health score (Dhan) works
- Portfolio XIRR (Niveshak) works
- Compliance (Vidhi) works
- Frontend builds successfully

### Known Issues ⚠️
- Telegram bots need token regeneration (tokens were leaked)
- Some agents may need API keys for external data
- Prisma client needs regeneration on fresh install

---

## Security Notes

### Never Commit These
- `.env` files with real tokens
- API keys
- Telegram bot tokens
- Database files with user data

### Already in .gitignore
```
.env
*.db
*.db-journal
node_modules/
.next/
__pycache__/
venv/
```

---

## Deployment

### EC2 (Current)
- **Server:** `ubuntu@3.109.186.88`
- **SSH Key:** `~/.openclaw/workspace/et-genai-key.pem`
- **Frontend:** http://3.109.186.88/ (port 80)
- **Backend:** http://3.109.186.88:8000/

### Vercel + Railway (Recommended)
- Frontend → Vercel (auto-deploys from GitHub)
- Backend → Railway or Render (Docker deployment)

---

## Contact & Context

- **Owner:** Devguru Tiwari (@Devguru-codes)
- **Email:** bt23csd060@iiitn.ac.in
- **GitHub:** https://github.com/Devguru-codes/AI-Money-Mentor

---

## Quick Reference

```bash
# Install dependencies
make install

# Start development
make dev

# Start production
make start

# Stop all services
make stop

# Check status
make status

# Run tests
make test

# Clean build artifacts
make clean

# Git push
git add -A && git commit -m "message" && git push origin main
```

---

_This file should be read by Claude/AI agents at the start of each session to understand the full project context._