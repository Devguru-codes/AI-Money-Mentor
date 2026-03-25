"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Calculator, TrendingDown, TrendingUp, Info } from "lucide-react"
import { toast } from "sonner"

export default function KarVidPage() {
  const [formData, setFormData] = useState({
    grossIncome: 1200000,
    deductions80C: 150000,
    deductions80D: 25000,
    hra: 0,
    homeLoan: 0,
    nps: 0,
  })
  const [calculating, setCalculating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("calculator")

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  const calculateTax = async () => {
    setCalculating(true)
    try {
      const response = await fetch("/api/karvid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          income: formData.grossIncome,
          regime: "new",
          deductions_80c: formData.deductions80C,
          deductions_80d: formData.deductions80D,
        }),
      })
      if (!response.ok) {
        const err = await response.json()
        toast.error(err.error || "Backend error. Please try again.")
        return
      }
      const data = await response.json()
      setResult({
        oldRegime: data.tax_old || calculateOldRegime(formData),
        newRegime: data.tax_new || calculateNewRegime(formData.grossIncome),
        recommendation: data.recommendation || "new",
        savings: Math.abs((data.tax_new || calculateNewRegime(formData.grossIncome)) - (data.tax_old || calculateOldRegime(formData)).total),
      })
      toast.success("Tax calculated successfully!")
    } catch (error) {
      toast.error("Backend is offline. Please ensure the FastAPI server is running.")
    } finally {
      setCalculating(false)
    }
  }

  const calculateOldRegime = (data: typeof formData) => {
    const taxableIncome = Math.max(0, data.grossIncome - 50000 - data.deductions80C - data.deductions80D - data.hra - data.homeLoan - data.nps)
    let tax = 0
    if (taxableIncome > 1500000) {
      tax = (taxableIncome - 1500000) * 0.30 + 187500
    } else if (taxableIncome > 1200000) {
      tax = (taxableIncome - 1200000) * 0.30 + 97500
    } else if (taxableIncome > 900000) {
      tax = (taxableIncome - 900000) * 0.20 + 37500
    } else if (taxableIncome > 600000) {
      tax = (taxableIncome - 600000) * 0.10 + 7500
    } else if (taxableIncome > 250000) {
      tax = (taxableIncome - 250000) * 0.05
    }
    const cess = tax * 0.04
    return { total: tax + cess, taxableIncome, cess }
  }

  const calculateNewRegime = (income: number) => {
    const taxableIncome = income - 50000
    let tax = 0
    if (taxableIncome > 1500000) {
      tax = (taxableIncome - 1500000) * 0.30 + 150000
    } else if (taxableIncome > 1200000) {
      tax = (taxableIncome - 1200000) * 0.20 + 90000
    } else if (taxableIncome > 900000) {
      tax = (taxableIncome - 900000) * 0.15 + 45000
    } else if (taxableIncome > 600000) {
      tax = (taxableIncome - 600000) * 0.10 + 15000
    } else if (taxableIncome > 300000) {
      tax = (taxableIncome - 300000) * 0.05
    }
    return tax + tax * 0.04
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
        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">KarVid</h1>
          <p className="text-muted-foreground">Tax Calculator Agent</p>
        </div>
        <Badge className="ml-auto bg-green-500">Active</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Tax Calculator</TabsTrigger>
          <TabsTrigger value="compare">Regime Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Income Details</CardTitle>
              <CardDescription>Enter your income and deductions to calculate tax</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grossIncome">Gross Annual Income (₹)</Label>
                  <Input
                    id="grossIncome"
                    type="number"
                    value={formData.grossIncome}
                    onChange={(e) => handleChange("grossIncome", e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deductions80C">Section 80C Deductions (₹)</Label>
                  <Input
                    id="deductions80C"
                    type="number"
                    value={formData.deductions80C}
                    onChange={(e) => handleChange("deductions80C", e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">Max: ₹1,50,000 (PF, PPF, ELSS, etc.)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deductions80D">Section 80D - Health Insurance (₹)</Label>
                  <Input
                    id="deductions80D"
                    type="number"
                    value={formData.deductions80D}
                    onChange={(e) => handleChange("deductions80D", e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">Max: ₹25,000 (self) + ₹25,000 (parents)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nps">NPS Contribution (₹)</Label>
                  <Input
                    id="nps"
                    type="number"
                    value={formData.nps}
                    onChange={(e) => handleChange("nps", e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">Additional ₹50,000 under 80CCD(1B)</p>
                </div>
              </div>
              <Button onClick={calculateTax} disabled={calculating} className="w-full">
                {calculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Tax
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Old vs New Tax Regime</CardTitle>
              <CardDescription>See which regime saves you more</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Enter your income details in the Calculator tab to see a detailed comparison
                </p>
                <Button variant="outline" onClick={() => setActiveTab("calculator")}>
                  Go to Calculator
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Tax Comparison Results</CardTitle>
            <CardDescription>Based on your income of {formatCurrency(formData.grossIncome)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className={"p-4 rounded-lg border-2 " + (result.recommendation === "old" ? "border-green-500 bg-green-50" : "border-border bg-muted")}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Old Regime</h3>
                  {result.recommendation === "old" && (
                    <Badge className="bg-green-500">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="text-3xl font-bold">{formatCurrency(result.oldRegime?.total || result.oldRegime)}</p>
                <p className="text-sm text-muted-foreground mt-1">With all deductions</p>
              </div>

              <div className={"p-4 rounded-lg border-2 " + (result.recommendation === "new" ? "border-green-500 bg-green-50" : "border-border bg-muted")}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">New Regime</h3>
                  {result.recommendation === "new" && (
                    <Badge className="bg-green-500">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="text-3xl font-bold">{formatCurrency(result.newRegime)}</p>
                <p className="text-sm text-muted-foreground mt-1">Lower tax rates, fewer deductions</p>
              </div>
            </div>

            {result.savings > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-700">
                    Save {formatCurrency(result.savings)} with the {result.recommendation.toUpperCase()} regime
                  </span>
                </div>
              </div>
            )}

            <Separator className="my-4" />

            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Tax calculations are indicative. Consult a tax professional for accurate tax planning.
                The new tax regime is the default from FY 2023-24.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Tax Disclaimer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700">
            Tax benefits are subject to changes in tax laws. Please consult your tax advisor before 
            making any investment decisions. This is for educational purposes only.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
