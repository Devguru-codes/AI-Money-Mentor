"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

export default function DhanPage() {
  const [formData, setFormData] = useState({
    monthlyIncome: 100000,
    monthlyExpenses: 60000,
    emergencyFund: 200000,
    totalDebt: 500000,
    investments: 2000000,
    age: 30,
  })
  const [calculating, setCalculating] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  const calculateHealthScore = async () => {
    setCalculating(true)
    try {
      const { monthlyIncome, monthlyExpenses, emergencyFund, totalDebt, investments, age } = formData
      
      // Calculate various metrics
      const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
      const emergencyMonths = emergencyFund / monthlyExpenses
      const debtToIncome = (totalDebt / (monthlyIncome * 12)) * 100
      
      // Score components (each out of 20)
      let score = 0
      
      // Savings Rate Score (20 points)
      if (savingsRate >= 30) score += 20
      else if (savingsRate >= 20) score += 15
      else if (savingsRate >= 10) score += 10
      else if (savingsRate >= 5) score += 5
      
      // Emergency Fund Score (20 points)
      if (emergencyMonths >= 6) score += 20
      else if (emergencyMonths >= 4) score += 15
      else if (emergencyMonths >= 2) score += 10
      else if (emergencyMonths >= 1) score += 5
      
      // Debt-to-Income Score (20 points)
      if (debtToIncome <= 20) score += 20
      else if (debtToIncome <= 40) score += 15
      else if (debtToIncome <= 60) score += 10
      else if (debtToIncome <= 80) score += 5
      
      // Investment Score (20 points)
      const investmentRatio = investments / (monthlyIncome * 12)
      if (investmentRatio >= 3) score += 20
      else if (investmentRatio >= 2) score += 15
      else if (investmentRatio >= 1) score += 10
      else if (investmentRatio >= 0.5) score += 5
      
      // Age-appropriate savings (20 points)
      const expectedMultiple = age * 12 * monthlyIncome * 0.01 // 10% of annual income per year of age
      const actualMultiple = investments / (monthlyIncome * 12)
      if (actualMultiple >= age * 0.1) score += 20
      else if (actualMultiple >= age * 0.05) score += 15
      else if (actualMultiple >= age * 0.03) score += 10
      else if (actualMultiple >= age * 0.01) score += 5
      
      const recommendations = []
      if (savingsRate < 20) recommendations.push("Increase your savings rate to at least 20% of income")
      if (emergencyMonths < 6) recommendations.push("Build emergency fund to cover 6 months of expenses")
      if (debtToIncome > 40) recommendations.push("Focus on reducing debt before increasing investments")
      if (investmentRatio < 1) recommendations.push("Aim to have at least 1x annual income in investments")
      
      setResult({
        overallScore: Math.min(100, score),
        savingsRate,
        emergencyMonths,
        debtToIncome,
        investmentRatio,
        recommendations,
        breakdown: {
          savings: Math.min(20, Math.floor(savingsRate / 1.5)),
          emergency: Math.min(20, Math.floor(emergencyMonths * 3.33)),
          debt: debtToIncome <= 20 ? 20 : Math.max(0, 20 - Math.floor((debtToIncome - 20) / 4)),
          investment: Math.min(20, Math.floor(investmentRatio * 6.67)),
          age: Math.min(20, Math.floor(actualMultiple / (age * 0.005))),
        }
      })

      // Auto-save to DB if user is logged in
      try {
        const stored = localStorage.getItem('user')
        if (stored) {
          const user = JSON.parse(stored)
          await fetch('/api/save/health', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              overallScore: Math.min(100, score),
              emergencyFund: formData.emergencyFund,
              savingsRate: savingsRate / 100,
              debtToIncome: debtToIncome / 100,
            }),
          })
        }
      } catch (e) { /* silent save */ }
    } finally {
      setCalculating(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    if (score >= 40) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Needs Improvement"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl">💪</span>
        <div>
          <h1 className="text-3xl font-bold">DhanRaksha</h1>
          <p className="text-muted-foreground">Financial Health Agent</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Health Assessment</CardTitle>
          <CardDescription>Answer a few questions to get your financial health score</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
              <Input
                id="monthlyIncome"
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => handleChange("monthlyIncome", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyExpenses">Monthly Expenses (₹)</Label>
              <Input
                id="monthlyExpenses"
                type="number"
                value={formData.monthlyExpenses}
                onChange={(e) => handleChange("monthlyExpenses", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyFund">Emergency Fund (₹)</Label>
              <Input
                id="emergencyFund"
                type="number"
                value={formData.emergencyFund}
                onChange={(e) => handleChange("emergencyFund", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalDebt">Total Debt (₹)</Label>
              <Input
                id="totalDebt"
                type="number"
                value={formData.totalDebt}
                onChange={(e) => handleChange("totalDebt", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investments">Total Investments (₹)</Label>
              <Input
                id="investments"
                type="number"
                value={formData.investments}
                onChange={(e) => handleChange("investments", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
              />
            </div>
          </div>
          <Button onClick={calculateHealthScore} disabled={calculating}>
            {calculating ? "Calculating..." : "Calculate Health Score"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your Financial Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <p className={`text-6xl font-bold ${getScoreColor(result.overallScore)}`}>
                  {result.overallScore}
                </p>
                <p className="text-xl text-muted-foreground mt-2">{getScoreLabel(result.overallScore)}</p>
                <Progress value={result.overallScore} className="mt-4 h-3" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Savings Rate</p>
                  <p className="text-2xl font-bold">{result.savingsRate.toFixed(1)}%</p>
                  <Progress value={result.breakdown.savings * 5} className="mt-2" />
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Emergency Fund</p>
                  <p className="text-2xl font-bold">{result.emergencyMonths.toFixed(1)} months</p>
                  <Progress value={result.breakdown.emergency * 5} className="mt-2" />
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Debt-to-Income Ratio</p>
                  <p className="text-2xl font-bold">{result.debtToIncome.toFixed(1)}%</p>
                  <Progress value={result.breakdown.debt * 5} className="mt-2" />
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Investment Ratio</p>
                  <p className="text-2xl font-bold">{result.investmentRatio.toFixed(1)}x</p>
                  <Progress value={result.breakdown.investment * 5} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {result.recommendations.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">💡 Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-blue-700">
                      <span>•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
