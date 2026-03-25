"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Brain, BarChart3, Calculator, Target, TrendingUp, Shield, Scale, ArrowRight, Sparkles, Wallet, PiggyBank, TrendingDown, Activity } from "lucide-react"

const agents = [
  {
    id: "dhan-sarthi",
    name: "DhanSarthi",
    emoji: "🧠",
    title: "AI Coordinator",
    description: "Ask anything! I will route your query to the right specialist automatically.",
    color: "from-purple-500 to-indigo-600",
    href: "/agents/dhan-sarthi",
    featured: true,
  },
  {
    id: "niveshak",
    name: "Niveshak",
    emoji: "📊",
    title: "MF Portfolio X-Ray",
    description: "Analyze mutual fund portfolios, calculate XIRR, Sharpe ratio, and get AI-powered insights",
    color: "from-blue-500 to-cyan-600",
    href: "/agents/niveshak",
    icon: BarChart3,
  },
  {
    id: "karvid",
    name: "KarVid",
    emoji: "🧾",
    title: "Tax Calculator",
    description: "Calculate taxes under old & new regimes, compare deductions, optimize tax savings",
    color: "from-green-500 to-emerald-600",
    href: "/agents/karvid",
    icon: Calculator,
  },
  {
    id: "yojana",
    name: "YojanaKarta",
    emoji: "🎯",
    title: "FIRE Planner",
    description: "Plan your Financial Independence, calculate FIRE number, track retirement goals",
    color: "from-orange-500 to-amber-600",
    href: "/agents/yojana",
    icon: Target,
  },
  {
    id: "bazaar",
    name: "BazaarGuru",
    emoji: "📈",
    title: "Stock Quotes",
    description: "Real-time stock quotes, market analysis, and investment recommendations",
    color: "from-pink-500 to-rose-600",
    href: "/agents/bazaar",
    icon: TrendingUp,
  },
  {
    id: "dhan",
    name: "DhanRaksha",
    emoji: "💪",
    title: "Financial Health",
    description: "Assess your financial health score, emergency fund status, savings rate analysis",
    color: "from-red-500 to-orange-600",
    href: "/agents/dhan",
    icon: Shield,
  },
  {
    id: "vidhi",
    name: "Vidhi",
    emoji: "⚖️",
    title: "Compliance",
    description: "SEBI disclaimers, regulatory information, and compliance guidelines",
    color: "from-gray-500 to-slate-600",
    href: "/agents/vidhi",
    icon: Scale,
  },
]

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking")

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)

    // Check backend status
    fetch("/api/dhan-sarthi")
      .then((res) => {
        if (res.ok) setBackendStatus("online")
        else setBackendStatus("offline")
      })
      .catch(() => setBackendStatus("offline"))
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 p-8 md:p-12 text-white">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">AI-Powered Financial Guidance</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your Personal Finance Guide
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-6 max-w-2xl">
            AI-powered financial guidance for 95% of Indians. Plan taxes, track investments, 
            achieve FIRE, and assess your financial health — all in one place.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/agents/dhan-sarthi">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90">
                <Brain className="w-5 h-5 mr-2" />
                Ask AI Anything
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                {user ? "View Profile" : "Get Started"}
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <div className={"flex items-center gap-2 px-3 py-1 rounded-full text-sm " + (backendStatus === "online" ? "bg-green-500" : backendStatus === "offline" ? "bg-red-500" : "bg-yellow-500")}>
            <span className={"w-2 h-2 rounded-full " + (backendStatus === "online" ? "bg-white animate-pulse" : "bg-white")} />
            {backendStatus === "checking" ? "Connecting..." : backendStatus === "online" ? "AI Online" : "Offline"}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Portfolio Value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-700">
              {user ? formatCurrency(0) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4" />
              Tax Saved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">
              {user ? formatCurrency(0) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              FIRE Progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-700">
              {user ? "0%" : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Health Score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-700">
              {user ? "-/100" : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Featured Agent - DhanSarthi */}
      <Card className="overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">DhanSarthi</h2>
                <Badge className="bg-purple-500">AI Coordinator</Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                The brain of AI Money Mentor. Ask anything about your finances — taxes, investments, 
                retirement, stocks — and I will intelligently route your query to the right specialist.
              </p>
              <Link href="/agents/dhan-sarthi">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90">
                  <Brain className="w-5 h-5 mr-2" />
                  Start Chatting
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Agent Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Our AI Agents</h2>
          <Link href="/agents" className="text-primary hover:underline text-sm">
            View All →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.filter(a => !a.featured).map((agent) => {
            const IconComponent = agent.icon
            return (
              <Link key={agent.id} href={agent.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:border-primary cursor-pointer overflow-hidden group">
                  <div className={"h-2 bg-gradient-to-r " + agent.color} />
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={"p-2 rounded-lg bg-gradient-to-br " + agent.color + " text-white"}>
                        {IconComponent && <IconComponent className="w-5 h-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription>{agent.title}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
                    <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Try Now <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* SEBI Disclaimer */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800 text-sm">⚠️ SEBI Disclaimer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700">
            All investments are subject to market risks. This platform provides educational information only 
            and should not be construed as financial advice. Always consult a SEBI-registered investment advisor 
            before making investment decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
