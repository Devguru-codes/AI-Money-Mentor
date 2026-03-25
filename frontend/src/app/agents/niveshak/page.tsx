"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function NiveshakPage() {
  const [holdings, setHoldings] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleAnalyze = async () => {
    if (!holdings.trim()) return
    
    setAnalyzing(true)
    try {
      // Parse holdings (format: MF Name, Units, NAV per line)
      const lines = holdings.trim().split("\n")
      const parsedHoldings = lines.map(line => {
        const parts = line.split(",").map(p => p.trim())
        return {
          name: parts[0] || "Unknown",
          units: parseFloat(parts[1]) || 0,
          nav: parseFloat(parts[2]) || 0,
        }
      }).filter(h => h.units > 0)

      // Calculate basic metrics
      const totalValue = parsedHoldings.reduce((sum, h) => sum + (h.units * h.nav), 0)
      
      setResult({
        totalValue,
        xirr: 12.5, // Placeholder - would connect to backend
        sharpeRatio: 1.2,
        holdings: parsedHoldings,
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl">📊</span>
        <div>
          <h1 className="text-3xl font-bold">Niveshak</h1>
          <p className="text-muted-foreground">MF Portfolio X-Ray Agent</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Holdings</CardTitle>
          <CardDescription>
            Enter your mutual fund holdings in the format: MF Name, Units, Current NAV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="holdings">Holdings (one per line)</Label>
            <Textarea
              id="holdings"
              placeholder="Parag Parikh Flexi Cap, 100, 85.50&#10;Mirae Asset Large Cap, 200, 92.30&#10;Axis Small Cap, 150, 78.20"
              value={holdings}
              onChange={(e) => setHoldings(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
          <Button onClick={handleAnalyze} disabled={analyzing || !holdings.trim()}>
            {analyzing ? "Analyzing..." : "Analyze Portfolio"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Value</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(result.totalValue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>XIRR</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{result.xirr.toFixed(2)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Sharpe Ratio</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{result.sharpeRatio.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Holdings Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.holdings.map((h: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{h.name}</p>
                      <p className="text-sm text-muted-foreground">{h.units} units @ ₹{h.nav}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(h.units * h.nav)}</p>
                      <Badge variant="secondary">{((h.units * h.nav) / result.totalValue * 100).toFixed(1)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Separator />

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">⚠️ SEBI Disclaimer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700">
            Mutual fund investments are subject to market risks. Read all scheme-related documents carefully. 
            Past performance is not indicative of future results. This is for educational purposes only and 
            should not be construed as financial advice.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
