"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Terminal,
  Wrench,
  MessageSquare,
  Settings,
  Package,
  Folder,
  Megaphone,
  AlertTriangle,
  Loader2,
  Search,
  X,
  Book,
  Trash2, LayoutDashboard
} from "lucide-react"
import { LibraryCard } from "@/components/library-card"
import { LibraryReadmeModal } from "@/components/library-readme-modal"
import { InstalledLibsModal } from "@/components/installed-libs-modal"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"

const TABS = [
  { id: "commands", label: "Commands", icon: Terminal },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "chats", label: "Chats", icon: MessageSquare },
  { id: "properties", label: "Properties", icon: Settings },
  { id: "libraries", label: "Libraries", icon: Package },
  { id: "folders", label: "Folders", icon: Folder },
  { id: "admin-panel", label: "Admin Panel", icon: LayoutDashboard },
  { id: "broadcast", label: "Broadcast", icon: Megaphone },
  { id: "errors", label: "Errors", icon: AlertTriangle },
]

// --- Types defined directly in the file as requested ---

// This is the shape of a library from the main store list
export type StoreLibrary = {
  id: number
  name: string
  description: string
  img_url: string
  installations_count: number
  created_at: string
  updated_at: string
}

// This is the shape of a library that is installed on a bot
export type InstalledLibrary = {
  id: number
  name: string
  published: boolean
  img_url: string
}

const BASE_URL = "https://appapi.bots.business/v2"

// --- API functions defined in the page file ---

/**
 * Fetches the list of all available libraries from the store.
 */
async function fetchAllLibraries(apiKey: string): Promise<StoreLibrary[]> {
  try {
    const url = `${BASE_URL}/store/libs?api_key=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Failed to fetch libraries: ${res.statusText}`)
    }
    return (await res.json()) as StoreLibrary[]
  } catch (e) {
    console.error("[fetchAllLibraries] Error:", e)
    return []
  }
}

/**
 * Fetches the list of libraries installed for a specific bot.
 */
async function fetchInstalledLibraries(
  botId: string,
  apiKey: string
): Promise<InstalledLibrary[]> {
  try {
    const url = `${BASE_URL}/bots/${botId}/libs?api_key=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Failed to fetch installed libraries: ${res.statusText}`)
    }
    return (await res.json()) as InstalledLibrary[]
  } catch (e) {
    console.error("[fetchInstalledLibraries] Error:", e)
    return []
  }
}

/**
 * Installs a library to a specific bot.
 */
async function installLibrary(
  botId: string,
  libId: number,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${BASE_URL}/bots/${botId}/libs?api_key=${apiKey}`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lib_id: libId }),
    })

    const resultText = await res.text()

    if (res.ok && resultText === "true") {
      return { success: true }
    }

    // Handle non-OK or error JSON responses
    try {
      const json = JSON.parse(resultText)
      return { success: false, error: json.error || "Failed to install" }
    } catch {
      return { success: false, error: "An unknown error occurred" }
    }
  } catch (e) {
    console.error("[installLibrary] Error:", e)
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

/**
 * Deletes (uninstalls) a library from a specific bot.
 */
async function deleteLibrary(
  botId: string,
  libId: number,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${BASE_URL}/bots/${botId}/libs/${libId}?api_key=${apiKey}`
    const res = await fetch(url, { method: "DELETE" })

    const resultText = await res.text()

    if (res.ok && resultText === "true") {
      return { success: true }
    }

    return { success: false, error: "Delete operation failed" }
  } catch (e) {
    console.error("[deleteLibrary] Error:", e)
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// --- Page Component ---

export default function LibrariesPage() {
  const params = useParams()
  const router = useRouter()
  const botId = params.id as string

  const [allLibraries, setAllLibraries] = useState<StoreLibrary[]>([])
  const [installedLibraries, setInstalledLibraries] = useState<
    InstalledLibrary[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [readmeModalOpen, setReadmeModalOpen] = useState(false)
  const [installedModalOpen, setInstalledModalOpen] = useState(false)
  const [selectedLib, setSelectedLib] = useState<StoreLibrary | null>(null)

  const [deleteConfirm, setDeleteConfirm] = useState<InstalledLibrary | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)

  const searchRef = useRef<HTMLInputElement | null>(null)

  const apiKey =
    typeof window !== "undefined" ? localStorage.getItem("mybb_api_key") : null

  // Load all data on mount
  useEffect(() => {
    if (!apiKey) {
      setIsLoading(false)
      // Maybe redirect to login or show error
      return
    }
    loadAllData()
  }, [botId, apiKey])

  // Add useEffect for Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const loadAllData = async () => {
    if (!apiKey) return
    setIsLoading(true)
    const [allLibs, installedLibs] = await Promise.all([
      fetchAllLibraries(apiKey),
      fetchInstalledLibraries(botId, apiKey),
    ])
    setAllLibraries(allLibs)
    setInstalledLibraries(installedLibs)
    setIsLoading(false)
  }

  // Create a Set of installed lib IDs for quick lookup
  const installedLibIds = useMemo(() => {
    return new Set(installedLibraries.map((lib) => lib.id))
  }, [installedLibraries])

  // Filter libraries based on search
  const filteredLibraries = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return allLibraries
    return allLibraries.filter(
      (lib) =>
        lib.name.toLowerCase().includes(q) ||
        lib.description.toLowerCase().includes(q)
    )
  }, [allLibraries, search])

  // --- Handlers ---

  const handleInstall = async (libId: number) => {
    if (!apiKey) return false
    const result = await installLibrary(botId, libId, apiKey)
    if (result.success) {
      // Refresh installed list
      const installedLibs = await fetchInstalledLibraries(botId, apiKey)
      setInstalledLibraries(installedLibs)
      return true
    } else {
      console.error("Failed to install:", result.error)
      alert(`Install failed: ${result.error}`) // Simple alert for now
      return false
    }
  }

  // This function now performs the delete after confirmation
  const handleConfirmDelete = async () => {
    if (!apiKey || !deleteConfirm) return
    setIsDeleting(true)
    const result = await deleteLibrary(botId, deleteConfirm.id, apiKey)
    if (result.success) {
      // Refresh list on success
      setInstalledLibraries((prev) =>
        prev.filter((lib) => lib.id !== deleteConfirm.id)
      )
      setDeleteConfirm(null)
    } else {
      console.error("Failed to delete:", result.error)
      alert(`Delete failed: ${result.error}`) // Simple alert for now
    }
    setIsDeleting(false)
  }

  const handleReadMore = (lib: StoreLibrary) => {
    setSelectedLib(lib)
    setReadmeModalOpen(true)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation (using z-20 from our previous fix) */}
      <div className="sticky top-0 z-20 border-b bg-card/60 backdrop-blur-xl">
        <div className="flex gap-1 p-2 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                onClick={() => {
                  router.push(`/app/bots/${botId}/${tab.id}`)
                }}
                variant={tab.id === "libraries" ? "default" : "outline"}
                size="sm"
                className="gap-2 cursor-pointer whitespace-nowrap"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* This div is now the main scroller */}
      <div className="flex-1 overflow-y-auto">
        {/* Header & Search moved INSIDE the scroller */}
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-3xl font-bold">Library Store</h2>
            <Button
              variant="outline"
              onClick={() => setInstalledModalOpen(true)}
            >
              <Package className="w-4 h-4 mr-2" />
              Installed Libraries ({installedLibraries.length})
            </Button>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search libraries by name or description... (Ctrl+K)"
              className="pl-9 pr-10 h-10 bg-card focus:ring-2 focus:ring-primary/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Content grid is now inside the scroller, with its own padding */}
        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLibraries.map((lib) => (
                <LibraryCard
                  key={lib.id}
                  library={lib}
                  isInstalled={installedLibIds.has(lib.id)}
                  onInstall={handleInstall}
                  onReadMore={handleReadMore}
                />
              ))}
            </div>
          )}
          {!isLoading && filteredLibraries.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p>No libraries found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <LibraryReadmeModal
        isOpen={readmeModalOpen}
        onClose={() => setReadmeModalOpen(false)}
        library={selectedLib}
      />

      <InstalledLibsModal
        isOpen={installedModalOpen}
        onClose={() => setInstalledModalOpen(false)}
        installedLibraries={installedLibraries}
        onDelete={setDeleteConfirm}
      />

      {/* FIX: Replaced manual modal with the reusable component */}
      {deleteConfirm && (
        <DeleteConfirmModal
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          title="Delete Library?"
          description={
            <>
              Are you sure you want to delete the{" "}
              <span className="font-semibold text-foreground">
                "{deleteConfirm.name}"
              </span>
              ? This may break commands that depend on it.
            </>
          }
          confirmText="Delete"
        />
      )}
    </div>
  )
}