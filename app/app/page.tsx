"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AlertCircle, Loader2, Code2 } from "lucide-react"

export default function LoginPage() {
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedApiKey = localStorage.getItem("mybb_api_key")
    if (storedApiKey && !autoLoginAttempted) {
      setAutoLoginAttempted(true)
      handleLogin(storedApiKey)
    }
  }, [autoLoginAttempted])

  const handleLogin = async (keyToUse: string) => {
    if (!keyToUse.trim()) {
      setError("Please enter your API key")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`https://appapi.bots.business/v2/user?api_key=${encodeURIComponent(keyToUse)}`)
      const data = await response.json()

      if (!response.ok || data.errors) {
        setError("Invalid API key. Please check and try again.")
        setLoading(false)
        return
      }

      localStorage.setItem("mybb_api_key", keyToUse)
      localStorage.setItem("mybb_user", JSON.stringify(data))
      router.push("/app/bots")
    } catch (err) {
      setError("Failed to connect. Please check your API key.")
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin(apiKey)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            MyBB
          </span>
        </div>

        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-2 text-center">Welcome Back</h1>
          <p className="text-muted-foreground text-center mb-6">
            Sign in with your API key to manage your Telegram bots
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <Input
                type="text"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={loading}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your API key is stored locally and never sent to our servers
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-4">
              Don't have an API key?{" "}
              <a
                href="https://bots.business"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Get one from Bots.Business
              </a>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            Made with ❤️ by{" "}
            <a
              href="https://t.me/nirjon"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              i am cc
            </a>
          </p>
          <p className="mt-2">No backend. No data storage. Everything is secure.</p>
        </div>
      </div>
    </div>
  )
}
