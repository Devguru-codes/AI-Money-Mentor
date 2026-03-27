# Architecture Document — AI Money Mentor

> **India's First Multi-Agent Personal Finance AI Platform**
> Built for Hackathon Submission · March 2026 · Devguru Tiwari, IIIT Nagpur

---

## 1. System Overview

AI Money Mentor is a **tri-layer, multi-agent architecture** designed to democratize personal financial planning for 750M+ working Indians who currently lack access to affordable financial advisors. The system is composed of 9 specialized AI agents orchestrated by a central coordinator — **DhanSarthi** — routing queries to the right domain expert, combining deterministic math engines with generative AI reasoning.

---

## 2. High-Level Architecture Diagram

> **Live Editor:** https://mermaid.live/edit#pako:eNqNVMtu2zAQ_BVCpxRQbMd5OAYCpEUPPRRFe-ihJ0aqbRGhSIGkYjuG_70kJdlW3LQHAdIud2Z3ZnekXlEtJaIE7apqX2AhqlrPQHOlrNgH5IUkEXVbqyaXWmqJiupSQOp0q8qpN91B6d7u-1pvFbQ_JHNWiGu5PxQlzJyVqimtKYgL1GvhGlRnBGO4FplbFXCi5OAFmzHBnGnl2rFiE35TBzOWx9_VgFlH2kAnGX5SBRw4lMggVoxWbJDd50c6CGlvvV6D_8qn5kL0f-JEG3q9JnLYOilSfexBGcQfW78fgEYU1tT6LlZ2qFq0TrtQ9tI1ZWN0a3MYmmVlAWQfR-F1gqW8gkbW2oqAJINf9OWaM2Yt_1P3SL-PBOiH4P7X0VV0LoVfQkAenL12H8ufD7CnELl5oHqYRa4k8Oq13Ym9_W2-03tKX7kdGrKGXHt4XFGPlSaEthSYVKVkT3ZTGP43lm-2VCkiKPLXMHiD3VX4iRQ4xltkIkQcFwKr5D3vFqFGNiYXJ-gq9kVkD6WdcbZ_qC8XRMPREn0vBi2p_VQ

```mermaid
graph TB
    User["User - Browser"]

    subgraph Frontend["Layer 1: Next.js 16 Frontend - Port 3000"]
        UI["9 Agent UIs - Auth - Dashboard - Profile"]
        BFF["BFF Proxy Layer - Next.js API Routes"]
        LocalStore["Zustand plus localStorage State"]
    end

    subgraph Backend["Layer 2: FastAPI Backend - Port 8000"]
        DS["DhanSarthi - Coordinator Agent"]

        subgraph Specialists["9 Specialist Agents"]
            KV["KarVid - Tax Wizard"]
            YK["YojanaKarta - FIRE Planner"]
            BG["BazaarGuru - Market Analyst"]
            DR["DhanRaksha - Health Scorer"]
            NV["Niveshak - Portfolio Advisor"]
            VD["Vidhi - Compliance Officer"]
            LE["Life Event Advisor"]
            CP["Couples Planner"]
        end

        MathEngines["Pure Python Math Engines<br/>Tax Slabs - XIRR - FIRE - Sharpe"]
        DB["Prisma ORM plus SQLite<br/>Users - Portfolios - Chat History"]
    end

    subgraph AILayer["Layer 3: OpenClaw Gateway - LLM Inference"]
        OC["OpenClaw - Agent Swarm Router"]
        GLM["GLM-5 Cloud API - Primary LLM"]
        Ollama["Ollama Local - Fallback"]
    end

    DataSources["External Data Sources<br/>yfinance - NSE - SEBI"]

    User <-->|"HTTPS"| UI
    UI <-->|"localStorage events"| LocalStore
    UI -->|"/api/* proxy"| BFF
    BFF <-->|"REST calls"| DS
    DS -->|"keyword scoring and routing"| Specialists
    Specialists <-->|"calculations"| MathEngines
    Specialists <-->|"read and write"| DB
    BFF <-->|"POST bridge/chat"| OC
    OC <-->|"WebSocket stream"| GLM
    OC <-->|"fallback"| Ollama
    BG <-->|"real-time quotes"| DataSources
```

---

## 3. Agent Roles & Responsibilities

| Agent | Domain | Key Tool Integrations | Mathematical Core |
|-------|--------|-----------------------|-------------------|
| **DhanSarthi** | Coordinator | Keyword scoring engine, all 8 specialist agents | 50+ keyword intent classifier with priority boosts |
| **KarVid** | Income Tax | Indian Tax Slab DB, 80C/80D/LTCG calculator | FY2025-26 slab rates, Section 87A rebate, standard deduction |
| **YojanaKarta** | FIRE Planning | SIP calculator, inflation projector | `FIRE = Annual Expenses / 0.04`, `SIP = PV[(1+r)^n - 1] / r` |
| **BazaarGuru** | Stock Market | yfinance real-time API, NSE scraper | Live Market Cap (Cr), P/E Ratio, 52-week range |
| **DhanRaksha** | Financial Health | 8-factor weighted health auditor | Emergency 15%, Savings 20%, Investment 20%, Debt 15% |
| **Niveshak** | Portfolio Analysis | Dynamic SIP matrix generator | Newton-Raphson XIRR, Sharpe Ratio `(Rp - Rf) / σp` |
| **Vidhi** | Legal Compliance | SEBI regulations DB, I-T Act sections | Regulatory lookup engine |
| **Life Event** | Life Milestones | Goal corpus projector | `FV = PV × (1+i)^n` with 10% education inflation |
| **Couple's Planner** | Joint Finance | Income splitter, 50/30/20 model | Proportional, equal and custom splitting modes |

---

## 4. Agent Communication Flow (DhanSarthi Routing)

> **Live Editor:** https://mermaid.live/edit#pako:eNqVVMtuwjAQ_BVrT0VFSSnkdaiqKlEJqYeeyiE4JqAFO7IdqEL897WTEAmHSupLL97ZmdVqsx9WKoIaVlAlquqICJJlmTLzeFGaV9dKXoiKqibE8kZpXKMkWl6JJUtyxqrJi2kVOzTseyaUWWCYkuvk96Dv0hGTnVkYFqqVmV6nqX_3N6JZjOpiUEsNXkXAoxp_DgJqIiuauFmTy8XZLxIwW51A2bJuVCIzwdZJgR4KnKD3M0T4q2K0FuBx6A9GgToQcMWAv3dlS90fWwDJZ3WtHBJhHMsGEkHSnFkPVdNqPq5nKHyLhf

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant DhanSarthi
    participant Niveshak
    participant MathEngine
    participant OpenClaw
    participant GLM5

    User->>Frontend: analyze my HDFC fund with 5000 SIP for 24 months
    Frontend->>DhanSarthi: POST /dhan-sarthi/route with query
    DhanSarthi->>DhanSarthi: Keyword scoring - portfolio and fund and SIP routes to Niveshak
    DhanSarthi-->>Frontend: primary_agent is niveshak confidence 0.91
    Frontend->>Niveshak: POST /niveshak/analyze with holdings sipAmount durationMonths
    Niveshak->>MathEngine: generate_cashflows sip=5000 months=24
    MathEngine-->>Niveshak: 24 monthly SIP transactions array
    Niveshak->>MathEngine: calculate_xirr cashflows
    MathEngine-->>Niveshak: xirr=22.4% sharpe_ratio=1.18
    Niveshak-->>Frontend: portfolio_value xirr sharpe_ratio risk_grade
    Frontend->>OpenClaw: POST /bridge/chat with context and calculation result
    OpenClaw->>GLM5: WebSocket stream with context-injected prompt
    GLM5-->>OpenClaw: Streamed AI narrative
    OpenClaw-->>Frontend: Simulated token stream
    Frontend-->>User: Rendered analysis plus AI commentary
```

---

## 5. Error Handling & Resilience Logic

> **Live Editor:** https://mermaid.live/edit#pako:eNqNVMtuwjAQ_BVrT0VFSSnkdaiqKlEJqYeeyiE4JqAFO7IdqEL897WTEAmHSupLL97ZmdVqsx9WKoIaVlAlquqICJJlmTLzeFGaV9dKXoiKqibE8kZpXKMkWl6JJUtyxqrJi2kVOzTseyaUWWCYkuvk96Dv0hGTnVkYFqqVmV6nqX

```mermaid
flowchart TD
    Request["Incoming API Request"] --> Validate["Pydantic Validation"]
    Validate -->|"Invalid payload"| E1["422: Validation Error<br/>Return field-level details"]
    Validate -->|"Valid"| Agent["Route to Specialist Agent"]
    Agent --> Math["Math Engine Calculation"]
    Math -->|"XIRR no convergence"| E2["Fallback: Return safe default<br/>XIRR = 0 percent - flag as estimated"]
    Math -->|"Success"| LLM["OpenClaw / GLM-5 Call"]
    LLM -->|"GLM-5 timeout over 30s"| E3["Retry once then Ollama fallback<br/>Return partial result with warning"]
    LLM -->|"yfinance API fails"| E4["BazaarGuru: serve 15min cached data<br/>with staleness flag in response"]
    LLM -->|"Success"| Response["200: Full JSON Response"]
    E1 --> Log["PM2 Server Log"]
    E2 --> Log
    E3 --> Log
    E4 --> Log
    Log --> Monitor["EC2 CloudWatch Alerts"]
```

### Error Handling Strategy

| Failure Mode | Detection | Recovery |
|---|---|---|
| Pydantic field missing | FastAPI validation layer | 422 + field-level error message |
| XIRR non-convergence | try/except in Newton-Raphson loop | Return 0% with `estimated: true` flag |
| OpenClaw socket closed | PM2 process watcher | Auto-restart daemon, re-pair GLM-5 token |
| yfinance rate limit | requests.exceptions catch | Serve 15-min stale cache with `stale: true` flag |
| SQLite write failure | Prisma error boundary | Log + return success (non-blocking for chat) |
| Frontend BFF offline | Next.js 503 route handler | User-facing "Service temporarily unavailable" |

---

## 6. Data Flow Architecture

> **Live Editor:** https://mermaid.live/edit#pako:eNqNVE1v2zAM_SuCThuQxE4cx0kPBYpth-2wYcMOOwzFYCiWYguRJUOSmmbof59kOYmTYBt2EiQ-8j2SUqIXVAuBaFddNfsCC1HVegaaK2XFPqAoJIiom1o1udRSSxRUlwJSp1tVTr3pFkr3dt_Xequg_SGZs0Jcy_2hKGHmrFRNaU1BXKBeCdeQOi0Yw7XIXNUAJ04OXbAZE8SZVq4dKzbhN3EwY3n8XQ2YdaQ9dILhJ1XAgUOJDGLFaMkG2X1-oAOW9tbrPdivfmouRP8nTrSh12sihy2TopUH3tQBpGH1u8HgBGFNbW-i5Wd

```mermaid
flowchart LR
    subgraph Input["User Inputs"]
        A1["Income and Deductions"]
        A2["SIP Amount and Duration"]
        A3["Stock Ticker"]
        A4["Life Event Details"]
    end

    subgraph Processing["Backend Processing"]
        B1["Tax Engine<br/>Pure Python"]
        B2["XIRR Engine<br/>Newton-Raphson"]
        B3["yfinance Socket<br/>Real-Time"]
        B4["Goal Projector<br/>FV formula"]
    end

    subgraph Storage["Persistence Layer"]
        C1["Prisma plus SQLite<br/>User Portfolio Chat"]
        C2["localStorage<br/>Form caching"]
        C3["Dashboard Sync<br/>localStorage keys"]
    end

    subgraph AIGen["AI Layer"]
        D1["OpenClaw Router"]
        D2["GLM-5 or Ollama"]
    end

    A1 --> B1 --> C1
    A2 --> B2 --> C1
    A3 --> B3
    A4 --> B4 --> C1
    B1 --> C3
    B2 --> C3
    B4 --> C3
    C3 -->|"storage events"| Dashboard["Homepage Dashboard<br/>Live Metrics"]
    B1 --> D1
    B2 --> D1
    B4 --> D1
    D1 --> D2 -->|"context-aware AI narrative"| User["User Interface"]
    A1 --> C2
    A2 --> C2
    A3 --> C2
    A4 --> C2
    C2 -->|"form rehydration"| User
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
