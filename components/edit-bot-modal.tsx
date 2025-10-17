"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, AlertCircle, X } from "lucide-react"

interface Bot {
  id: number
  name: string
  token: string | null
}

interface EditBotModalProps {
  bot: Bot
  apiKey: string
  onClose: () => void
  onSuccess: () => void
}

export function EditBotModal({ bot, apiKey, onClose, onSuccess }: EditBotModalProps) {
  const [name, setName] = useState(bot.name)
  const [token, setToken] = useState(bot.token || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim() || !token.trim()) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`https://appapi.bots.business/v2/bots/${bot.id}?api_key=${apiKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), token: token.trim() }),
      })

      const data = await response.json()

      if (!response.ok || data.errors) {
        setError(data.error || data.errors?.[0] || "Failed to update bot")
        setLoading(false)
        return
      }

      onSuccess()
    } catch (err) {
      setError("Failed to update bot")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Edit Bot</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bot Name</label>
              <Input
                placeholder="My Awesome Bot"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bot Token</label>
              <Input
                placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={loading}
                type="text"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Bot"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
