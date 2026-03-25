'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function CouplePlannerPage() {
  // Person 1
  const [person1Name, setPerson1Name] = useState('Person 1')
  const [person1Income, setPerson1Income] = useState(0)
  const [person1Expenses, setPerson1Expenses] = useState(0)
  const [person1Savings, setPerson1Savings] = useState(0)
  const [person1Debt, setPerson1Debt] = useState(0)

  // Person 2
  const [person2Name, setPerson2Name] = useState('Person 2')
  const [person2Income, setPerson2Income] = useState(0)
  const [person2Expenses, setPerson2Expenses] = useState(0)
  const [person2Savings, setPerson2Savings] = useState(0)
  const [person2Debt, setPerson2Debt] = useState(0)

  // Shared goals
  const [goals, setGoals] = useState([
    { name: 'Home Purchase', target_amount: 5000000, years: 5, priority: 1 },
    { name: 'Vacation', target_amount: 200000, years: 2, priority: 3 },
  ])

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [budgetResult, setBudgetResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const calculateFinances = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/couple-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'finances',
          person1_name: person1Name,
          person1_income: person1Income,
          person2_name: person2Name,
          person2_income: person2Income,
        }),
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to calculate')
    } finally {
      setLoading(false)
    }
  }

  const calculateBudget = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/couple-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'budget',
          person1_name: person1Name,
          person1_income: person1Income,
          person1_expenses: person1Expenses,
          person1_savings: person1Savings,
          person2_name: person2Name,
          person2_income: person2Income,
          person2_expenses: person2Expenses,
          person2_savings: person2Savings,
        }),
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setBudgetResult(data)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to calculate')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Couple&apos;s Money Planner</h1>
        <p className="text-muted-foreground mt-2">
          Plan your finances together - shared goals, budget splits, and combined planning
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Person 1 */}
        <Card>
          <CardHeader>
            <CardTitle>👤 {person1Name}</CardTitle>
            <CardDescription>First person&apos;s finances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={person1Name} onChange={(e) => setPerson1Name(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Monthly Income (₹)</Label>
              <Input
                type="number"
                value={person1Income}
                onChange={(e) => setPerson1Income(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Monthly Expenses (₹)</Label>
              <Input
                type="number"
                value={person1Expenses}
                onChange={(e) => setPerson1Expenses(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Current Savings (₹)</Label>
              <Input
                type="number"
                value={person1Savings}
                onChange={(e) => setPerson1Savings(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Debt (₹)</Label>
              <Input
                type="number"
                value={person1Debt}
                onChange={(e) => setPerson1Debt(parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Person 2 */}
        <Card>
          <CardHeader>
            <CardTitle>👤 {person2Name}</CardTitle>
            <CardDescription>Second person&apos;s finances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={person2Name} onChange={(e) => setPerson2Name(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Monthly Income (₹)</Label>
              <Input
                type="number"
                value={person2Income}
                onChange={(e) => setPerson2Income(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Monthly Expenses (₹)</Label>
              <Input
                type="number"
                value={person2Expenses}
                onChange={(e) => setPerson2Expenses(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Current Savings (₹)</Label>
              <Input
                type="number"
                value={person2Savings}
                onChange={(e) => setPerson2Savings(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Debt (₹)</Label>
              <Input
                type="number"
                value={person2Debt}
                onChange={(e) => setPerson2Debt(parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        <Button onClick={calculateFinances} disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Combined Finances'}
        </Button>
        <Button variant="outline" onClick={calculateBudget} disabled={loading}>
          Create Budget Plan
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Combined Finances</CardTitle>
            <CardDescription>Your financial snapshot as a couple</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm text-muted-foreground">Combined Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(result.combined_income)}</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <p className="text-sm text-muted-foreground">Combined Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(result.combined_expenses)}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-muted-foreground">Combined Savings</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(result.combined_savings)}</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <p className="text-sm text-muted-foreground">Net Worth</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(result.net_worth)}</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Income Split</p>
              <div className="flex gap-4 mt-2">
                <Badge variant="secondary">{person1Name}: {(result.income_ratio[person1Name] * 100).toFixed(1)}%</Badge>
                <Badge variant="secondary">{person2Name}: {(result.income_ratio[person2Name] * 100).toFixed(1)}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {budgetResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Budget Plan (50/30/20)</CardTitle>
            <CardDescription>Recommended budget allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-muted-foreground">Needs (50%)</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(budgetResult.summary.needs)}</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <p className="text-sm text-muted-foreground">Wants (30%)</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(budgetResult.summary.wants)}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm text-muted-foreground">Savings (20%)</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(budgetResult.summary.savings)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">Recommendations</p>
              <ul className="space-y-1">
                {budgetResult.recommendations?.map((rec: string, idx: number) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shared Goals */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>🎯 Shared Goals</CardTitle>
          <CardDescription>Plan for shared financial goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.map((goal, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{goal.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Target: {formatCurrency(goal.target_amount)} | Years: {goal.years}
                  </p>
                </div>
                <Badge>Priority {goal.priority}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}