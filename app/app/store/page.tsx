"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import dynamic from "next/dynamic"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Github, ExternalLink, Download, X, Search, Loader2 } from "lucide-react"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

type StoreBot = {
  id: number
  parent_bot_id: number
  name: string
  description: string
  published: boolean
  installations_count: number
  created_at: string
  updated_at: string
  img_url: string | null
  repository_url: string | null
  price: number | null
  is_protected: boolean | null
}

type Collection = {
  id: number
  title: string
  description: string
  created_at: string
  updated_at: string
  five_store_bots: StoreBot[]
}

export default function StorePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [apiKey, setApiKey] = useState<string>("")
  const [query, setQuery] = useState<string>("")
  const [emptyAnimationData, setEmptyAnimationData] = useState<any>(null)
  const [installingBotId, setInstallingBotId] = useState<number | null>(null)
  const [installedBotId, setInstalledBotId] = useState<number | null>(null)
  const [showInstalledModal, setShowInstalledModal] = useState(false)
  const searchRef = useRef<HTMLInputElement | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false)
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    try {
      const k = localStorage.getItem("mybb_api_key")
      if (!k) {
        window.location.href = "/app"
        return
      }
      setApiKey(k)
    } catch {
      window.location.href = "/app"
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        const res = await fetch("/lottie/empty-bots.json", { signal: controller.signal, cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        setEmptyAnimationData(data)
      } catch {}
    })()
    return () => controller.abort()
  }, [])

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

  const { data, isLoading, error } = useSWR<Collection[]>(
    apiKey ? `https://appapi.bots.business/v2/store/collections?api_key=${encodeURIComponent(apiKey)}` : null,
    async (url: string) => {
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) throw new Error(`Failed to fetch collections: ${res.status}`)
      return res.json()
    },
    { revalidateOnFocus: false, errorRetryCount: 2 }
  )

  const filteredCollections = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data
      .map((c) => ({
        ...c,
        five_store_bots: (c.five_store_bots || []).filter((b) => {
          const hay = `${b.name} ${b.description ?? ""} ${b.repository_url ?? ""}`.toLowerCase()
          return hay.includes(q)
        }),
      }))
      .filter((c) => c.five_store_bots.length > 0)
  }, [data, query])

  async function handleInstall(bot: StoreBot) {
    if (!apiKey) {
      toast({ title: "Missing API key", description: "Login again.", variant: "destructive" })
      return
    }
    setInstallingBotId(bot.id)
    try {
      const url = `https://appapi.bots.business/v2/store/bots/${bot.id}/install?api_key=${encodeURIComponent(apiKey)}`
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
      if (!res.ok) {
        const msg = await safeText(res)
        throw new Error(msg || `Install failed: ${res.status}`)
      }
      const installed = await res.json()
      setInstalledBotId(installed.id)
      setShowInstalledModal(true)
    } catch (e: any) {
      toast({ title: "Install failed", description: e?.message ?? "Unknown error", variant: "destructive" })
    } finally {
      setInstallingBotId(null)
    }
  }

  function openGithub(url: string | null) {
    if (!url) return
    window.open(url, "_blank", "noopener,noreferrer")
  }

  function handleDemo(bot: StoreBot) {
    const url = `https://t.me/${bot.name}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const isFetching = !!apiKey && !data && !error
  const showEmpty = query.trim() !== "" && !!data && data.length > 0 && filteredCollections.length === 0

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Demo Store</h1>
            <p className="text-muted-foreground">Install ready-made bots or inspect their code.</p>
          </div>

          <div className="relative group w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
            <Input
              ref={searchRef}
              placeholder="Search bots, descriptions, repos…  (Ctrl/Cmd + K)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-10 h-10 bg-card focus:ring-2 focus:ring-primary/20"
            />
            {!!query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {isLoading || isFetching ? (
            <CenterSpinner />
          ) : error ? (
            <LoadError />
          ) : showEmpty ? (
            <EmptySearch emptyAnimationData={emptyAnimationData} onClear={() => setQuery("")} />
          ) : data ? (
            <CollectionsList
              collections={filteredCollections.length ? filteredCollections : data}
              onDemo={handleDemo}
              onInstall={handleInstall}
              onGithub={openGithub}
              installingBotId={installingBotId}
            />
          ) : null}
        </main>
      </div>
      <Toaster />

      <Dialog open={showInstalledModal} onOpenChange={setShowInstalledModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bot created</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Your bot has been created successfully.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowInstalledModal(false)}>Close</Button>
            <Button
              onClick={() => {
                if (installedBotId) {
                  setShowInstalledModal(false)
                  router.push(`/app/bots/${installedBotId}/commands`)
                }
              }}
            >
              View Commands
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CollectionsList({
  collections,
  onDemo,
  onInstall,
  onGithub,
  installingBotId,
}: {
  collections: Collection[]
  onDemo: (b: StoreBot) => void
  onInstall: (b: StoreBot) => void
  onGithub: (url: string | null) => void
  installingBotId: number | null
}) {
  return (
    <div className="space-y-10">
      {collections.map((col) => (
        <section key={col.id} className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">{col.title}</h2>
            {col.description ? <p className="text-muted-foreground">{col.description}</p> : null}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {col.five_store_bots?.map((b) => (
              <BotCardItem
                key={`${col.id}-${b.id}`}
                bot={b}
                onDemo={onDemo}
                onInstall={onInstall}
                onGithub={onGithub}
                installingBotId={installingBotId}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function BotCardItem({
  bot,
  onDemo,
  onInstall,
  onGithub,
  installingBotId,
}: {
  bot: StoreBot
  onDemo: (b: StoreBot) => void
  onInstall: (b: StoreBot) => void
  onGithub: (url: string | null) => void
  installingBotId: number | null
}) {
  const isInstalling = installingBotId === bot.id
  return (
    <Card className="overflow-hidden border hover:border-primary/40 transition-colors">
      <div className="aspect-video w-full bg-muted/40 border-b overflow-hidden">
        <img src={bot.img_url || "/placeholder.jpg"} alt={bot.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-tight line-clamp-2">{bot.name}</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground shrink-0">
            {bot.installations_count?.toLocaleString?.() ?? 0}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-4 min-h-[4.8em]">
          {bot.description || "No description"}
        </p>
        <div className="flex items-center justify-center gap-2 pt-1">
          <Button onClick={() => onDemo(bot)} variant="outline" className="h-9 px-3 gap-2" disabled={isInstalling}>
            <ExternalLink className="w-4 h-4" />
            Demo
          </Button>
          <Button onClick={() => onInstall(bot)} className="h-9 px-3 gap-2" disabled={isInstalling}>
            {isInstalling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Install
          </Button>
          <Button
            onClick={() => onGithub(bot.repository_url)}
            variant="outline"
            className="h-9 px-3 gap-2"
            disabled={isInstalling || !bot.repository_url}
            title={bot.repository_url ? "Open GitHub" : "No repository"}
          >
            <Github className="w-4 h-4" />
            GitHub
          </Button>
        </div>
      </div>
    </Card>
  )
}

function EmptySearch({ emptyAnimationData, onClear }: { emptyAnimationData: any; onClear: () => void }) {
  return (
    <Card className="p-10 text-center border-muted bg-card/50">
      <div className="flex flex-col items-center justify-center space-y-6">
        {emptyAnimationData ? (
          <div className="w-64 h-64 mx-auto -mb-2 -mt-2">
            <Lottie animationData={emptyAnimationData} loop autoplay className="w-full h-full" style={{ background: "transparent" }} />
          </div>
        ) : (
          <Skeleton className="w-24 h-24 rounded-full" />
        )}
        <p className="text-muted-foreground text-lg">No bots match your search.</p>
        <Button variant="ghost" onClick={onClear}>Clear search</Button>
      </div>
    </Card>
  )
}

function CenterSpinner() {
  return (
    <div className="w-full py-20 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  )
}

function LoadError() {
  return (
    <Card className="p-12 text-center border-destructive/40">
      <p className="text-destructive">Failed to load store collections. Retry later.</p>
    </Card>
  )
}

async function safeText(res: Response) {
  try {
    return await res.text()
  } catch {
    return ""
  }
}
