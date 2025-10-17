"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { BotCard } from "@/components/bot-card"
import { CreateBotModal } from "@/components/create-bot-modal"
import { FilterModal } from "@/components/filter-modal"
import { Search, Plus, Filter, Loader2 } from "lucide-react"
import useSWR from "swr"

interface Bot {
  id: number
  name: string
  token: string | null
  created_at: string
  updated_at: string
  status: string | null
  pic_url: string | null
}

interface FilterState {
  name?: "asc" | "desc"
  creation?: "asc" | "desc"
  update?: "asc" | "desc"
  status?: "works" | "stopped"
}

export default function BotsPage() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filters, setFilters] = useState<FilterState>({})
  const [bots, setBots] = useState<Bot[]>([])

  useEffect(() => {
    const storedApiKey = localStorage.getItem("mybb_api_key")
    if (!storedApiKey) {
      router.push("/app")
      return
    }
    setApiKey(storedApiKey)
  }, [router])

  const {
    data: botsData,
    isLoading,
    mutate,
  } = useSWR(
    apiKey ? `https://appapi.bots.business/v2/bots?api_key=${apiKey}` : null,
    async (url) => {
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch bots")
      return response.json()
    },
    { revalidateOnFocus: false },
  )

  useEffect(() => {
    if (botsData) {
      setBots(botsData)
    }
  }, [botsData])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        document.getElementById("search-input")?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const filteredBots = bots
    .filter((bot) => {
      if (searchQuery && !bot.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      if (filters.status && bot.status !== filters.status) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      if (filters.name) {
        return filters.name === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      }
      if (filters.creation) {
        const aDate = new Date(a.created_at).getTime()
        const bDate = new Date(b.created_at).getTime()
        return filters.creation === "asc" ? aDate - bDate : bDate - aDate
      }
      if (filters.update) {
        const aDate = new Date(a.updated_at).getTime()
        const bDate = new Date(b.updated_at).getTime()
        return filters.update === "asc" ? aDate - bDate : bDate - aDate
      }
      return 0
    })

  const handleBotCreated = () => {
    setShowCreateModal(false)
    mutate()
  }

  const handleBotUpdated = () => {
    mutate()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Bots</h1>
          <p className="text-muted-foreground mt-1">Manage and control your Telegram bots</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          New Bot
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="search-input"
            placeholder="Search bots... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilterModal(true)} className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Bots Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredBots.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {bots.length === 0 ? "No bots yet. Create your first bot!" : "No bots match your search."}
          </p>
          {bots.length === 0 && (
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              Create Bot
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBots.map((bot) => (
            <BotCard key={bot.id} bot={bot} apiKey={apiKey} onUpdate={handleBotUpdated} />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateBotModal apiKey={apiKey} onClose={() => setShowCreateModal(false)} onSuccess={handleBotCreated} />
      )}

      {showFilterModal && (
        <FilterModal filters={filters} onFiltersChange={setFilters} onClose={() => setShowFilterModal(false)} />
      )}
    </div>
  )
}
