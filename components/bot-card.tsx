"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Zap, Trash2, Code, Loader2, AlertCircle } from "lucide-react"
import { EditBotModal } from "./edit-bot-modal"
import { DeleteConfirmModal } from "./delete-confirm-modal"
import { format } from "date-fns"

interface Bot {
  id: number
  name: string
  token: string | null
  created_at: string
  updated_at: string
  status: string | null
  pic_url: string | null
}

interface BotCardProps {
  bot: Bot
  apiKey: string
  onUpdate: () => void
}

export function BotCard({ bot, apiKey, onUpdate }: BotCardProps) {
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [error, setError] = useState("")

  const isRunning = bot.status === "works"

  const handleToggleStatus = async () => {
    setLoadingStatus(true)
    setError("")

    try {
      const response = await fetch(`https://appapi.bots.business/v2/bots/${bot.id}/status?api_key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: isRunning ? "start_stopping" : "start_launch",
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to update bot status")
        setLoadingStatus(false)
        return
      }

      setLoadingStatus(false)
      onUpdate()
    } catch (err) {
      setError("Failed to update bot status")
      setLoadingStatus(false)
    }
  }

  const handleDelete = async () => {
    setLoadingDelete(true)
    setError("")

    try {
      const response = await fetch(`https://appapi.bots.business/v2/bots/${bot.id}?api_key=${apiKey}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to delete bot")
        setLoadingDelete(false)
        return
      }

      setLoadingDelete(false)
      onUpdate()
    } catch (err) {
      setError("Failed to delete bot")
      setLoadingDelete(false)
    }
  }

  return (
    <>
      <Card className="p-6 hover:border-blue-500/50 transition-colors">
        {/* Bot Info */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold truncate">{bot.name}</h3>
            <div
              className={`w-3 h-3 rounded-full ${
                isRunning ? "bg-green-500 shadow-lg shadow-green-500/50" : "bg-red-500 shadow-lg shadow-red-500/50"
              }`}
              title={isRunning ? "Running" : "Stopped"}
            />
          </div>
          <p className="text-xs text-muted-foreground">ID: {bot.id}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Created {format(new Date(bot.created_at), "MMM d, yyyy")}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded mb-4">
            <AlertCircle className="w-3 h-3 text-destructive flex-shrink-0" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)} className="gap-1">
            <Edit2 className="w-3 h-3" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/app/bots/${bot.id}/commands`)}
            className="gap-1"
          >
            <Code className="w-3 h-3" />
            <span className="hidden sm:inline">Commands</span>
          </Button>
          <Button
            variant={isRunning ? "destructive" : "default"}
            size="sm"
            onClick={handleToggleStatus}
            disabled={loadingStatus}
            className="gap-1"
          >
            {loadingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            <span className="hidden sm:inline">{isRunning ? "Stop" : "Start"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            disabled={loadingDelete}
            className="gap-1 text-destructive hover:text-destructive bg-transparent"
          >
            {loadingDelete ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </Card>

      {showEditModal && (
        <EditBotModal
          bot={bot}
          apiKey={apiKey}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false)
            onUpdate()
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          botName={bot.name}
          onConfirm={() => {
            setShowDeleteModal(false)
            handleDelete()
          }}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={loadingDelete}
        />
      )}
    </>
  )
}
