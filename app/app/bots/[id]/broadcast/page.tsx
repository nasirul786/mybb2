"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { useToast } from "@/components/ui/use-toast"
import { BroadcastTaskItem } from "@/components/broadcast-task-item"
import { Loader2, Megaphone } from "lucide-react"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

export type BroadcastTask = {
  id: number
  cur_position: number
  total: number | null
  progress: number | null
  scope_code: number
  status_code: number
  bot_id: number
  last_executed_at: string | null
  errors_count: number | null
  bjs_action: {
    name: string
    params?: {
      command?: string
      [key: string]: any
    }
  } | null
  created_at: string
  updated_at: string
  scope: string
  status: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://appapi.bots.business/v2"
const API_KEY_STORAGE_KEY = process.env.NEXT_PUBLIC_API_KEY_STORAGE_KEY || "bb_api_key"
const apiUrl = (p: string) => `${API_BASE}${p.startsWith("/") ? p : `/${p}`}`

async function apiFetch(path: string, options: RequestInit = {}) {
  const apiKey = typeof window !== "undefined" ? localStorage.getItem(API_KEY_STORAGE_KEY) : null
  if (!apiKey) {
    if (typeof window !== "undefined") window.location.href = "/app"
    throw new Error("No API key")
  }
  const sep = path.includes("?") ? "&" : "?"
  const url = apiUrl(`${path}${sep}api_key=${encodeURIComponent(apiKey)}`)
  const res = await fetch(url, { cache: "no-store", ...options })
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(API_KEY_STORAGE_KEY)
      window.location.href = "/app"
    }
    throw new Error("Unauthorized")
  }

  if (options.method === "DELETE" && res.status === 204) {
    return res
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res
}

async function fetchBroadcastTasks(botId: string): Promise<BroadcastTask[]> {
  try {
    const res = await apiFetch(`/bots/${botId}/broadcaster_tasks`)
    return (await res.json()) as BroadcastTask[]
  } catch (e) {
    console.error("[fetchBroadcastTasks] Error:", e)
    return []
  }
}

async function pauseTask(botId: string, taskId: number): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await apiFetch(`/bots/${botId}/broadcaster_tasks/${taskId}/pause`, {
      method: "POST",
    })
    const data = await res.json()
    return { success: true, message: data.message }
  } catch (e) {
    console.error("[pauseTask] Error:", e)
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

async function resumeTask(botId: string, taskId: number): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await apiFetch(`/bots/${botId}/broadcaster_tasks/${taskId}/resume`, {
      method: "POST",
    })
    const data = await res.json()
    return { success: true, message: data.message }
  } catch (e) {
    console.error("[resumeTask] Error:", e)
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

async function deleteTask(botId: string, taskId: number): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await apiFetch(`/bots/${botId}/broadcaster_tasks/${taskId}`, {
      method: "DELETE",
    })
    if (res.status === 204) return { success: true, message: "Task deleted successfully" }
    const data = await res.json()
    return { success: true, message: data.message }
  } catch (e) {
    console.error("[deleteTask] Error:", e)
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export default function BroadcastPage() {
  const params = useParams()
  const botId = params.id as string
  const { toast } = useToast()

  const [tasks, setTasks] = useState<BroadcastTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<BroadcastTask | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [emptyAnimationData, setEmptyAnimationData] = useState<any>(null)

  const loadTasks = useCallback(async () => {
    if (!botId) return
    setIsLoading(true)
    const fetchedTasks = await fetchBroadcastTasks(botId)
    setTasks(fetchedTasks)
    setIsLoading(false)
  }, [botId])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  useEffect(() => {
    fetch("/lottie/empty-bots.json")
      .then((r) => r.json())
      .then(setEmptyAnimationData)
      .catch(() => {})
  }, [])

  const handleToggleStatus = async (taskId: number, currentStatus: string): Promise<boolean> => {
    const statusLower = currentStatus?.toLowerCase()
    const isPausable = ["running", "active", "new", "in progress"].includes(statusLower)
    const action = isPausable ? pauseTask : resumeTask
    const actionName = isPausable ? "pause" : "resume"
    const actionGerund = isPausable ? "Pausing" : "Resuming"

    const result = await action(botId, taskId)

    if (result.success) {
      toast({ title: "Success", description: result.message || `Task ${actionName}d.` })
      await loadTasks()
      return true
    } else {
      toast({
        variant: "destructive",
        title: `${actionGerund} Failed`,
        description: result.error || `Could not ${actionName} task.`,
      })
      console.error(`Failed to ${actionName} task:`, result.error)
      await loadTasks()
      return false
    }
  }

  const handleDeleteRequest = (task: BroadcastTask) => {
    setDeleteConfirm(task)
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return
    setIsDeleting(true)
    const result = await deleteTask(botId, deleteConfirm.id)
    if (result.success) {
      setTasks((prev) => prev.filter((t) => t.id !== deleteConfirm.id))
      toast({ title: "Success", description: result.message || "Broadcast task deleted." })
      setDeleteConfirm(null)
    } else {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: result.error || "Could not delete task.",
      })
      console.error("Delete failed:", result.error)
    }
    setIsDeleting(false)
  }

  return (
    <main className="absolute inset-0 flex flex-col min-w-0 pt-25">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-3xl font-bold">Broadcast Tasks</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 px-6">
            {emptyAnimationData ? (
              <div className="w-64 h-64 mx-auto mb-4">
                <Lottie
                  animationData={emptyAnimationData}
                  loop
                  autoplay
                  className="w-full h-full"
                  style={{ background: "transparent" }}
                />
              </div>
            ) : (
              <Megaphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            )}
            <h2 className="text-xl font-semibold mt-2 mb-1">No Broadcast Tasks</h2>
            <p className="text-muted-foreground max-w-xs">
              You haven't created any broadcast tasks yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <BroadcastTaskItem
                key={task.id}
                task={task}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <DeleteConfirmModal
          title="Delete Broadcast Task?"
          description={
            <>
              Are you sure you want to delete this broadcast task (ID: {deleteConfirm.id})? If it's running, it might
              stop abruptly. This action cannot be undone.
            </>
          }
          confirmText="Delete Task"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm(null)}
          isLoading={isDeleting}
        />
      )}
    </main>
  )
}