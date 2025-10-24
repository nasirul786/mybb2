"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Loader2, Search, X } from "lucide-react"
import { LibraryCard } from "@/components/library-card"
import { LibraryReadmeModal } from "@/components/library-readme-modal"
import { InstalledLibsModal } from "@/components/installed-libs-modal"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import Lottie from "lottie-react"

export type StoreLibrary = {
  id: number
  name: string
  description: string
  img_url: string
  installations_count: number
  created_at: string
  updated_at: string
}

export type InstalledLibrary = {
  id: number
  name: string
  published: boolean
  img_url: string
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

async function fetchAllLibraries(): Promise<StoreLibrary[]> {
  try {
    const res = await apiFetch("/store/libs")
    return (await res.json()) as StoreLibrary[]
  } catch (e) {
    console.error("[fetchAllLibraries] Error:", e)
    return []
  }
}

async function fetchInstalledLibraries(botId: string): Promise<InstalledLibrary[]> {
  try {
    const res = await apiFetch(`/bots/${botId}/libs`)
    return (await res.json()) as InstalledLibrary[]
  } catch (e) {
    console.error("[fetchInstalledLibraries] Error:", e)
    return []
  }
}

async function installLibrary(botId: string, libId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiFetch(`/bots/${botId}/libs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lib_id: libId }),
    })

    const resultText = await res.text()
    if (resultText === "true") return { success: true }

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

async function deleteLibrary(botId: string, libId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiFetch(`/bots/${botId}/libs/${libId}`, { method: "DELETE" })
    const resultText = await res.text()

    if (resultText === "true") return { success: true }
    return { success: false, error: "Delete operation failed" }
  } catch (e) {
    console.error("[deleteLibrary] Error:", e)
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export default function LibrariesPage() {
  const params = useParams()
  const botId = params.id as string

  const [allLibraries, setAllLibraries] = useState<StoreLibrary[]>([])
  const [installedLibraries, setInstalledLibraries] = useState<InstalledLibrary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [readmeModalOpen, setReadmeModalOpen] = useState(false)
  const [installedModalOpen, setInstalledModalOpen] = useState(false)
  const [selectedLib, setSelectedLib] = useState<StoreLibrary | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<InstalledLibrary | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [emptyAnimationData, setEmptyAnimationData] = useState<any>(null)

  const searchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    fetch("/lottie/empty-bots.json")
      .then((response) => response.json())
      .then((data) => setEmptyAnimationData(data))
      .catch((error) => console.error("Error loading Lottie animation:", error))
  }, [])

  const loadAllData = useCallback(async () => {
    setIsLoading(true)
    const [allLibs, installedLibs] = await Promise.all([fetchAllLibraries(), fetchInstalledLibraries(botId)])
    setAllLibraries(allLibs)
    setInstalledLibraries(installedLibs)
    setIsLoading(false)
  }, [botId])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

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

  const installedLibIds = useMemo(() => new Set(installedLibraries.map((lib) => lib.id)), [installedLibraries])

  const filteredLibraries = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return allLibraries
    return allLibraries.filter(
      (lib) => lib.name.toLowerCase().includes(q) || lib.description.toLowerCase().includes(q)
    )
  }, [allLibraries, search])

  const handleInstall = async (libId: number) => {
    const result = await installLibrary(botId, libId)
    if (result.success) {
      const installedLibs = await fetchInstalledLibraries(botId)
      setInstalledLibraries(installedLibs)
      return true
    } else {
      console.error("Failed to install:", result.error)
      alert(`Install failed: ${result.error}`)
      return false
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return
    setIsDeleting(true)
    const result = await deleteLibrary(botId, deleteConfirm.id)
    if (result.success) {
      setInstalledLibraries((prev) => prev.filter((lib) => lib.id !== deleteConfirm.id))
      setDeleteConfirm(null)
    } else {
      console.error("Failed to delete:", result.error)
      alert(`Delete failed: ${result.error}`)
    }
    setIsDeleting(false)
  }

  const handleReadMore = (lib: StoreLibrary) => {
    setSelectedLib(lib)
    setReadmeModalOpen(true)
  }

  const EmptyState = () => (
    <div className="text-center py-20 text-muted-foreground flex flex-col items-center justify-center space-y-6">
      {emptyAnimationData ? (
        <div className="w-64 h-64 mx-auto mb-4 -mt-4">
          <Lottie
            animationData={emptyAnimationData}
            loop
            autoplay
            className="w-full h-full"
            style={{ background: "transparent" }}
          />
        </div>
      ) : (
        <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-4 border border-border">
          <Package className="w-12 h-12 text-muted-foreground" />
        </div>
      )}
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-foreground">
          {allLibraries.length === 0 ? "Store is Empty" : "No libraries found"}
        </h3>
        <p className="text-muted-foreground max-w-sm text-lg">
          {allLibraries.length === 0
            ? "There are no libraries in the store right now."
            : "Try adjusting your search to find what you're looking for."}
        </p>
      </div>
    </div>
  )

  return (
    <main className="absolute inset-0 flex flex-col min-w-0 pt-25">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-3xl font-bold">Library Store</h2>
            <Button variant="outline" onClick={() => setInstalledModalOpen(true)}>
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

        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredLibraries.length === 0 ? (
            <EmptyState />
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
        </div>
      </div>

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

      {deleteConfirm && (
        <DeleteConfirmModal
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          title="Delete Library?"
          description={
            <>
              Are you sure you want to delete the{" "}
              <span className="font-semibold text-foreground">"{deleteConfirm.name}"</span>? This may break commands
              that depend on it.
            </>
          }
          confirmText="Delete"
        />
      )}
    </main>
  )
}