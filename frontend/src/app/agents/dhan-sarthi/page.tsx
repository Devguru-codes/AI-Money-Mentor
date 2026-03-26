"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Brain } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  agent?: string
  timestamp: Date
}

const agentNames: Record<string, string> = {
  niveshak: "Niveshak",
  karvid: "KarVid",
  yojana: "YojanaKarta",
  bazaar: "BazaarGuru",
  dhan: "DhanRaksha",
  vidhi: "Vidhi",
  "life-event": "Life Event Advisor",
  "couple-planner": "Couple's Planner",
  "dhan-sarthi": "DhanSarthi",
}

// Extract numbers from user query
function extractNumber(query: string): number | null {
  const lowerQuery = query.toLowerCase()
  
  // Match patterns like "15 lakhs", "50K", "1.5 crore", "500000"
  const patterns = [
    { regex: /(\d+(?:\.\d+)?)\s*(?:lakh|l|lac|lacs)/i, multiplier: 100000 },
    { regex: /(\d+(?:\.\d+)?)\s*(?:crore|cr)/i, multiplier: 10000000 },
    { regex: /(\d+(?:\.\d+)?)\s*(?:thousand|k)\b/i, multiplier: 1000 },
    { regex: /(\d{5,})/ , multiplier: 1 }, // Plain number >= 5 digits
    { regex: /(\d+(?:\.\d+)?)(?=\s|$)/ , multiplier: 1 }, // Any number
  ]
  
  for (const { regex, multiplier } of patterns) {
    const match = query.match(regex)
    if (match) {
      return Math.round(parseFloat(match[1]) * multiplier)
    }
  }
  return null
}

// Parse markdown-style bold to JSX
function parseMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-purple-300">{part.slice(2, -2)}</strong>
    }
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br/>}
      </span>
    ))
  })
}

// Informational responses (no calculation needed)
const informationalResponses: Record<string, Record<string, string>> = {
  yojana: {
    fire: `YojanaKarta - FIRE Movement Explained

**What is FIRE?**
FIRE = Financial Independence, Retire Early

It's a movement where you save aggressively (50%+ of income) to retire decades earlier than traditional retirement age.

**The Math:**
- Save 25x your annual expenses
- Withdraw 4% yearly (the 4% rule)
- Your money lasts forever (theoretically)

**Example:**
- Annual expenses: ₹6,00,000 (₹50K/month)
- FIRE Number: ₹6,00,000 × 25 = ₹1.5 Crores
- At 4% withdrawal: ₹50,000/month passive income

**Types of FIRE:**
- **Lean FIRE** - Minimal lifestyle (₹75L-₹1Cr)
- **Classic FIRE** - Normal lifestyle (₹1.5-2Cr)
- **Fat FIRE** - Luxurious lifestyle (₹3Cr+)

**How to achieve it:**
1. Calculate your FIRE number
2. Start SIPs early (power of compounding!)
3. Increase investments by 10% yearly
4. Diversify: Equity (60%), Debt (30%), Gold (10%)

**Want me to calculate your FIRE number?** Tell me your monthly expenses!`,

    plan: `YojanaKarta - FIRE Planning Strategy

**Step 1: Calculate Your FIRE Number**
Annual Expenses × 25 = FIRE Corpus
Example: ₹50K/month = ₹6L/year = ₹1.5 Cr FIRE number

**Step 2: Choose Your Timeline**
- Aggressive (10 years): Save 70% of income
- Moderate (15 years): Save 50% of income
- Relaxed (20 years): Save 30% of income

**Step 3: Asset Allocation**
- Age 20-30: 80% Equity, 20% Debt
- Age 30-40: 70% Equity, 30% Debt
- Age 40-50: 60% Equity, 40% Debt

**Step 4: Investment Vehicles**
- NPS (National Pension Scheme) - Tax benefits
- PPF (Public Provident Fund) - Safe, tax-free
- Mutual Funds (SIPs) - Growth potential
- Fixed Deposits - Capital protection

**Step 5: Track Progress**
- Review quarterly
- Rebalance yearly
- Adjust for life changes

**Ready to start?** Tell me your monthly expenses and I'll calculate your personalized FIRE number!`,

    what: `YojanaKarta - What is FIRE?

**FIRE = Financial Independence, Retire Early**

A movement where you:
1. Save 50%+ of your income
2. Invest aggressively
3. Retire in 10-15 years instead of 40

**The Formula:**
FIRE Number = Annual Expenses × 25

**Why it works:**
- Compound interest over decades
- 4% safe withdrawal rate
- Passive income from investments

**Example:**
If you spend ₹50,000/month (₹6L/year):
- You need ₹1.5 Crores
- At 4% returns, that's ₹50,000/month forever
- You're financially free!

**Want your FIRE number?** Just tell me your monthly expenses!`
  },
  
  karvid: {
    tax: `KarVid - Indian Tax System Explained

**Two Tax Regimes:**
1. **Old Regime** - More deductions, higher rates
2. **New Regime** - Lower rates, fewer deductions

**Old Regime Deductions:**
- 80C: ₹1.5L (PPF, ELSS, Insurance)
- 80D: ₹25K-100K (Health Insurance)
- HRA: House Rent Allowance
- LTA: Leave Travel Allowance

**New Regime Benefits:**
- Lower tax rates
- ₹75K standard deduction
- Simpler filing

**Which is better?**
- Income < ₹7L: New regime (zero tax with rebate)
- Income ₹7-15L: Compare both
- Income > ₹15L: Old regime with deductions may save more

**Want me to calculate?** Tell me your income (e.g., "Calculate tax for 15 lakhs")`,

    regime: `KarVid - Old vs New Tax Regime

**New Regime (FY 2024-25):**
| Income | Tax Rate |
|--------|----------|
| 0-3L | 0% |
| 3-7L | 5% |
| 7-10L | 10% |
| 10-12L | 15% |
| 12-15L | 20% |
| 15L+ | 30% |

**Old Regime:**
| Income | Tax Rate |
|--------|----------|
| 0-2.5L | 0% |
| 2.5-5L | 5% |
| 5-10L | 20% |
| 10L+ | 30% |

**Key Differences:**
- New: Lower rates, no deductions
- Old: Higher rates, many deductions

**Which saves more?**
- New regime: If you don't have deductions
- Old regime: If you have 80C, 80D, HRA, etc.

**Want a comparison?** Tell me your income!`
  },

  bazaar: {
    stock: `BazaarGuru - Stock Market Basics

**What are Stocks?**
Stocks represent ownership in a company. When you buy a stock, you own a tiny piece of that company.

**How to Invest:**
1. Open a Demat account (Zerodha, Groww, etc.)
2. Link your bank account
3. Research companies
4. Buy stocks via the app

**Key Terms:**
- **Price**: Current market price per share
- **Market Cap**: Total value of company
- **P/E Ratio**: Price to earnings (lower = cheaper)
- **Volume**: Number of shares traded today

**Nifty 50 Stocks:**
RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, etc.

**⚠️ SEBI Disclaimer:**
This is educational only. Not investment advice. Consult a SEBI-registered advisor.

**Want a stock price?** Just ask! (e.g., "RELIANCE stock price")`
  }
}

// Detect informational queries
function isInformational(query: string, agent: string): { isInfo: boolean; key: string } {
  const lowerQuery = query.toLowerCase()
  
  // FIRE-related informational
  if (agent === 'yojana') {
    if (lowerQuery.includes('what is fire') || lowerQuery === 'fire' || lowerQuery === 'what is fire?') {
      return { isInfo: true, key: 'fire' }
    }
    if (lowerQuery.includes('how') && lowerQuery.includes('plan')) {
      return { isInfo: true, key: 'plan' }
    }
    if (lowerQuery.includes('explain') || lowerQuery === 'explain fire') {
      return { isInfo: true, key: 'fire' }
    }
  }
  
  // Tax-related informational
  if (agent === 'karvid') {
    if (lowerQuery.includes('what is tax') || lowerQuery.includes('explain tax') || lowerQuery === 'tax') {
      return { isInfo: true, key: 'tax' }
    }
    if (lowerQuery.includes('regime') || lowerQuery.includes('old vs new')) {
      return { isInfo: true, key: 'regime' }
    }
  }
  
  // Stock-related informational
  if (agent === 'bazaar') {
    if (lowerQuery.includes('what is stock') || lowerQuery.includes('explain stock') || lowerQuery === 'stock') {
      return { isInfo: true, key: 'stock' }
    }
  }
  
  return { isInfo: false, key: '' }
}

export default function DhanSarthiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am DhanSarthi, your AI financial coordinator.\n\nI can help you with:\n• Tax calculations - \"Calculate tax for 15 lakhs\"\n• FIRE planning - \"What is FIRE?\" or \"My expenses are 50K\"\n• Stock prices - \"RELIANCE stock price\"\n• Financial health - \"What is my health score?\"\n\nWhat would you like to know?",
      agent: "coordinator",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking")
  const [lastAskedFor, setLastAskedFor] = useState<string | null>(null) // Track what we asked for
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    fetch("/api/dhan-sarthi")
      .then((res) => {
        if (res.ok) setBackendStatus("online")
        else setBackendStatus("offline")
      })
      .catch(() => setBackendStatus("offline"))
  }, [])

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) return
        const userData = JSON.parse(storedUser)
        if (!userData.id) return
        const res = await fetch(`/api/save/chat?userId=${userData.id}&limit=50`)
        if (res.ok) {
          const data = await res.json()
          if (data.messages && data.messages.length > 0) {
            const loaded: Message[] = data.messages.map((m: any) => ({
              id: m.id,
              role: 'user' as const,
              content: m.query,
              timestamp: new Date(m.createdAt),
            })).flatMap((m: Message) => {
              const original = data.messages.find((d: any) => d.id === m.id)
              return [
                m,
                {
                  id: m.id + '-resp',
                  role: 'assistant' as const,
                  content: original?.response || '',
                  agent: original?.agentType || 'dhan-sarthi',
                  timestamp: new Date(original?.createdAt || Date.now()),
                }
              ]
            })
            if (loaded.length > 0) {
              setMessages(prev => [...prev, ...loaded])
            }
          }
        }
      } catch (e) {
        console.log('Could not load chat history:', e)
      }
    }
    loadHistory()
  }, [])

  // Helper to save chat to DB
  const saveChat = useCallback(async (query: string, response: string, agentType: string) => {
    try {
      const storedUser = localStorage.getItem('user')
      if (!storedUser) return
      const userData = JSON.parse(storedUser)
      if (!userData.id) return
      await fetch('/api/save/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.id, agentType, query, response }),
      })
    } catch (e) {
      console.log('Could not save chat:', e)
    }
  }, [])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    
    const query = input.trim()
    setInput("")
    setLoading(true)

    try {
      let routedAgent = "niveshak"
      let agentData: any = null
      
      // Check if user is responding to a previous question
      if (lastAskedFor === "expenses") {
        const expenses = extractNumber(query)
        if (expenses) {
          // User provided expenses for FIRE
          const response = await fetch("/api/yojana", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ monthly_expenses: expenses }),
          })
          if (response.ok) {
            agentData = await response.json()
            routedAgent = "yojana"
          }
          setLastAskedFor(null)
        }
      } else if (lastAskedFor === "income") {
        const income = extractNumber(query)
        if (income) {
          const response = await fetch("/api/karvid", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ income }),
          })
          if (response.ok) {
            agentData = await response.json()
            routedAgent = "karvid"
          }
          setLastAskedFor(null)
        }
      } else {
        // Step 1: Route the query
        try {
          const routeResponse = await fetch("/api/dhan-sarthi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          })
          if (routeResponse.ok) {
            const routeData = await routeResponse.json()
            routedAgent = routeData.primary_agent || "niveshak"
            
            // Bug 6 fix: Handle DhanSarthi greeting/help/thanks responses directly
            if (routedAgent === "dhan-sarthi" && routeData.response) {
              const greetingMsg = routeData.response
              setMessages((prev) => [...prev, { 
                id: String(Date.now() + 1), 
                role: "assistant", 
                content: greetingMsg, 
                agent: "dhan-sarthi", 
                timestamp: new Date() 
              }])
              saveChat(query, greetingMsg, "dhan-sarthi")
              setLoading(false)
              return
            }
          }
        } catch (e) {
          // Fallback routing
          const lowerQuery = query.toLowerCase()
          if (lowerQuery.includes("tax") || lowerQuery.includes("80c") || lowerQuery.includes("regime")) routedAgent = "karvid"
          else if (lowerQuery.includes("fire") || lowerQuery.includes("retire") || lowerQuery.includes("corpus")) routedAgent = "yojana"
          else if (lowerQuery.includes("stock") || lowerQuery.includes("share") || lowerQuery.includes("price")) routedAgent = "bazaar"
          else if (lowerQuery.includes("health") || lowerQuery.includes("score")) routedAgent = "dhan"
        }

        // Step 2: Check if informational query
        const infoCheck = isInformational(query, routedAgent)
        if (infoCheck.isInfo && informationalResponses[routedAgent]?.[infoCheck.key]) {
          const response = informationalResponses[routedAgent][infoCheck.key]
          setMessages((prev) => [...prev, { 
            id: String(Date.now() + 1), 
            role: "assistant", 
            content: response, 
            agent: routedAgent, 
            timestamp: new Date() 
          }])
          saveChat(query, response, routedAgent)
          setLoading(false)
          return
        }

        // Step 3: Call agent API for calculations
        try {
          let agentResponse: Response
          let askForInfo = false
          let missingInfo = ""
          
          switch (routedAgent) {
            case "karvid": {
              const income = extractNumber(query)
              if (!income) {
                askForInfo = true
                missingInfo = "income"
              } else {
                agentResponse = await fetch("/api/karvid", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ income }),
                })
                if (agentResponse.ok) agentData = await agentResponse.json()
              }
              break
            }
            case "yojana": {
              const expenses = extractNumber(query)
              if (!expenses) {
                askForInfo = true
                missingInfo = "expenses"
              } else {
                agentResponse = await fetch("/api/yojana", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ monthly_expenses: expenses }),
                })
                if (agentResponse.ok) agentData = await agentResponse.json()
              }
              break
            }
            case "bazaar": {
              const symbols: Record<string, string> = {
                'reliance': 'RELIANCE', 'tcs': 'TCS', 'infosys': 'INFY', 'infy': 'INFY',
                'hdfc': 'HDFCBANK', 'icici': 'ICICIBANK', 'sbi': 'SBIN', 'tata': 'TATAMOTORS',
              }
              let symbol = 'RELIANCE'
              const lowerInput = query.toLowerCase()
              for (const [key, sym] of Object.entries(symbols)) {
                if (lowerInput.includes(key)) { symbol = sym; break }
              }
              agentResponse = await fetch("/api/bazaar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ symbol }),
              })
              if (agentResponse.ok) agentData = await agentResponse.json()
              break
            }
            case "life-event": {
              const amount = extractNumber(query)
              agentResponse = await fetch("/api/life-event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  event_type: "marriage",
                  years_until: 5,
                  current_corpus: amount || 0,
                }),
              })
              if (agentResponse.ok) agentData = await agentResponse.json()
              break
            }
            case "couple-planner": {
              const income = extractNumber(query)
              agentResponse = await fetch("/api/couple-planner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "plan",
                  person1_name: "Partner 1",
                  person1_income: income || 50000,
                  person2_name: "Partner 2",
                  person2_income: income || 50000,
                }),
              })
              if (agentResponse.ok) agentData = await agentResponse.json()
              break
            }
            default:
              break
          }
          
          // Ask for missing info
          if (askForInfo) {
            const agentName = agentNames[routedAgent] || routedAgent
            let askMessage = ""
            if (missingInfo === "income") {
              askMessage = `${agentName} here! To calculate your tax, I need your annual income.\n\n**Please tell me your income** (e.g., "15 lakhs" or "1500000")`
              setLastAskedFor("income")
            } else if (missingInfo === "expenses") {
              askMessage = `${agentName} here! To calculate your FIRE number, I need your monthly expenses.\n\n**Please tell me your monthly expenses** (e.g., "50 thousand" or "50000")`
              setLastAskedFor("expenses")
            }
            setMessages((prev) => [...prev, { 
              id: String(Date.now() + 1), 
              role: "assistant", 
              content: askMessage, 
              agent: routedAgent, 
              timestamp: new Date() 
            }])
            setLoading(false)
            return
          }
        } catch (e) {
          console.log('Agent API failed:', e)
        }
      }

      // Generate response
      const response = generateResponse(routedAgent, query, agentData)
      setMessages((prev) => [...prev, { 
        id: String(Date.now() + 1), 
        role: "assistant", 
        content: response, 
        agent: routedAgent, 
        timestamp: new Date() 
      }])
      saveChat(query, response, routedAgent)
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [...prev, { 
        id: String(Date.now() + 1), 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again.", 
        timestamp: new Date() 
      }])
    } finally {
      setLoading(false)
    }
  }

  const generateResponse = (agent: string, query: string, data: any): string => {
    const name = agentNames[agent] || agent
    if (!data || data.error) {
      // Return informational if we have it
      const infoCheck = isInformational(query, agent)
      if (infoCheck.isInfo && informationalResponses[agent]?.[infoCheck.key]) {
        return informationalResponses[agent][infoCheck.key]
      }
      return `${name} here! I'd be happy to help. Could you provide more details?\n\nFor example:\n- For taxes: \"Calculate tax for 15 lakhs\"\n- For FIRE: \"My monthly expenses are 50K\"\n- For stocks: \"What is RELIANCE price?\"`
    }

    if (agent === "karvid") {
      const tax = data.total_tax || 97500
      const oldTax = data.tax_old || tax
      const regime = data.regime || "new"
      return `${name} - Tax Calculation

**Your Tax Summary:**
- Annual Income: ₹${(data.gross_income || 1500000).toLocaleString()}
- Taxable Income: ₹${(data.taxable_income || 1425000).toLocaleString()}
- Total Tax: ₹${tax.toLocaleString()}
- Effective Rate: ${data.effective_rate || 6.5}%
- Regime: ${regime.toUpperCase()}

**Regime Comparison:**
- Old Regime: ₹${oldTax.toLocaleString()}
- New Regime: ₹${tax.toLocaleString()}

**${tax < oldTax ? `✅ NEW regime saves you ₹${(oldTax - tax).toLocaleString()}` : `📉 OLD regime may save you more`}**

Need deductions breakdown? Ask about 80C, 80D, or HRA!`
    }

    if (agent === "yojana") {
      const fire = data.classic_fire || 15000000
      const fatFire = data.fat_fire || fire * 1.5
      return `${name} - Your FIRE Numbers

Based on monthly expenses of ₹${(data.monthly_expenses || 50000).toLocaleString()}:

**Your FIRE Numbers:**
- Classic FIRE: ₹${(fire / 100000).toFixed(0)} Lakhs (₹${(fire / 10000000).toFixed(2)} Cr)
- Fat FIRE: ₹${(fatFire / 100000).toFixed(0)} Lakhs (₹${(fatFire / 10000000).toFixed(2)} Cr)

**What this means:**
- You need this corpus to retire
- Withdraw 4% yearly = ₹${((fire * 0.04) / 12).toLocaleString()}/month
- Money lasts 30+ years (historically)

**How to achieve it:**
- Start with ₹${((fire / 10000000) * 25000).toFixed(0)}/month SIP
- Increase by 10% yearly
- Expect 12% returns (equity)

Want to adjust your expenses? Tell me a new number!`
    }

    if (agent === "bazaar") {
      const price = data.price || 1414
      const change = data.change_percent || 0.5
      const symbol = data.symbol || "RELIANCE"
      return `${name} - Stock Quote

**${symbol}**
- Price: ₹${price.toLocaleString()}
- Change: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
- Trend: ${change >= 0 ? '📈 Bullish' : '📉 Bearish'}

${change >= 0 ? 'Trading positive today.' : 'Trading down today.'}

**⚠️ SEBI Disclaimer:** This is informational only. Not investment advice. Consult a SEBI-registered advisor.

Want another stock? Ask about TCS, INFY, HDFC, or any Nifty 50 stock!`
    }

    if (agent === "dhan") {
      const score = data.overall_score || 72
      const grade = data.grade || 'B'
      return `${name} - Financial Health Score

**Your Score: ${score}/100 (Grade: ${grade})**

${score >= 80 ? '✅ Excellent financial health!' : score >= 60 ? '👍 Good, minor improvements needed.' : score >= 40 ? '⚠️ Fair, let\'s improve this.' : '🔴 Needs attention.'}

**Key Metrics:**
- Emergency Fund: ${data.metrics?.[0]?.score || 'N/A'}/100
- Savings Rate: ${data.metrics?.[2]?.score || 'N/A'}/100
- Debt Ratio: ${data.metrics?.[1]?.score || 'N/A'}/100

**Recommendations:**
- Build 6 months emergency fund
- Save 20%+ of income
- Keep debt-to-income below 30%

Want a personalized assessment? Tell me your income and expenses!`
    }

    return `${name} here! How can I help you?`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="border-b border-white/10 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-white hover:text-purple-300">
            <span>← Back to Home</span>
          </a>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            <span className="text-white font-bold">DhanSarthi</span>
            <Badge className={`ml-2 ${backendStatus === 'online' ? 'bg-green-500/20 text-green-400' : backendStatus === 'offline' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {backendStatus === 'online' ? 'Online' : backendStatus === 'offline' ? 'Offline' : 'Checking...'}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl p-4 ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white'}`}>
                {msg.agent && msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-purple-500/30 text-purple-300">
                      {agentNames[msg.agent] || msg.agent}
                    </Badge>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{parseMarkdown(msg.content)}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-xl p-4 text-white flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing your query...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about tax, FIRE, stocks, or financial health..."
              className="flex-1 bg-white/10 text-white rounded-xl px-4 py-3 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 border-white/20"
              disabled={loading}
            />
            <Button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
