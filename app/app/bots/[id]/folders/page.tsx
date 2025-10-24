"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { Loader2, Trash2, Plus, Folder } from "lucide-react"

type CommandsFolder = {
  id: number
  title: string
  bot_id: number
  created_at: string
  updated_at: string
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
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res
}

async function fetchFolders(botId: string): Promise<CommandsFolder[]> {
  try {
    const res = await apiFetch(`/bots/${botId}/commands_folders`)
    return (await res.json()) as CommandsFolder[]
  } catch (e) {
    console.error("[fetchFolders] Error:", e)
    return []
  }
}

async function createFolder(botId: string, title: string): Promise<{ data?: CommandsFolder; error?: string }> {
  try {
    const res = await apiFetch(`/bots/${botId}/commands_folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
    const data = await res.json()
    return { data: data as CommandsFolder }
  } catch (e) {
    console.error("[createFolder] Error:", e)
    return { error: e instanceof Error ? e.message : String(e) }
  }
}

async function deleteFolder(botId: string, folderId: number): Promise<{ success: boolean; error?: string }> {
  try {
    await apiFetch(`/bots/${botId}/commands_folders/${folderId}`, {
      method: "DELETE",
    })
    return { success: true }
  } catch (e) {
    console.error("[deleteFolder] Error:", e)
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export default function FoldersPage() {
  const params = useParams()
  const botId = params.id as string

  const [folders, setFolders] = useState<CommandsFolder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newFolderTitle, setNewFolderTitle] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<CommandsFolder | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadFolders = useCallback(async () => {
    setIsLoading(true)
    const fetchedFolders = await fetchFolders(botId)
    fetchedFolders.sort((a, b) => a.title.localeCompare(b.title))
    setFolders(fetchedFolders)
    setIsLoading(false)
  }, [botId])

  useEffect(() => {
    loadFolders()
  }, [loadFolders])

  const handleCreateFolder = async () => {
    if (!newFolderTitle.trim()) {
      setCreateError("Folder title cannot be empty.")
      return
    }
    setCreateError("")
    setIsCreating(true)

    const result = await createFolder(botId, newFolderTitle.trim())
    if (result.data) {
      setFolders((prev) => [...prev, result.data!].sort((a, b) => a.title.localeCompare(b.title)))
      setNewFolderTitle("")
    } else {
      setCreateError(result.error || "Failed to create folder.")
    }
    setIsCreating(false)
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return
    setIsDeleting(true)

    const result = await deleteFolder(botId, deleteConfirm.id)
    if (result.success) {
      setFolders((prev) => prev.filter((f) => f.id !== deleteConfirm.id))
      setDeleteConfirm(null)
    } else {
      alert(`Delete failed: ${result.error}`)
      console.error("Delete failed:", result.error)
    }
    setIsDeleting(false)
  }

  return (
    <main className="absolute inset-0 flex flex-col min-w-0 pt-25">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">Command Folders</h2>

        <Card className="p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold mb-3">Create New Folder</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                value={newFolderTitle}
                onChange={(e) => setNewFolderTitle(e.target.value)}
                placeholder="Enter folder title..."
                disabled={isCreating}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                className="w-full"
              />
            </div>
            <Button
              onClick={handleCreateFolder}
              disabled={isCreating}
              className="sm:w-auto w-full"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </div>
          {createError && <p className="text-sm text-destructive mt-2">{createError}</p>}
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : folders.length === 0 ? (
          <Card className="p-8 text-center">
            <Folder className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No folders created yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create your first folder to organize your commands.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {folders.map((folder) => (
              <Card key={folder.id} className="p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Folder className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium truncate text-base">{folder.title}</span>
                  </div>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteConfirm(folder)}
                    className="gap-2 flex-shrink-0 whitespace-nowrap"
                    aria-label={`Delete folder ${folder.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <DeleteConfirmModal
          title="Delete Folder?"
          description={
            <>
              Are you sure you want to delete the folder{" "}
              <span className="font-semibold text-foreground">"{deleteConfirm.title}"</span>? Commands inside this
              folder will <strong>not</strong> be deleted but will lose their folder assignment. This action cannot be
              undone.
            </>
          }
          confirmText="Delete Folder"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm(null)}
          isLoading={isDeleting}
        />
      )}
    </main>
  )
}