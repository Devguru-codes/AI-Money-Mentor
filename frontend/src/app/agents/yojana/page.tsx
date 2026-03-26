"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, Target, TrendingUp, Calculator, Info } from "lucide-react"
import { toast } from "sonner"

export default function YojanaPage() {
  const [formData, setFormData] = useState({
    monthlyExpenses: 50000,
    currentAge: 30,
    retirementAge: 50,
    currentSavings: 1000000,
    expectedReturn: 12,
    inflation: 6,
  })
  const [calculating, setCalculating] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  const calculateFIRE = async () => {
    setCalculating(true)
    try {
      const response = await fetch("/api/yojana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthly_expenses: formData.monthlyExpenses,
          current_age: formData.currentAge,
          retirement_age: formData.retirementAge,
          current_savings: formData.currentSavings,
          expected_return: formData.expectedReturn,
          inflation: formData.inflation,
        }),
      })
      if (!response.ok) {
        const err = await response.json()
        toast.error(err.error || "Backend error. Please try again.")
        return
      }
      const data = await response.json()
      const fireResult = {
        fireNumber: data.fire_number || calculateFireNumber(formData.monthlyExpenses),
        inflationAdjusted: data.inflation_adjusted || calculateInflationAdjusted(formData),
        monthlySIP: data.monthly_sip || calculateMonthlySIP(formData),
        yearsToRetire: formData.retirementAge - formData.currentAge,
        currentSavings: formData.currentSavings,
        futureValueOfCurrent: data.future_value || calculateFutureValue(formData),
      }
      setResult(fireResult)
      toast.success("FIRE number calculated!")

      // Auto-save to DB if user is logged in
      try {
        const stored = localStorage.getItem('user')
        if (stored) {
          const user = JSON.parse(stored)
          await fetch('/api/save/fire', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              targetCorpus: fireResult.inflationAdjusted,
              monthlyExpenses: formData.monthlyExpenses,
              targetYears: fireResult.yearsToRetire,
              monthlySIP: fireResult.monthlySIP,
            }),
          })
        }
      } catch (e) { /* silent save */ }
    } catch (error) {
      toast.error("Backend is offline. Please ensure the FastAPI server is running.")
    } finally {
      setCalculating(false)
    }
  }

  const calculateFireNumber = (monthlyExpenses: number) => {
    return monthlyExpenses * 12 * 25 // 4% rule
  }

  const calculateInflationAdjusted = (data: typeof formData) => {
    const fireNumber = calculateFireNumber(data.monthlyExpenses)
    const years = data.retirementAge - data.currentAge
    return fireNumber * Math.pow(1 + data.inflation / 100, years)
  }

  const calculateFutureValue = (data: typeof formData) => {
    const years = data.retirementAge - data.currentAge
    return data.currentSavings * Math.pow(1 + data.expectedReturn / 100, years)
  }

  const calculateMonthlySIP = (data: typeof formData) => {
    const fireNumber = calculateInflationAdjusted(data)
    const futureValueOfCurrent = calculateFutureValue(data)
    const requiredFromSIP = Math.max(0, fireNumber - futureValueOfCurrent)
    const years = data.retirementAge - data.currentAge
    const months = years * 12
    const rate = data.expectedReturn / 100 / 12

    if (requiredFromSIP <= 0) return 0
    return (requiredFromSIP * rate) / (Math.pow(1 + rate, months) - 1)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatRupees = (value: number) => {
    if (value >= 10000000) return (value / 10000000).toFixed(2) + " Cr"
    if (value >= 100000) return (value / 100000).toFixed(2) + " L"
    return value.toLocaleString("en-IN")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
          <Target className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">YojanaKarta</h1>
          <p className="text-muted-foreground">FIRE Planner Agent</p>
        </div>
        <Badge className="ml-auto bg-orange-500">Active</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Plan Your Financial Independence
          </CardTitle>
          <CardDescription>
            Calculate your FIRE number and monthly SIP to achieve financial freedom
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyExpenses">Monthly Expenses (₹)</Label>
              <Input
                id="monthlyExpenses"
                type="number"
                value={formData.monthlyExpenses}
                onChange={(e) => handleChange("monthlyExpenses", e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Current monthly expenses at retirement</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentAge">Current Age</Label>
              <Input
                id="currentAge"
                type="number"
                value={formData.currentAge}
                onChange={(e) => handleChange("currentAge", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retirementAge">Target Retirement Age</Label>
              <Input
                id="retirementAge"
                type="number"
                value={formData.retirementAge}
                onChange={(e) => handleChange("retirementAge", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentSavings">Current Savings (₹)</Label>
              <Input
                id="currentSavings"
                type="number"
                value={formData.currentSavings}
                onChange={(e) => handleChange("currentSavings", e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedReturn">Expected Return (%)</Label>
              <Input
                id="expectedReturn"
                type="number"
                value={formData.expectedReturn}
                onChange={(e) => handleChange("expectedReturn", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Annual return on investments</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inflation">Expected Inflation (%)</Label>
              <Input
                id="inflation"
                type="number"
                value={formData.inflation}
                onChange={(e) => handleChange("inflation", e.target.value)}
              />
            </div>
          </div>
          <Button onClick={calculateFIRE} disabled={calculating} className="w-full">
            {calculating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Calculate FIRE Number
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Your FIRE Number
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-700">
                  ₹{formatRupees(result.fireNumber)}
                </p>
                <p className="text-sm text-green-600">Based on 4% withdrawal rule</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Inflation Adjusted
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-700">
                  ₹{formatRupees(result.inflationAdjusted)}
                </p>
                <p className="text-sm text-blue-600">At retirement ({formData.retirementAge} yrs)</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Monthly SIP Needed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-700">
                  {formatCurrency(result.monthlySIP)}
                </p>
                <p className="text-sm text-purple-600">For {result.yearsToRetire} years</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>FIRE Journey Breakdown</CardTitle>
              <CardDescription>How you will reach financial independence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Current Savings</span>
                  <span className="font-medium font-mono">{formatCurrency(result.currentSavings)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Years to FIRE</span>
                  <span className="font-medium">{result.yearsToRetire} years</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Future Value of Current Savings</span>
                  <span className="font-medium font-mono">{formatCurrency(result.futureValueOfCurrent)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Amount from Monthly SIP</span>
                  <span className="font-medium font-mono">
                    {formatCurrency(Math.max(0, result.inflationAdjusted - result.futureValueOfCurrent))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800 flex items-center gap-2">
            💡 Tips for FIRE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-orange-700 space-y-2">
            <li>• The 4% rule suggests you can withdraw 4% of your corpus annually</li>
            <li>• Increase your SIP amount annually to combat inflation</li>
            <li>• Consider NPS for additional tax benefits towards retirement</li>
            <li>• Review your portfolio allocation as you approach FIRE age</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">⚠️ Investment Disclaimer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 text-sm text-yellow-700">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              FIRE calculations are estimates based on assumptions. Actual returns may vary. 
              Please consult a SEBI-registered investment advisor for personalized advice.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
