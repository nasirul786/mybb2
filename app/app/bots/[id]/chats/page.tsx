"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChatListItem } from "@/components/chat-list-item"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { Loader2, Search, X, Ban, CheckCircle } from "lucide-react"


type User = {
  id: number
  first_name: string | null
  last_name: string | null
  username: string | null
  telegramid: number
  created_at: string
  language_code: string | null
}

export type Chat = {
  id: number
  chatid: string
  title: string | null
  user_id: number
  created_at: string
  updated_at: string
  bot_id: number
  last_active_at: string
  blocked: boolean | string | null
  blocked_reason: string | null
  blocked_at: string | null
  prohibited_by_admin: boolean | null
  chat_type_tag: number
  ad_sended_at: string | null
  instant_ad_sended_at: string | null
  last_run_all_task_id: number | null
  user: User | null
}

type SortOption = "name_asc" | "name_desc" | "joined_asc" | "joined_desc"
type FilterStatus = "all" | "blocked" | "unblocked"



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

async function fetchChats(botId: string): Promise<Chat[]> {
  try {
    const res = await apiFetch(`/bots/${botId}/chats`)
    return (await res.json()) as Chat[]
  } catch (e) {
    console.error("[fetchChats] Error:", e)
    return []
  }
}

async function updateChatStatus(
  botId: string,
  chatId: number,
  block: boolean
): Promise<{ success: boolean; updatedChat?: Chat; error?: string }> {
  const action = block ? "block" : "unblock"
  try {
    const res = await apiFetch(`/bots/${botId}/chats/${chatId}/${action}`, {
      method: "POST",
    })
    const data = await res.json()

   
    const expectedBlockedStatus = block
    data.prohibited_by_admin = expectedBlockedStatus

    return { success: true, updatedChat: data as Chat }
  } catch (e) {
    console.error(`[${action}Chat] Error:`, e)
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}



export default function ChatsPage() {
  const params = useParams()
  const botId = params.id as string

  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("joined_desc")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")

  const [blockConfirm, setBlockConfirm] = useState<Chat | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const searchRef = useRef<HTMLInputElement | null>(null)


  const loadChats = useCallback(async () => {
    if (!botId) return
    setIsLoading(true)
    const fetchedChats = await fetchChats(botId)
    setChats(fetchedChats)
    setIsLoading(false)
  }, [botId])

  useEffect(() => {
    loadChats()
  }, [loadChats])

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

  const filteredAndSortedChats = useMemo(() => {
    let result = chats

    if (filterStatus !== "all") {
      result = result.filter((chat) => {
        const isBlocked = chat.prohibited_by_admin === true
        return filterStatus === "blocked" ? isBlocked : !isBlocked
      })
    }

    const q = searchQuery.toLowerCase().trim()
    if (q) {
      result = result.filter((chat) => {
        if (!chat.user) return false
        const user = chat.user
        const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase()
        const username = user.username?.toLowerCase() || ""
        const telegramId = String(user.telegramid)
        return fullName.includes(q) || username.includes(q) || telegramId.includes(q)
      })
    }

    result.sort((a, b) => {
      const userA = a.user
      const userB = b.user
      const nameA = userA ? `${userA.first_name || ""} ${userA.last_name || ""}`.trim().toLowerCase() : ""
      const nameB = userB ? `${userB.first_name || ""} ${userB.last_name || ""}`.trim().toLowerCase() : ""
      const dateA = userA ? new Date(userA.created_at || 0).getTime() : 0
      const dateB = userB ? new Date(userB.created_at || 0).getTime() : 0

      switch (sortBy) {
        case "name_asc":
          return nameA.localeCompare(nameB)
        case "name_desc":
          return nameB.localeCompare(nameA)
        case "joined_asc":
          return dateA - dateB
        case "joined_desc":
        default:
          return dateB - dateA
      }
    })

    return result
  }, [chats, searchQuery, sortBy, filterStatus])

  const handleUpdateRequest = (chat: Chat) => setBlockConfirm(chat)

  const handleConfirmBlockUnblock = async () => {
    if (!blockConfirm) return 

    const chatToUpdate = blockConfirm
    const shouldBlock = !(chatToUpdate.prohibited_by_admin === true)

    setIsUpdatingStatus(true)
    const result = await updateChatStatus(botId, chatToUpdate.id, shouldBlock)

    if (result.success && result.updatedChat) {
      setChats((prev) => prev.map((chat) => (chat.id === chatToUpdate.id ? result.updatedChat! : chat)))
      setBlockConfirm(null)
    } else {
      alert(`Failed to ${shouldBlock ? "block" : "unblock"} chat: ${result.error}`)
    }
    setIsUpdatingStatus(false)
  }

  
  return (
    <main className="absolute inset-0 flex flex-col min-w-0 pt-25 sm:pt-25">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-4">
          <h2 className="text-3xl font-bold">Chats</h2>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
              <Input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, username, or ID... (Ctrl+K)"
                className="pl-9 pr-10 h-10 bg-card focus:ring-2 focus:ring-primary/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-full sm:w-[200px] h-10 bg-card">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="joined_desc">Joined: Newest First</SelectItem>
                <SelectItem value="joined_asc">Joined: Oldest First</SelectItem>
                <SelectItem value="name_asc">Name: A-Z</SelectItem>
                <SelectItem value="name_desc">Name: Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium mr-2">Filter:</span>
            <Button
              size="sm"
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              className="gap-1.5"
            >
              All ({chats.length})
            </Button>
            <Button
              size="sm"
              variant={filterStatus === "unblocked" ? "secondary" : "outline"}
              onClick={() => setFilterStatus("unblocked")}
              className="gap-1.5"
            >
              <CheckCircle className="w-4 h-4 text-green-600" /> Unblocked
            </Button>
            <Button
              size="sm"
              variant={filterStatus === "blocked" ? "secondary" : "outline"}
              onClick={() => setFilterStatus("blocked")}
              className="gap-1.5"
            >
              <Ban className="w-4 h-4 text-red-600" /> Blocked
            </Button>
          </div>
        </div>

        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredAndSortedChats.length === 0 ? (
            <p className="text-muted-foreground text-center py-20">
              {searchQuery || filterStatus !== "all"
                ? "No chats found matching your filters."
                : "No chats found for this bot yet."}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedChats.map((chat) =>
                chat.user ? (
                  <ChatListItem key={chat.id} chat={chat} onUpdateStatus={() => handleUpdateRequest(chat)} />
                ) : null
              )}
            </div>
          )}
        </div>
      </div>

      {blockConfirm && (
        <DeleteConfirmModal
          title={blockConfirm.prohibited_by_admin ? "Unblock User?" : "Block User?"}
          description={
            <>
              Are you sure you want to {blockConfirm.prohibited_by_admin ? "unblock" : "block"} the user{" "}
              <span className="font-semibold text-foreground">
                {blockConfirm.user?.first_name || ""} {blockConfirm.user?.last_name || ""}
                {blockConfirm.user?.username ? ` (@${blockConfirm.user.username})` : ""}
              </span>
              ?
            </>
          }
          confirmText={blockConfirm.prohibited_by_admin ? "Unblock" : "Block"}
          onConfirm={handleConfirmBlockUnblock}
          onCancel={() => setBlockConfirm(null)}
          isLoading={isUpdatingStatus}
        />
      )}
    </main>
  )
}