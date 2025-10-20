"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { BotCard } from "@/components/bot-card"
import { CreateBotModal } from "@/components/create-bot-modal"
import { FilterModal } from "@/components/filter-modal"
import { Search, Plus, Filter, Loader2, Bot, X } from "lucide-react"
import useSWR from "swr"
import Lottie from "lottie-react"

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
  const [emptyAnimationData, setEmptyAnimationData] = useState(null)

  useEffect(() => {
    const storedApiKey = localStorage.getItem("mybb_api_key")
    if (!storedApiKey) {
      router.push("/app")
      return
    }
    setApiKey(storedApiKey)
  }, [router])

  // Load Lottie animation data
  useEffect(() => {
    fetch('/lottie/empty-bots.json')
      .then(response => response.json())
      .then(data => setEmptyAnimationData(data))
      .catch(error => console.error('Error loading Lottie animation:', error))
  }, [])

  const {
    data: botsData,
    isLoading,
    mutate,
  } = useSWR(
    apiKey ? `https://appapi.bots.business/v2/bots?api_key=${apiKey}` : null,
    async (url) => {
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch bots")
      const data = await response.json()
      return data
    },
    { 
      revalidateOnFocus: false,
      errorRetryCount: 3 
    },
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
    ?.filter((bot) => {
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
    }) || []

  const runningBotsCount = bots.filter(bot => bot.status === "works").length
  const totalBotsCount = bots.length

  const handleBotCreated = () => {
    setShowCreateModal(false)
    mutate()
  }

  const handleBotUpdated = () => {
    mutate()
  }

  const EmptyState = () => (
    <Card className="p-4 text-center border-muted hover:border-primary/50 transition-colors duration-300 bg-card/50">
      <CardContent className="flex flex-col items-center justify-center space-y-6 p-6">
        {emptyAnimationData ? (
          <div className="w-64 h-64 mx-auto -mb-8 -mt-4">
            <Lottie 
              animationData={emptyAnimationData} 
              loop={true}
              className="w-full h-full"
              autoplay={true}
              style={{ background: 'transparent' }}
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-4 border border-border">
            <Bot className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-foreground">
            {bots.length === 0 ? "No bots yet" : "No bots found"}
          </h3>
          <p className="text-muted-foreground max-w-sm text-lg">
            {bots.length === 0 
              ? "Get started by creating your first Telegram bot to automate your tasks." 
              : "Try adjusting your search or filters to find what you're looking for."
            }
          </p>
        </div>
        
        {bots.length === 0 && (
          <Button 
            onClick={() => setShowCreateModal(true)} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 mt-4 px-6 py-3 h-auto text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Create Your First Bot
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-8 min-h-screen bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Your Bots
          </h1>
          <p className="text-muted-foreground text-lg">Manage and control your Telegram bots</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-3 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 px-6 py-3 h-auto text-base font-semibold"
        >
          <Plus className="w-5 h-5" />
          New Bot
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
          <Input
            id="search-input"
            placeholder="Search bots by name... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 py-3 h-10 bg-card focus:border-primary transition-colors duration-200 rounded-xl focus:ring-2 focus:ring-primary/20 text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-muted hover:bg-muted-foreground/20 rounded-full transition-colors duration-200"
            >
              <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowFilterModal(true)} 
          className="gap-3 h-10 border-2 border-border hover:border-primary/50 hover:bg-accent/50 transition-colors duration-200 px-6 text-base font-medium rounded-xl"
        >
          <Filter className="w-5 h-5" />
          Filter
          {Object.keys(filters).length > 0 && (
            <span className="flex h-2 w-2 rounded-full bg-primary ml-1" />
          )}
        </Button>
      </div>

      {/* Results Count */}
      {!isLoading && (filteredBots.length > 0 || totalBotsCount > 0) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-sm">
            <p className="text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{totalBotsCount}</span> bot{totalBotsCount !== 1 ? 's' : ''}
            </p>
            <p className="text-muted-foreground">
              Running: <span className="font-semibold text-green-600 dark:text-green-400">{runningBotsCount}</span> bot{runningBotsCount !== 1 ? 's' : ''}
            </p>
            {searchQuery && (
              <p className="text-muted-foreground">
                Found: <span className="font-semibold text-foreground">{filteredBots.length}</span> bot{filteredBots.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {(searchQuery || Object.keys(filters).length > 0) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchQuery("")
                setFilters({})
              }}
              className="text-muted-foreground hover:text-foreground self-start sm:self-auto"
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Bots Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground text-lg">Loading your bots...</p>
          </div>
        </div>
      ) : filteredBots.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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
        <FilterModal 
          filters={filters} 
          onFiltersChange={setFilters} 
          onClose={() => setShowFilterModal(false)} 
        />
      )}
    </div>
  )
}