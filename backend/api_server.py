"""
AI Money Mentor - FastAPI Server
Connects Telegram bots to Python modules
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import sys
import os

# Add project to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import all agent modules
from agents.niveshak.portfolio_analyzer import PortfolioAnalyzer
from agents.karvid import calculate_new_regime_tax, calculate_old_regime_tax, compare_regimes, calculate_80c_deduction, calculate_equity_ltcg
from agents.yojana.fire_calculator import FIRECalculator, calculate_fire_number_india, get_sip_recommendation
from agents.bazaar.stock_data import StockData
from agents.dhan.health_score import get_health_score
from agents.vidhi.compliance import get_disclaimers, SEBICompliance

app = FastAPI(
    title="AI Money Mentor API",
    description="Financial advisory API for Indian market",
    version="1.0.0"
)

# CORS for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class TaxRequest(BaseModel):
    income: float
    regime: str = "new"
    deductions_80c: float = 0
    deductions_80d: float = 0

class FIRERequest(BaseModel):
    monthly_expenses: float
    current_age: int = 30
    retirement_age: int = 55
    current_corpus: float = 0

class HealthRequest(BaseModel):
    income: float
    expenses: float
    monthly_savings: float = 0
    monthly_investments: float = 0
    debt: float = 0
    insurance_coverage: float = 0

class XIRRRequest(BaseModel):
    transactions: List[Dict[str, Any]]

class StockRequest(BaseModel):
    symbol: str

# Health check
@app.get("/")
async def root():
    return {
        "service": "AI Money Mentor API",
        "version": "1.0.0",
        "agents": ["niveshak", "karvid", "yojana", "bazaar", "dhan", "vidhi"]
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

# ============ NIVESHAK (MF Portfolio) ============
@app.post("/niveshak/xirr")
async def calculate_xirr(request: XIRRRequest):
    """Calculate XIRR for portfolio"""
    analyzer = PortfolioAnalyzer()
    xirr = analyzer.calculate_xirr(request.transactions)
    return {"xirr_percent": round(xirr, 2)}

@app.post("/niveshak/risk-metrics")
async def get_risk_metrics(nav_data: List[float]):
    """Get portfolio risk metrics"""
    analyzer = PortfolioAnalyzer()
    metrics = analyzer.get_risk_metrics(nav_data)
    return metrics

# ============ KARVID (Tax Wizard) ============
@app.post("/karvid/calculate-tax")
async def calculate_tax(request: TaxRequest):
    """Calculate tax under specified regime"""
    if request.regime == "new":
        result = calculate_new_regime_tax(request.income)
    else:
        result = calculate_old_regime_tax(request.income)
    
    result["regime"] = request.regime
    return result

@app.post("/karvid/compare-regimes")
async def compare_tax_regimes(income: float):
    """Compare new vs old tax regime"""
    result = compare_regimes(income)
    return result

@app.post("/karvid/80c")
async def calculate_80c(deductions: Dict[str, float]):
    """Calculate 80C deductions"""
    result = calculate_80c_deduction(**deductions)
    return result

@app.post("/karvid/capital-gains")
async def calculate_capital_gains(gain: float, holding_period: str = "long"):
    """Calculate capital gains tax"""
    if holding_period == "long":
        result = calculate_equity_ltcg(gain)
    else:
        result = {"tax": gain * 0.20, "holding_period": "short"}
    return result

# ============ YOJANAKARTA (FIRE Planner) ============
@app.post("/yojana/fire-number")
async def get_fire_number(monthly_expenses: float):
    """Calculate FIRE number"""
    result = calculate_fire_number_india(monthly_expenses)
    return result

@app.post("/yojana/sip-recommendation")
async def get_sip(target_corpus: float, years: int):
    """Get SIP recommendation"""
    result = get_sip_recommendation(target_corpus, years)
    return result

@app.post("/yojana/retirement-plan")
async def create_retirement_plan(request: FIRERequest):
    """Create retirement plan"""
    calc = FIRECalculator(
        monthly_expenses=request.monthly_expenses,
        current_age=request.current_age,
        retirement_age=request.retirement_age,
        current_corpus=request.current_corpus
    )
    plan = {
        "fire_number": calc.calculate_fire_number(),
        "years_to_fire": calc.calculate_years_to_fire(),
        "monthly_savings": calc.calculate_monthly_savings()
    }
    return plan

# ============ BAZAAR GURU (Market Research) ============
@app.post("/bazaar/stock-quote")
async def get_stock_quote(request: StockRequest):
    """Get stock quote from NSE"""
    nse = StockData()
    quote = nse.get_quote(request.symbol)
    if quote:
        return {
            "symbol": quote.symbol,
            "name": quote.name,
            "price": quote.price,
            "change": quote.change,
            "change_percent": quote.change_percent,
            "volume": quote.volume
        }
    raise HTTPException(status_code=404, detail=f"Stock {request.symbol} not found")

@app.get("/bazaar/top-gainers")
async def get_top_gainers(limit: int = 10):
    """Get top gaining stocks"""
    stock = StockData()
    gainers = stock.get_top_gainers(limit)
    return {"gainers": gainers}

@app.get("/bazaar/nifty50")
async def get_nifty50():
    """Get NIFTY 50 stocks"""
    return {"stocks": StockData.NIFTY_50}

# ============ DHAN RAKSHA (Financial Health) ============
@app.post("/dhan/health-score")
async def calculate_health_score(request: HealthRequest):
    """Calculate financial health score"""
    result = get_health_score(
        income=request.income,
        expenses=request.expenses,
        monthly_savings=request.monthly_savings,
        monthly_investments=request.monthly_investments
    )
    return result

# ============ VIDHI (Compliance) ============
@app.get("/vidhi/disclaimers")
async def get_all_disclaimers(category: str = "all"):
    """Get SEBI compliance disclaimers"""
    return {"disclaimers": get_disclaimers(category)}

@app.get("/vidhi/regulations")
async def get_sebi_regulations():
    """Get SEBI regulations"""
    return SEBICompliance.get_regulations()

# ============ DHAN SARTHI (Coordinator) ============
@app.post("/dhan-sarthi/route")
async def route_query(query: str):
    """Route query to appropriate agent"""
    from agents.dhan_sarthi.coordinator import DhanSarthiCoordinator
    coordinator = DhanSarthiCoordinator()
    result = coordinator.parse_query(query)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# ============ KARVID TAX LAW ENDPOINTS ============
@app.get("/karvid/section/{section}")
async def get_tax_section(section: str):
    """Get detailed information about a tax section"""
    from agents.karvid.indian_tax_laws import get_tax_section_info
    return get_tax_section_info(section)

@app.get("/karvid/capital-gains-info/{asset_type}")
async def get_capital_gains_info(asset_type: str):
    """Get capital gains tax information"""
    from agents.karvid.indian_tax_laws import get_capital_gains_info
    return get_capital_gains_info(asset_type)

@app.get("/karvid/tax-slabs/{regime}")
async def get_tax_slabs(regime: str):
    """Get tax slabs for a regime"""
    from agents.karvid.indian_tax_laws import get_tax_slab
    return {"slabs": get_tax_slab(regime)}

# ============ VIDHI LEGAL ENDPOINTS ============
@app.get("/vidhi/constitution/{article}")
async def get_constitution_article(article: str):
    """Get Constitution provision"""
    from agents.vidhi.legal_knowledge import get_constitution_provision
    return get_constitution_provision(article)

@app.get("/vidhi/income-tax-section/{section}")
async def get_income_tax_section(section: str):
    """Get Income Tax Act section"""
    from agents.vidhi.legal_knowledge import get_income_tax_section
    return {"section": section, "description": get_income_tax_section(section)}

@app.get("/vidhi/sebi-regulation/{name}")
async def get_sebi_regulation(name: str):
    """Get SEBI regulation details"""
    from agents.vidhi.legal_knowledge import get_sebi_regulation
    return get_sebi_regulation(name)

@app.get("/vidhi/rbi-regulation/{name}")
async def get_rbi_regulation(name: str):
    """Get RBI regulation details"""
    from agents.vidhi.legal_knowledge import get_rbi_regulation
    return get_rbi_regulation(name)

# ============ LATENCY TRACKING ============
@app.get("/latency-stats")
async def get_latency_stats():
    """Get latency statistics"""
    from agents.dhan_sarthi.coordinator import DhanSarthiCoordinator
    coordinator = DhanSarthiCoordinator()
    return coordinator.get_latency_stats()

# ============================================================
# AI CHAT ENDPOINT
# ============================================================

@app.post("/ai/chat")
async def ai_chat_endpoint(request: dict):
    """
    AI-powered chat endpoint using OpenAI GPT-4o-mini
    Falls back to calculation-based responses if AI not configured
    """
    import os
    import requests
    import json
    
    message = request.get("message", "")
    agent = request.get("agent", "dhansarthi")
    
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    
    # Agent prompts
    AGENT_PROMPTS = {
        "dhansarthi": "You are DhanSarthi, the intelligent coordinator of AI Money Mentor. Be conversational and helpful.",
        "karvid": "You are KarVid, the Tax Wizard for Indian taxes. Help users understand and calculate taxes.",
        "yojana": "You are YojanaKarta, the FIRE Planner. Help users plan financial independence and retirement.",
        "bazaar": "You are BazaarGuru, the Market Researcher. Provide stock prices and market analysis.",
        "dhan": "You are DhanRaksha, the Financial Health Expert. Assess financial health and provide recommendations.",
        "vidhi": "You are Vidhi, the Compliance Expert. Help users understand SEBI regulations and investor rights.",
    }
    
    # Try OpenAI
    if OPENAI_API_KEY:
        try:
            prompt = AGENT_PROMPTS.get(agent, AGENT_PROMPTS["dhansarthi"])
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": prompt},
                        {"role": "user", "content": message}
                    ],
                    "max_tokens": 1000,
                    "temperature": 0.7
                },
                timeout=30
            )
            response.raise_for_status()
            ai_response = response.json()["choices"][0]["message"]["content"]
            return {"agent": agent, "response": ai_response}
        except Exception as e:
            print(f"OpenAI error: {e}")
    
    # Fallback response
    return {
        "agent": agent,
        "response": f"I'm {agent.title()}, ready to help! AI responses require OPENAI_API_KEY to be configured. In the meantime, I can still help with calculations."
    }


# ============================================================
# CHAT BRIDGE ENDPOINTS - Frontend to OpenClaw Agent Swarm
# ============================================================

from chat_bridge import (
    ChatRequest, ChatResponse, 
    store_message, get_chat_history, send_to_agent,
    init_db
)
import uuid

# Initialize chat database
init_db()

@app.post("/bridge/chat", response_model=ChatResponse)
async def bridge_chat(request: ChatRequest):
    """
    Bridge frontend to OpenClaw agents with chat history
    
    - Stores user message in SQLite
    - Retrieves chat history for context
    - Sends to appropriate OpenClaw agent
    - Stores agent response
    - Returns response to frontend
    """
    # Generate session_id if not provided
    session_id = request.session_id or str(uuid.uuid4())
    
    # Store user message
    store_message(
        user_id=request.user_id,
        session_id=session_id,
        agent_id=request.agent_id,
        role="user",
        message=request.message
    )
    
    # Get chat history for context
    history = get_chat_history(
        user_id=request.user_id,
        session_id=session_id,
        limit=20
    )
    
    # Send to agent via WebSocket bridge
    try:
        response = send_to_agent(
            agent_id=request.agent_id,
            message=request.message,
            session_id=session_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    # Store agent response
    store_message(
        user_id=request.user_id,
        session_id=session_id,
        agent_id=request.agent_id,
        role="assistant",
        message=response
    )
    
    return ChatResponse(
        agent=request.agent_id,
        response=response,
        session_id=session_id,
        history_count=len(history)
    )

@app.get("/bridge/history/{user_id}/{session_id}")
async def bridge_get_history(user_id: str, session_id: str, limit: int = 50):
    """Get chat history for a user session"""
    history = get_chat_history(user_id, session_id, limit)
    return {"history": history, "count": len(history)}

@app.delete("/bridge/history/{user_id}/{session_id}")
async def bridge_clear_history(user_id: str, session_id: str):
    """Clear chat history for a session"""
    import sqlite3
    conn = sqlite3.connect(os.path.expanduser('~/ai-money-mentor/chat_history.db'))
    cursor = conn.cursor()
    cursor.execute('DELETE FROM chat_messages WHERE user_id = ? AND session_id = ?', (user_id, session_id))
    conn.commit()
    conn.close()
    return {"status": "cleared", "user_id": user_id, "session_id": session_id}

@app.get("/bridge/sessions/{user_id}")
async def bridge_list_sessions(user_id: str):
    """List all chat sessions for a user"""
    import sqlite3
    conn = sqlite3.connect(os.path.expanduser('~/ai-money-mentor/chat_history.db'))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('''
        SELECT DISTINCT session_id, agent_id, MAX(timestamp) as last_message
        FROM chat_messages WHERE user_id = ?
        GROUP BY session_id ORDER BY last_message DESC
    ''', (user_id,))
    rows = cursor.fetchall()
    conn.close()
    
    sessions = [{"session_id": r["session_id"], "agent_id": r["agent_id"], "last_message": r["last_message"]} for r in rows]
    return {"sessions": sessions}
