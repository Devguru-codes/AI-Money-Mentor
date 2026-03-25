"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Moon, Sun, User, LogOut } from "lucide-react"
import { toast, Toaster } from "sonner"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedLoggedIn = localStorage.getItem("isLoggedIn")
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null

    if (storedUser) setUser(JSON.parse(storedUser))
    if (storedLoggedIn === "true") setIsLoggedIn(true)
    if (storedTheme) setTheme(storedTheme)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle("dark", theme === "dark")
      localStorage.setItem("theme", theme)
    }
  }, [theme, mounted])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("isLoggedIn")
    setUser(null)
    setIsLoggedIn(false)
    toast.success("Logged out successfully")
    window.location.href = "/"
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  if (!mounted) return null

  return (
    <>
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="hidden sm:inline">AI Money Mentor</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/agents" className="text-sm hover:text-primary transition-colors hidden sm:block">
              Agents
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/profile" className="text-sm hover:text-primary transition-colors flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">{user?.name || "Profile"}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Login
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </nav>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="border-t border-border bg-card py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>⚠️ SEBI Disclaimer: This is for educational purposes only. Not financial advice.</p>
          <p className="mt-1">© 2025 AI Money Mentor | ET AI Hackathon</p>
        </div>
      </footer>
      <Toaster richColors position="top-right" />
    </>
  )
}
