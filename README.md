# AI Money Mentor

> **India's First Multi-Agent Personal Finance Platform**  
> A comprehensive financial mentor combining AI agents with precise calculations.

[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-blue.svg)](https://www.prisma.io/)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)

---

## Architecture

```
ai-money-mentor/
├── frontend/                # Next.js 16 + React 19
│   ├── src/                 # React components & pages
│   │   ├── app/             # App Router pages
│   │   │   ├── agents/      # Agent pages (KarVid, Yojana, etc.)
│   │   │   └── api/         # API routes
│   │   ├── components/      # UI components (shadcn/ui)
│   │   └── lib/             # Utilities & Prisma client
│   ├── prisma/              # Database schema
│   └── package.json
│
├── backend/                 # FastAPI + Python
│   ├── agents/              # AI agents (KarVid, Yojana, etc.)
│   │   ├── karvid/          # Tax calculations
│   │   ├── yojana/          # FIRE planning
│   │   ├── bazaar/          # Stock data
│   │   ├── dhan/            # Health score
│   │   ├── niveshak/        # Portfolio analysis
│   │   └── vidhi/           # Compliance
│   ├── bots/                # Telegram bots
│   ├── api_server.py        # FastAPI server
│   └── requirements.txt
│
└── .env                     # Shared environment variables
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16, React 19 | Modern web UI |
| **Styling** | Tailwind CSS v4, shadcn/ui | Beautiful components |
| **Backend** | FastAPI, Python 3.12 | REST API |
| **Database** | Prisma, SQLite | ORM & storage |
| **AI** | OpenClaw, GLM-5 | Agent orchestration |

---

## Features

| Feature | Agent | Description |
|---------|-------|-------------|
| **Tax Wizard** | KarVid | Old vs new regime, 80C/80D deductions |
| **FIRE Planner** | YojanaKarta | FIRE number, retirement planning |
| **Market Research** | BazaarGuru | NSE/BSE stock quotes |
| **Health Score** | DhanRaksha | 8-factor financial health |
| **MF Portfolio** | Niveshak | XIRR, CAGR, portfolio analysis |
| **Compliance** | Vidhi | SEBI regulations, disclaimers |

---

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.12+
- npm or pnpm

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn api_server:app --reload --port 8000
# API at http://localhost:8000
```

### Database Setup

```bash
cd frontend
npx prisma generate
npx prisma db push
```

---

## Environment Variables

Create `.env` in root:

```env
# Database
DATABASE_URL="file:./frontend/prisma/dev.db"

# API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Telegram Bots (get from @BotFather)
DHANSARTHI_BOT_TOKEN=your_token
KARVID_BOT_TOKEN=your_token
# ... etc

# OpenAI (for AI responses)
OPENAI_API_KEY=your_key
```

---

## API Endpoints

### Frontend API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/karvid` | POST | Tax calculations |
| `/api/yojana` | POST | FIRE planning |
| `/api/bazaar` | POST | Stock quotes |
| `/api/dhan` | POST | Health score |
| `/api/dhan-sarthi` | POST | AI chat |

### Backend API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/karvid/calculate-tax` | POST | Tax calculation |
| `/yojana/fire` | POST | FIRE number |
| `/bazaar/stock-quote` | POST | Stock data |
| `/dhan/health-score` | POST | Health score |

---

## Deployment

### Vercel (Frontend)

```bash
cd frontend
vercel --prod
```

### Railway/Render (Backend)

```bash
cd backend
# Set environment variables in dashboard
# Deploy from GitHub
```

---

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── karvid/      # Tax page
│   │   │   ├── yojana/      # FIRE page
│   │   │   ├── bazaar/      # Stocks page
│   │   │   ├── dhan/        # Health page
│   │   │   ├── niveshak/    # Portfolio page
│   │   │   └── vidhi/       # Compliance page
│   │   └── api/             # API routes
│   ├── components/          # UI components
│   └── lib/                 # Utilities
├── prisma/
│   └── schema.prisma        # Database models
└── package.json

backend/
├── agents/
│   ├── karvid/              # Tax agent
│   ├── yojana/              # FIRE agent
│   ├── bazaar/              # Stock agent
│   ├── dhan/                # Health agent
│   ├── niveshak/            # Portfolio agent
│   └── vidhi/               # Compliance agent
├── api_server.py            # FastAPI app
└── requirements.txt
```

---

## License

MIT License - See [LICENSE](LICENSE)

---

## Contact

- **Author**: Devguru Tiwari
- **Email**: bt23csd060@iiitn.ac.in
- **GitHub**: [@Devguru-codes](https://github.com/Devguru-codes)

---

**Made for India's financial future**
