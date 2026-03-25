"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function BazaarPage() {
  const [symbol, setSymbol] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const searchStock = async () => {
    if (!symbol.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch("/api/bazaar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: symbol.toUpperCase() }),
      })
      if (!response.ok) {
        const err = await response.json()
        setResult(null)
        alert(err.error || "Backend error. Please try again.")
        return
      }
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult(null)
      alert("Backend is offline. Please ensure the FastAPI server is running.")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    if (value >= 10000000) {
      return (value / 10000000).toFixed(2) + " Cr"
    } else if (value >= 100000) {
      return (value / 100000).toFixed(2) + " L"
    }
    return value.toLocaleString("en-IN")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl">📈</span>
        <div>
          <h1 className="text-3xl font-bold">BazaarGuru</h1>
          <p className="text-muted-foreground">Stock Quotes Agent</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Stock</CardTitle>
          <CardDescription>Enter NSE/BSE symbol to get real-time quotes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="symbol">Stock Symbol</Label>
              <Input
                id="symbol"
                placeholder="e.g., RELIANCE, TCS, INFY"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && searchStock()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchStock} disabled={loading || !symbol.trim()}>
                {loading ? "Searching..." : "Get Quote"}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer" onClick={() => setSymbol("RELIANCE")}>RELIANCE</Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => setSymbol("TCS")}>TCS</Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => setSymbol("INFY")}>INFY</Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => setSymbol("HDFCBANK")}>HDFCBANK</Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => setSymbol("ICICIBANK")}>ICICIBANK</Badge>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{result.name}</CardTitle>
                <CardDescription>{result.symbol}</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{formatCurrency(result.price)}</p>
                <Badge className={result.change >= 0 ? "bg-green-500" : "bg-red-500"}>
                  {result.change >= 0 ? "▲" : "▼"} {Math.abs(result.change).toFixed(2)} ({result.changePercent.toFixed(2)}%)
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Day High</p>
                <p className="text-lg font-semibold">{formatCurrency(result.high)}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Day Low</p>
                <p className="text-lg font-semibold">{formatCurrency(result.low)}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Volume</p>
                <p className="text-lg font-semibold">{formatNumber(result.volume)}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">P/E Ratio</p>
                <p className="text-lg font-semibold">{result.pe.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Market Cap</p>
              <p className="text-2xl font-bold">₹{formatNumber(result.marketCap * 10000000)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">⚠️ Investment Disclaimer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700">
            Stock investments are subject to market risks. Past performance is not indicative of future results. 
            Always do your own research and consult a SEBI-registered investment advisor before making investment decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
