"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function VidhiPage() {
  const [disclaimers, setDisclaimers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDisclaimers()
  }, [])

  const fetchDisclaimers = async () => {
    try {
      const response = await fetch("/api/vidhi")
      if (!response.ok) {
        throw new Error("Backend error")
      }
      const data = await response.json()
      setDisclaimers(data.disclaimers || [])
    } catch (error) {
      // Show error state - no fallback data
      setDisclaimers([
        {
          title: "⚠️ Backend Offline",
          content: "Could not load disclaimers from the server. Please ensure the FastAPI backend is running on port 8000.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl">⚖️</span>
        <div>
          <h1 className="text-3xl font-bold">Vidhi</h1>
          <p className="text-muted-foreground">Compliance Agent</p>
        </div>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">SEBI Compliance Information</CardTitle>
          <CardDescription className="text-blue-600">
            Important disclaimers and regulatory information you should know
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700">
            As per SEBI guidelines, we are required to display important disclaimers regarding financial advice 
            and investment recommendations. Please read through these carefully before making any investment decisions.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading disclaimers...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disclaimers.map((disclaimer, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{idx + 1}</Badge>
                  <CardTitle className="text-lg">{disclaimer.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{disclaimer.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Regulatory Bodies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">SEBI</h3>
              <p className="text-sm text-muted-foreground">
                Securities and Exchange Board of India - Regulates securities market in India
              </p>
              <a href="https://www.sebi.gov.in" target="_blank" rel="noopener noreferrer" 
                 className="text-primary text-sm hover:underline mt-2 block">
                www.sebi.gov.in →
              </a>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">RBI</h3>
              <p className="text-sm text-muted-foreground">
                Reserve Bank of India - Regulates banking and monetary policy
              </p>
              <a href="https://www.rbi.org.in" target="_blank" rel="noopener noreferrer"
                 className="text-primary text-sm hover:underline mt-2 block">
                www.rbi.org.in →
              </a>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">AMFI</h3>
              <p className="text-sm text-muted-foreground">
                Association of Mutual Funds in India - Mutual fund industry body
              </p>
              <a href="https://www.amfiindia.com" target="_blank" rel="noopener noreferrer"
                 className="text-primary text-sm hover:underline mt-2 block">
                www.amfiindia.com →
              </a>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">IRDAI</h3>
              <p className="text-sm text-muted-foreground">
                Insurance Regulatory and Development Authority - Regulates insurance sector
              </p>
              <a href="https://www.irdai.gov.in" target="_blank" rel="noopener noreferrer"
                 className="text-primary text-sm hover:underline mt-2 block">
                www.irdai.gov.in →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Rights as an Investor</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Right to receive all relevant information about investments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Right to receive contract notes and statements regularly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Right to file complaints with SEBI SCORES</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Right to receive free annual statements from mutual funds</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Right to opt out of unsolicited communications</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
