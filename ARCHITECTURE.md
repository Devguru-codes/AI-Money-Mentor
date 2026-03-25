# AI Money Mentor - Architecture Documentation

## Overview

AI Money Mentor is a personal finance platform for Indian investors, combining AI-powered advice with precise calculation tools. It uses a hybrid architecture where AI agents handle understanding and explanation, while Python scripts handle calculations.

---

## System Architecture

```
+-----------------------------------------------------------------------------+
|                              USER INTERFACES                                |
+-----------------------------------------------------------------------------+
|                                                                             |
|  +---------------------+    +---------------------+    +-----------------+ |
|  |   Streamlit Web     |    |   Telegram Bots     |    |   Future:       | |
|  |   (Port 8501)       |    |   (7 Bot Accounts)  |    |   Mobile App    | |
|  +---------------------+    +---------------------+    +-----------------+ |
|            |                         │                            |        |
+------------+-------------------------+----------------------------+--------+
             |                         |                            |
             v                         v                            v
+-----------------------------------------------------------------------------+
|                           CHAT BRIDGE API                                   |
|                           (FastAPI, Port 8000)                              |
+-----------------------------------------------------------------------------+
|                                                                             |
|  +---------------------------------------------------------------------+   |
|  |  /bridge/chat                                                        |   |
|  |  - Receives: message, user_id, session_id, agent_id                 |   |
|  |  - Stores: SQLite chat history                                       |   |
|  |  - Routes: OpenClaw CLI                                              |   |
|  +---------------------------------------------------------------------+   |
|                                                                             |
|  +---------------------------------------------------------------------+   |
|  |  Direct Calculator Endpoints                                        |   |
|  |  - POST /karvid/calculate-tax                                       |   |
|  |  - POST /yojana/fire                                                |   |
|  |  - POST /bazaar/stock-quote                                         |   |
|  |  - POST /dhan/health-score                                          |   |
|  +---------------------------------------------------------------------+   |
|                                                                             |
+-----------------------------------------------------------------------------+
             |
             | HTTP / subprocess
             v
+-----------------------------------------------------------------------------+
|                        OPENCLAW GATEWAY (Port 18789)                        |
|                        AI Agent Orchestrator                                |
+-----------------------------------------------------------------------------+
|                                                                             |
|  +---------------------------------------------------------------------+   |
|  |  dhan-sarthi (Coordinator)                                          |   |
|  |  - Routes queries to appropriate agent                              |   |
|  |  - Handles multi-agent queries                                      |   |
|  |  - Telegram: @etgenaidhansarthibot                                  |   |
|  +---------------------------------------------------------------------+   |
|                                                                             |
|  +---------------+  +---------------+  +---------------+  +-------------+  |
|  | karvid        |  | yojana        |  | bazaar        |  | dhan        |  |
|  | (Tax)         |  | (FIRE)        |  | (Stocks)      |  | (Health)    |  |
|  | @karvidbot    |  | @yojanabot    |  | @bazaarbot    |  | @dhanbot    |  |
|  +---------------+  +---------------+  +---------------+  +-------------+  |
|                                                                             |
|  +---------------+  +---------------+                                       |
|  | niveshak      |  | vidhi         |                                       |
|  | (Portfolio)   |  | (Compliance)  |                                       |
|  | @niveshakbot |  | @vidhibot      |                                       |
|  +---------------+  +---------------+                                       |
|                                                                             |
|  Each agent has:                                                           |
|  - SKILL.md: Instructions for using Python tools                           |
|  - AGENTS.md: Agent personality and capabilities                           |
|  - sessions/: Chat history storage                                        |                                                                             |
+-----------------------------------------------------------------------------+
             |
             | Reads SKILL.md -> Uses exec() tool
             v
+-----------------------------------------------------------------------------+
|                        PYTHON CALCULATION SCRIPTS                           |
|                        (agents/*/scripts/)                                  |
+-----------------------------------------------------------------------------+
|                                                                             |
|  +---------------------------------------------------------------------+   |
|  |  agents/karvid/tax_calculator.py                                    |   |
|  |  - Indian tax regimes (old/new)                                     |   |
|  |  - Deductions (80C, 80D, 80CCD)                                     |   |
|  |  - Capital gains                                                    |   |
|  |  - Returns: JSON with tax breakdown                                 |   |
|  +---------------------------------------------------------------------+   |
|                                                                             |
|  +---------------------------------------------------------------------+   |
|  |  agents/yojana/fire_calculator.py                                   |   |
|  |  - FIRE number calculation                                          |   |
|  |  - Inflation-adjusted corpus                                        |   |
|  |  - SIP recommendations                                              |   |
|  |  - Returns: JSON with FIRE plan                                    |   |
|  +---------------------------------------------------------------------+   |
|                                                                             |
|  +---------------------------------------------------------------------+   |
|  |  agents/bazaar/stock_data.py                                        |   |
|  |  - NSE/BSE stock quotes                                             |   |
|  |  - Mock data fallback                                               |   |
|  |  - Returns: JSON with stock data                                    |   |
|  +---------------------------------------------------------------------+   |
|                                                                             |
|  +---------------------------------------------------------------------+   |
|  |  agents/dhan/health_score.py                                        |   |
|  |  - Financial health score (0-100)                                   |   |
|  |  - Savings rate, emergency fund                                     |   |
|  |  - Debt-to-income ratio                                             |   |
|  |  - Returns: JSON with score breakdown                               |   |
|  +---------------------------------------------------------------------+   |
|                                                                             |
|  +---------------------------------------------------------------------+   |
|  |  agents/niveshak/cas_parser.py + portfolio_analyzer.py              |   |
|  |  - CAS statement parsing                                             |   |
|  |  - XIRR calculation                                                 |   |
|  |  - Portfolio analysis                                               |   |
|  +---------------------------------------------------------------------+   |
|                                                                             |
|  +---------------------------------------------------------------------+   |
|  |  agents/vidhi/compliance.py                                         |   |
|  |  - SEBI compliance checks                                           |   |
|  |  - Legal disclaimers                                                |   |
|  +---------------------------------------------------------------------+   |
|                                                                             |
+-----------------------------------------------------------------------------+
```

---

## UI Structure (All Pages)

Each Streamlit page follows this pattern:

```
+-----------------------------------------+
|  PAGE HEADER                            |
+-----------------------------------------+
|                                         |
|  AI CHAT SECTION (Always Visible)       |
|  - st.chat_input()                      |
|  - Connects to /bridge/chat             |
|                                         |
+-----------------------------------------+
|                                         |
|  CALCULATOR SECTION                      |
|  - Number inputs                         |
|  - Calculate button                      |
|  - Results display                       |
|                                         |
+-----------------------------------------+
|                                         |
|  AI EXPLANATION (After Calculation)      |
|  - Quick action buttons                  |
|  - Custom question input                 |
|                                         |
+-----------------------------------------+
```

---

## Data Flow

### 1. Streamlit Chat Flow (AI-First)

```
User types: "Calculate tax for 20 lakhs"
     |
     v
Streamlit (st.chat_input)
     |
     | requests.post("http://127.0.0.1:8000/bridge/chat", json={message, agent_id})
     v
Chat Bridge API
     |
     | subprocess.run(['openclaw', 'agent', '--agent', 'dhan-sarthi', '--message', '...'])
     v
OpenClaw Gateway
     |
     | Routes to appropriate agent (dhan-sarthi -> karvid)
     v
KarVid Agent
     |
     | Reads SKILL.md: "Use exec to run tax_calculator.py"
     | Extracts: income=2000000, regime="both"
     | Runs: python3 -c "from tax_calculator import..."
     v
tax_calculator.py
     |
     | Returns JSON: {new_regime: {...}, old_regime: {...}}
     v
KarVid Agent
     |
     | Formats response with markdown tables
     | Adds context, disclaimers
     v
User sees: "Your tax is Rs.2.78L (13.91% effective rate)"
```

---

## Project Structure

```
~/ai-money-mentor/
|-- app.py                      # Streamlit main app
|-- api_server.py               # FastAPI server (chat bridge + endpoints)
|-- chat_bridge.py              # Chat bridge module
|-- chat_history.db             # SQLite chat history
|-- requirements.txt            # Python dependencies
|-- ARCHITECTURE.md             # This file
|-- IMPLEMENTATION.md           # Implementation status
|-- README.md                   # Project overview
|
|-- ui/                         # Streamlit UI pages
|   |-- fire_ui.py              # FIRE Planner (chat + calculator)
|   |-- tax_ui.py               # Tax Wizard (chat + calculator)
|   |-- health_ui.py            # Financial Health (chat + calculator)
|   |-- market_ui.py            # Market Research (chat + stock lookup)
|   |-- niveshak_ui.py           # MF Portfolio (chat + demo data)
|   |-- vidhi_ui.py              # Compliance (chat + disclaimers)
|
|-- agents/                     # Python calculation agents
|   |-- karvid/                 # Tax Calculator
|   |   |-- __init__.py
|   |   |-- tax_calculator.py   # Main calculation logic
|   |   |-- indian_tax_laws.py   # Tax slabs and rules
|   |
|   |-- yojana/                 # FIRE Planner
|   |   |-- __init__.py
|   |   |-- fire_calculator.py  # FIRE number calculation
|   |
|   |-- bazaar/                 # Market Research
|   |   |-- __init__.py
|   |   |-- stock_data.py       # Stock quotes (NSE/BSE)
|   |
|   |-- dhan/                   # Financial Health
|   |   |-- __init__.py
|   |   |-- health_score.py     # Health score calculator
|   |
|   |-- niveshak/               # Portfolio Analyzer
|   |   |-- __init__.py
|   |   |-- cas_parser.py       # CAS statement parsing
|   |   |-- portfolio_analyzer.py
|   |
|   |-- dhan_sarthi/            # Coordinator
|   |   |-- __init__.py
|   |   |-- coordinator.py      # Routing logic
|   |   |-- ai_responder.py     # AI response handling
|   |
|   |-- vidhi/                  # Compliance
|       |-- __init__.py
|       |-- compliance.py
|
|-- bots/                       # Telegram bot handlers
    |-- telegram_bot.py
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Streamlit | Web UI with chat widgets |
| Backend API | FastAPI | REST endpoints + Chat bridge |
| AI Agents | OpenClaw + GLM-5 | Natural language understanding |
| Calculations | Python | Tax, FIRE, Stock, Health |
| Database | SQLite | Chat history persistence |
| Messaging | Telegram Bot API | Alternative interface |
| Model | GLM-5 Cloud (via Ollama) | 203k context, Indian finance |

---

## API Endpoints

### Chat Bridge

```
POST /bridge/chat
{
  "message": "Calculate tax for 20 lakhs",
  "user_id": "user123",
  "session_id": "session456",
  "agent_id": "dhan-sarthi"
}

Response:
{
  "agent": "dhan-sarthi",
  "response": "## Tax: Rs.20 Lakhs...",
  "session_id": "session456",
  "history_count": 5
}
```

### Direct Calculator Endpoints

```
POST /karvid/calculate-tax
{
  "income": 2000000,
  "regime": "both",
  "age": 30
}

POST /yojana/fire
{
  "monthly_expenses": 50000,
  "current_age": 30,
  "retirement_age": 50
}

POST /bazaar/stock-quote
{
  "symbol": "RELIANCE"
}

POST /dhan/health-score
{
  "monthly_income": 100000,
  "monthly_expenses": 60000,
  "monthly_investments": 20000,
  "emergency_fund": 200000,
  "total_debt": 500000
}
```

---

## Agent Responsibilities

| Agent | Role | Skills | Routes To |
|-------|------|--------|-----------|
| **dhan-sarthi** | Coordinator | Query routing, multi-agent | karvid, yojana, bazaar, dhan, niveshak, vidhi |
| **karvid** | Tax Wizard | Income tax, deductions, capital gains | tax_calculator.py |
| **yojana** | FIRE Planner | Retirement, SIP, corpus | fire_calculator.py |
| **bazaar** | Market Research | Stocks, NSE/BSE | stock_data.py |
| **dhan** | Financial Health | Health score, savings | health_score.py |
| **niveshak** | Portfolio | MF analysis, XIRR | portfolio_analyzer.py |
| **vidhi** | Compliance | SEBI rules, disclaimers | compliance.py |

---

## Deployment

### Development

```bash
# Start API server
cd ~/ai-money-mentor
source venv/bin/activate
python3 -m uvicorn api_server:app --host 0.0.0.0 --port 8000

# Start Streamlit
streamlit run app.py --server.address 0.0.0.0 --server.port 8501

# OpenClaw Gateway (runs as daemon)
openclaw gateway start
```

### Production (EC2)

- API Server: Port 8000
- Streamlit: Port 8501
- OpenClaw Gateway: Port 18789

---

## URLs

| Service | URL |
|---------|-----|
| Streamlit UI | http://3.109.186.88:8501/ |
| API Health | http://3.109.186.88:8000/health |
| GitHub | https://github.com/Devguru-codes/AI-Money-Mentor |

---

*Last Updated: March 25, 2026*
