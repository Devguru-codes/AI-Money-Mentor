'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

const EVENT_TYPES = [
  { id: 'marriage', name: 'Marriage', icon: '💒', description: 'Wedding expenses' },
  { id: 'child_birth', name: 'Child Birth', icon: '👶', description: 'Hospital & initial setup' },
  { id: 'child_education', name: 'Child Education', icon: '📚', description: 'Education costs' },
  { id: 'home_purchase', name: 'Home Purchase', icon: '🏠', description: 'Down payment' },
  { id: 'car_purchase', name: 'Car Purchase', icon: '🚗', description: 'Vehicle purchase' },
  { id: 'higher_education', name: 'Higher Education', icon: '🎓', description: 'MBA, MS, PhD' },
  { id: 'retirement', name: 'Retirement', icon: '🏖️', description: 'Retirement corpus' },
  { id: 'emergency_fund', name: 'Emergency Fund', icon: '🆘', description: '6-12 months expenses' },
  { id: 'vacation', name: 'Vacation', icon: '✈️', description: 'Domestic/International' },
  { id: 'parent_care', name: 'Parent Care', icon: '👨‍👩‍👧', description: 'Medical & care expenses' },
]

export default function LifeEventPage() {
  const [eventType, setEventType] = useState('marriage')
  const [yearsUntil, setYearsUntil] = useState(5)
  const [currentCorpus, setCurrentCorpus] = useState(0)
  const [monthlyInvestment, setMonthlyInvestment] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const calculatePlan = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/life-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          years_until: yearsUntil,
          current_corpus: currentCorpus,
          monthly_investment: monthlyInvestment,
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
        <h1 className="text-3xl font-bold">Life Event Financial Advisor</h1>
        <p className="text-muted-foreground mt-2">
          Plan your finances for major life events like marriage, children, education, and more
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Your Life Event</CardTitle>
            <CardDescription>Select an event and timeline to get personalized financial plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Life Event</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.icon} {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="years">Years Until Event</Label>
              <Input
                id="years"
                type="number"
                value={yearsUntil}
                onChange={(e) => setYearsUntil(parseInt(e.target.value) || 0)}
                min={1}
                max={40}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="corpus">Current Corpus (₹)</Label>
              <Input
                id="corpus"
                type="number"
                value={currentCorpus}
                onChange={(e) => setCurrentCorpus(parseFloat(e.target.value) || 0)}
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly">Monthly Investment (₹)</Label>
              <Input
                id="monthly"
                type="number"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(parseFloat(e.target.value) || 0)}
                min={0}
              />
            </div>

            <Button onClick={calculatePlan} disabled={loading} className="w-full">
              {loading ? 'Calculating...' : 'Calculate Plan'}
            </Button>
          </CardContent>
        </Card>

        {/* Result Card */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Plan</CardTitle>
            <CardDescription>Your personalized savings plan</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Current Cost</p>
                    <p className="text-2xl font-bold">{formatCurrency(result.current_cost)}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Future Cost (Inflation Adjusted)</p>
                    <p className="text-2xl font-bold">{formatCurrency(result.future_cost)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Monthly SIP Needed</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(result.sip_needed)}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Lumpsum Needed Today</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(result.lumpsum_needed_today)}</p>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={result.is_achievable ? 'default' : 'destructive'}>
                    {result.is_achievable ? '✅ On Track' : '⚠️ Shortfall: ' + formatCurrency(result.shortfall)}
                  </Badge>
                </div>

                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-semibold">Recommendations</p>
                    <ul className="space-y-1">
                      {result.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Enter details and click Calculate to see your plan
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Types Overview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Available Life Events</CardTitle>
          <CardDescription>Plan for any major financial milestone</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {EVENT_TYPES.map((event) => (
              <div
                key={event.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  eventType === event.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={() => setEventType(event.id)}
              >
                <div className="text-2xl mb-1">{event.icon}</div>
                <p className="font-medium">{event.name}</p>
                <p className="text-xs opacity-80">{event.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}