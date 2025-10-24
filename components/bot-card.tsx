"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, Code, Loader2, AlertCircle, Play, Square, Calendar } from "lucide-react"
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

// ---- ENV CONFIG ----
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://appapi.bots.business/v2"
const apiUrl = (path: string) => `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`

export function BotCard({ bot, apiKey, onUpdate }: BotCardProps) {
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [error, setError] = useState("")
  const [showError, setShowError] = useState(false)

  const isRunning = bot.status === "works"

  useEffect(() => {
    if (error) {
      setShowError(true)
      const timer = setTimeout(() => {
        setShowError(false)
        setError("")
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleToggleStatus = async () => {
    setLoadingStatus(true)
    setError("")

    try {
      const response = await fetch(
        apiUrl(`/bots/${bot.id}/status?api_key=${encodeURIComponent(apiKey)}`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: isRunning ? "start_stopping" : "start_launch" }),
        }
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError((data as any).error || "Failed to update bot status")
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
      const response = await fetch(
        apiUrl(`/bots/${bot.id}?api_key=${encodeURIComponent(apiKey)}`),
        { method: "DELETE" }
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError((data as any).error || "Failed to delete bot")
        setLoadingDelete(false)
        return
      }

      setLoadingDelete(false)
      onUpdate()
      setShowDeleteModal(false)
    } catch (err) {
      setError("Failed to delete bot")
      setLoadingDelete(false)
    }
  }

  const getStatusColor = () => {
    return isRunning
      ? "bg-green-500/20 text-green-600 border-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
      : "bg-red-500/20 text-red-600 border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
  }

  const getStatusIcon = () => {
    return isRunning ? <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> : <div className="w-2 h-2 rounded-full bg-red-500" />
  }

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-border hover:border-primary/30 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6">
          {/* Header with Bot Info */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-bold text-foreground text-xl leading-tight truncate">{bot.name}</h3>
                <Badge variant="outline" className={`${getStatusColor()} text-xs font-medium px-2 py-1 border flex items-center gap-1`}>
                  {getStatusIcon()}
                  {isRunning ? "Running" : "Stopped"}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span>ID: {bot.id}</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Created {format(new Date(bot.created_at), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {showError && error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded mb-4 animate-in slide-in-from-top duration-200">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive flex-1">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)} className="gap-2 cursor-pointer h-10 border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200">
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </Button>

            <Button variant="outline" size="sm" onClick={() => router.push(`/app/bots/${bot.id}/commands`)} className="gap-2 cursor-pointer h-10 border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200">
              <Code className="w-4 h-4" />
              <span>Commands</span>
            </Button>

            <Button
              variant={isRunning ? "outline" : "default"}
              size="sm"
              onClick={handleToggleStatus}
              disabled={loadingStatus}
              className={`gap-2 cursor-pointer h-10 transition-all duration-200 ${
                isRunning
                  ? "border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30"
              }`}
            >
              {loadingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? "Stop" : "Start"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              disabled={loadingDelete}
              className="gap-2 cursor-pointer h-10 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
            >
              {loadingDelete ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span>Delete</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
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
          title="Delete Bot?"
          description={
            <>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{bot.name}"</span>? This action cannot be undone.
            </>
          }
          confirmText="Delete Bot"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={loadingDelete}
        />
      )}
    </>
  )
}
