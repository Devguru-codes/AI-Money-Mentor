"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Brain } from "lucide-react"
import { parseMarkdown } from "@/lib/markdown"

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

// Global parser is imported

export default function DhanSarthiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am DhanSarthi, your AI financial coordinator powered by real AI.\n\nI can help you with:\n• Tax calculations - \"Calculate tax for 15 lakhs\"\n• FIRE planning - \"What is FIRE?\" or \"My expenses are 50K\"\n• Stock prices - \"RELIANCE stock price\"\n• Financial health - \"What is my health score?\"\n• Legal/Compliance - \"What are SEBI regulations?\"\n• Life Events - \"Plan for my wedding\"\n• Couple Finance - \"Joint budget with my partner\"\n\nWhat would you like to know?",
      agent: "dhan-sarthi",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking")
  const [sessionId, setSessionId] = useState<string | null>(null)
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

  // Get user ID from localStorage
  const getUserId = (): string => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        return userData.id || userData.email || 'anonymous'
      }
    } catch {}
    return 'anonymous'
  }

  const simulateStreaming = async (fullText: string, agentId: string) => {
    const newMessageId = String(Date.now() + 1)
    setMessages((prev) => [...prev, {
      id: newMessageId,
      role: "assistant",
      content: "",
      agent: agentId,
      timestamp: new Date(),
    }])
    
    // Split efficiently: keep spaces on words so we can stitch 
    const words = fullText.match(/(\S+\s+)|(\S+)/g) || [fullText]
    let currentText = ""
    
    for (let i = 0; i < words.length; i++) {
        currentText += words[i]
        setMessages((prev) => prev.map(m => 
            m.id === newMessageId ? { ...m, content: currentText } : m
        ))
        // Small delay to simulate streaming UX (20ms)
        await new Promise(r => setTimeout(r, 20))
    }
  }

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
      // Send to the real OpenClaw bridge
      const response = await fetch("/api/bridge/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          user_id: getUserId(),
          agent_id: "dhan-sarthi",
          session_id: sessionId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Store session_id for conversation continuity
        if (data.session_id) {
          setSessionId(data.session_id)
        }

        const aiResponse = data.response || "I'm processing your request. Please try again."
        const agentId = data.agent || "dhan-sarthi"

        await simulateStreaming(aiResponse, agentId)


        saveChat(query, aiResponse, agentId)
      } else {
        // Fallback: try the old dhan-sarthi route endpoint
        const fallbackResponse = await fetch("/api/dhan-sarthi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        })

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          const fallbackText = fallbackData.response || fallbackData.greeting || 
            "I'm having trouble connecting to the AI. Please try again shortly."
          
          setMessages((prev) => [...prev, {
            id: String(Date.now() + 1),
            role: "assistant",
            content: fallbackText,
            agent: "dhan-sarthi",
            timestamp: new Date(),
          }])
          saveChat(query, fallbackText, "dhan-sarthi")
        } else {
          throw new Error("Both bridge and fallback failed")
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [...prev, { 
        id: String(Date.now() + 1), 
        role: "assistant", 
        content: "Sorry, I encountered an error connecting to the AI. Please ensure the backend is running and try again.", 
        timestamp: new Date() 
      }])
    } finally {
      setLoading(false)
    }
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
            <Badge className="ml-1 bg-emerald-500/20 text-emerald-400 text-xs">AI Powered</Badge>
            <Badge className={`ml-1 ${backendStatus === 'online' ? 'bg-green-500/20 text-green-400' : backendStatus === 'offline' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
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
                <span>DhanSarthi is thinking...</span>
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
              placeholder="Ask anything about finance — taxes, FIRE, stocks, legal, couples..."
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
