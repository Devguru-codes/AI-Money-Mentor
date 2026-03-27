# 🏗️ Architecture Document — AI Money Mentor

> **India's First Multi-Agent Personal Finance AI Platform**  
> Built for Hackathon Submission · March 2026 · Devguru Tiwari, IIIT Nagpur

---

## 1. System Overview

AI Money Mentor is a **tri-layer, multi-agent architecture** designed to democratize personal financial planning for 750M+ working Indians who currently lack access to affordable financial advisors. The system is composed of 9 specialized AI agents orchestrated by a central coordinator — **DhanSarthi** — routing queries to the right domain expert, combining deterministic math engines with generative AI reasoning.

---

## 2. High-Level Architecture Diagram

```mermaid
graph TB
    User["👤 User (Browser)"]

    subgraph Frontend["Layer 1 · Next.js 16 Frontend (Port 3000)"]
        UI["9 Agent UIs · Auth · Dashboard · Profile"]
        BFF["BFF Proxy Layer (Next.js API Routes)"]
        LocalStore["Zustand + localStorage State"]
    end

    subgraph Backend["Layer 2 · FastAPI Backend (Port 8000)"]
        DS["🧠 DhanSarthi\nCoordinator Agent"]

        subgraph Specialists["9 Specialist Agents"]
            KV["🧾 KarVid\nTax Wizard"]
            YK["🎯 YojanaKarta\nFIRE Planner"]
            BG["📈 BazaarGuru\nMarket Analyst"]
            DR["💪 DhanRaksha\nHealth Scorer"]
            NV["📊 Niveshak\nPortfolio Advisor"]
            VD["⚖️ Vidhi\nCompliance Officer"]
            LE["🎉 Life Event\nAdvisor"]
            CP["💑 Couple's\nPlanner"]
        end

        MathEngines["🔢 Pure Python Math Engines\n(Tax Slabs · XIRR · FIRE · Sharpe)"]
        DB["🗄️ Prisma ORM + SQLite\n(Users · Portfolios · Chat History)"]
    end

    subgraph AI["Layer 3 · OpenClaw Gateway (LLM Inference)"]
        OC["⚡ OpenClaw\nAgent Swarm Router"]
        GLM["🤖 GLM-5 Cloud API\n(LLM Inference)"]
        Ollama["🦙 Ollama Local\n(Fallback)"]
    end

    DataSources["📡 External Data\n(yfinance · NSE · SEBI)"]

    User <-->|"HTTPS"| UI
    UI <-->|"localStorage\nevents"| LocalStore
    UI -->|"/api/* proxy"| BFF
    BFF <-->|"REST calls"| DS
    DS -->|"keyword scoring\nintent routing"| Specialists
    Specialists <-->|"calculations"| MathEngines
    Specialists <-->|"read/write"| DB
    BFF <-->|"POST /bridge/chat"| OC
    OC <-->|"WebSocket"| GLM
    OC <-->|"fallback"| Ollama
    BG <-->|"real-time quotes"| DataSources
```

---

## 3. Agent Roles & Responsibilities

| Agent | Domain | Key Tool Integrations | Mathematical Core |
|-------|--------|-----------------------|-------------------|
| **DhanSarthi** | Coordinator | Keyword scoring engine, all 8 specialist agents | 50+ keyword intent classifier with priority boosts |
| **KarVid** | Income Tax | Indian Tax Slab DB, 80C/80D/LTCG calculator | FY2025-26 slab rates, Section 87A rebate, standard deduction |
| **YojanaKarta** | FIRE Planning | SIP calculator, inflation projector | `FIRE = Annual Expenses / 0.04`, `SIP = PV[(1+r)^n – 1] / r` |
| **BazaarGuru** | Stock Market | yfinance real-time API, NSE scraper | Live Market Cap (Cr), P/E Ratio, 52-week range |
| **DhanRaksha** | Financial Health | 8-factor weighted health auditor | Emergency 15%, Savings 20%, Investment 20%, Debt 15%… |
| **Niveshak** | Portfolio Analysis | Dynamic SIP matrix generator | Newton-Raphson XIRR, Sharpe Ratio `(Rp - Rf) / σp` |
| **Vidhi** | Legal Compliance | SEBI regulations DB, I-T Act sections | Regulatory lookup engine |
| **Life Event** | Life Milestones | Goal corpus projector | `FV = PV × (1+i)^n` with 10% education inflation |
| **Couple's Planner** | Joint Finance | Income splitter, 50/30/20 model | Proportional + equal + custom splitting modes |

---

## 4. Agent Communication Flow (DhanSarthi Routing)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant DhanSarthi
    participant SpecialistAgent
    participant MathEngine
    participant OpenClaw
    participant GLM5

    User->>Frontend: "analyze my HDFC fund with ₹5000 SIP for 24 months"
    Frontend->>DhanSarthi: POST /dhan-sarthi/route {query}
    DhanSarthi->>DhanSarthi: Keyword scoring (portfolio, fund, SIP → Niveshak)
    DhanSarthi-->>Frontend: {primary_agent: "niveshak", confidence: 0.91}
    Frontend->>SpecialistAgent: POST /niveshak/analyze {holdings, sipAmount, durationMonths}
    SpecialistAgent->>MathEngine: generate_cashflows(sip=5000, months=24)
    MathEngine-->>SpecialistAgent: [{date, amount}...] (24 monthly SIP transactions)
    SpecialistAgent->>MathEngine: calculate_xirr(cashflows)
    MathEngine-->>SpecialistAgent: {xirr: 22.4%, sharpe_ratio: 1.18}
    SpecialistAgent-->>Frontend: {portfolio_value, xirr, sharpe_ratio, risk_grade}
    Frontend->>OpenClaw: POST /bridge/chat {context + calculation result}
    OpenClaw->>GLM5: WebSocket stream (context-injected prompt)
    GLM5-->>OpenClaw: Streamed AI narrative
    OpenClaw-->>Frontend: Simulated token stream
    Frontend-->>User: Rendered analysis + AI commentary
```

---

## 5. Error Handling & Resilience Logic

```mermaid
flowchart TD
    Request["Incoming API Request"] --> Validate["Pydantic Validation"]
    Validate -->|"Invalid"| E1["422: Validation Error\nReturn field-level details"]
    Validate -->|"Valid"| Agent["Route to Specialist Agent"]
    Agent --> Math["Math Engine Calculation"]
    Math -->|"Domain Error\neg. XIRR no convergence"| E2["Fallback: Return safe default\neg. XIRR = 0%, flag as estimated"]
    Math -->|"Success"| LLM["OpenClaw / GLM-5 Call"]
    LLM -->|"GLM-5 Timeout > 30s"| E3["Retry once → Ollama fallback\nReturn partial result"]
    LLM -->|"yfinance API fails"| E4["BazaarGuru: cached 15min\ndata with staleness flag"]
    LLM -->|"Success"| Response["200: Full JSON Response"]
    E1 --> Log["PM2 / Server Log"]
    E2 --> Log
    E3 --> Log
    E4 --> Log
    Log --> Monitor["EC2 CloudWatch Alerts"]
```

### Error Handling Strategy Summary

| Failure Mode | Detection | Recovery |
|---|---|---|
| Pydantic field missing | FastAPI validation layer | 422 + field-level error message |
| XIRR non-convergence | `try/except` in Newton-Raphson loop | Return 0% with `estimated: true` flag |
| OpenClaw socket closed | PM2 process watcher | Auto-restart daemon, re-pair GLM-5 token |
| yfinance rate limit/failure | `requests.exceptions` catch | Serve 15-min stale cache with `stale: true` flag |
| SQLite write failure | Prisma error boundary | Log + return success (non-blocking for chat) |
| Frontend BFF offline | Next.js 503 route handler | User-facing "Service temporarily unavailable" |

---

## 6. Data Flow Architecture

```mermaid
flowchart LR
    subgraph Input["User Inputs"]
        A1["Income & Deductions"]
        A2["SIP Amount + Duration"]
        A3["Stock Ticker"]
        A4["Life Event Details"]
    end

    subgraph Processing["Backend Processing"]
        B1["Tax Engine\n(Pure Python)"]
        B2["XIRR Engine\n(Newton-Raphson)"]
        B3["yfinance Socket\n(Real-Time)"]
        B4["Goal Projector\n(FV formula)"]
    end

    subgraph Storage["Persistence Layer"]
        C1["Prisma + SQLite\n(User, Portfolio, Chat)"]
        C2["localStorage\n(Form caching)"]
        C3["Dashboard Sync\nlocalStorage keys"]
    end

    subgraph AI["AI Layer"]
        D1["OpenClaw Router"]
        D2["GLM-5 / Ollama"]
    end

    A1 --> B1 --> C1
    A2 --> B2 --> C1
    A3 --> B3
    A4 --> B4 --> C1
    B1 & B2 & B3 & B4 --> C3
    C3 -->|"storage events"| Dashboard["Homepage Dashboard\n(Live Metrics)"]
    B1 & B2 & B4 --> D1 --> D2 -->|"context-aware\nAI narrative"| User["User Interface"]
    A1 & A2 & A3 & A4 --> C2 -->|"form rehydration"| User
```

---

## 7. Tech Stack Summary

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Frontend | Next.js + React | 16.2 / 19 | App Router, SSR, BFF proxy |
| Styling | Tailwind CSS + shadcn/ui | v4 | Responsive, accessible UI |
| State | Zustand + useLocalStorage | 5.x | Persistent form caching + global state |
| Backend | FastAPI + Python | 0.135 / 3.12 | 25+ REST endpoints, math engines |
| ORM | Prisma + SQLite | 5.22 | User profiles, chat, portfolios |
| AI Orchestration | OpenClaw | 2026.3 | Multi-agent swarm coordination |
| LLM | GLM-5 Cloud / Ollama | — | Language reasoning, narrative generation |
| Market Data | yfinance | latest | Real-time Indian stock market data |
| Deployment | AWS EC2 + PM2 | t2.medium | Production server, process management |
| CI/CD | GitHub Actions | — | Automated PyTest + Jest on every PR |

---

*Architecture Document — AI Money Mentor v2.2 — March 28, 2026*
