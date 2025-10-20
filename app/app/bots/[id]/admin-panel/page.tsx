// app/app/bots/[id]/admin-panel/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminPanelForm } from "@/components/admin-panel-form"
import { useToast } from "@/components/ui/use-toast"
import {
  Terminal, Wrench, MessageSquare, Settings, Package, Folder, Megaphone, AlertTriangle, LayoutDashboard,
  Loader2, Save, Settings as DefaultIcon, ArrowLeft
} from "lucide-react"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

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

type AdminField = {
  name: string
  title: string
  description: string
  type: "string" | "password" | "integer" | "float" | "checkbox" | "text"
  placeholder?: string | null
  value: any
  icon?: string | null
  hidden?: boolean | null
}

type AdminPanelValue = {
  title: string
  description?: string | null
  index?: number
  icon?: string | null
  button_title?: string | null
  on_saving?: { command: string; user_id?: number } | null
  fields: AdminField[]
}

type ActiveOption = {
  id: number
  name: string
  bot_id: number
  created_at: string
  updated_at: string
  size: number
  value: AdminPanelValue | string
  type: "active_option"
}

const iconMap: { [key: string]: React.ElementType } = {
  "chatbubble": LayoutDashboard,
  "key": LayoutDashboard,
  "people": LayoutDashboard,
  "pricetag": LayoutDashboard,
  "power": LayoutDashboard,
  "document-text": LayoutDashboard,
  "settings": DefaultIcon,
}

const BASE_URL = "https://appapi.bots.business/v2"

async function fetchAdminPanels(botId: string, apiKey: string): Promise<ActiveOption[]> {
  try {
    const url = `${BASE_URL}/bots/${botId}/active_options?api_key=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch admin panels: ${res.statusText}`)
    const data = await res.json() as any[]

    const validPanels: ActiveOption[] = []
    for (const item of data) {
      if (item.type === 'active_option' && typeof item.value === 'string') {
        try {
          const parsedValue = JSON.parse(item.value) as AdminPanelValue
          if (parsedValue && Array.isArray(parsedValue.fields)) {
            validPanels.push({ ...item, value: parsedValue })
          }
        } catch (_) {}
      } else if (item.type === 'active_option' && item.value && Array.isArray((item.value as AdminPanelValue).fields)) {
        validPanels.push(item as ActiveOption)
      }
    }
    return validPanels
  } catch (e) {
    console.error("[fetchAdminPanels] Error:", e)
    return []
  }
}

async function saveAdminPanel(
  botId: string,
  optionId: number,
  value: AdminPanelValue,
  apiKey: string
): Promise<{ success: boolean; data?: ActiveOption; error?: string }> {
  try {
    const url = `${BASE_URL}/bots/${botId}/active_options/${optionId}?api_key=${apiKey}`
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: optionId, value }),
    })
    const responseData = await res.json()
    if (!res.ok) {
      const errorMessage = Array.isArray(responseData.errors) ? responseData.errors[0] : (responseData.error || "Failed to save admin panel")
      throw new Error(errorMessage)
    }
    if (responseData.value && typeof responseData.value === 'string') {
      try { responseData.value = JSON.parse(responseData.value) } catch { throw new Error("Invalid response data after saving.") }
    }
    return { success: true, data: responseData as ActiveOption }
  } catch (e) {
    console.error("[saveAdminPanel] Error:", e)
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export default function AdminPanelPage() {
  const params = useParams()
  const router = useRouter()
  const botId = params.id as string
  const { toast } = useToast()

  const [panels, setPanels] = useState<ActiveOption[]>([])
  const [selectedPanelId, setSelectedPanelId] = useState<number | null>(null)
  const [currentEditData, setCurrentEditData] = useState<AdminPanelValue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [emptyAnimationData, setEmptyAnimationData] = useState<any>(null)

  const apiKey = typeof window !== "undefined" ? localStorage.getItem("mybb_api_key") : null

  useEffect(() => {
    const updatePanelIdFromHash = () => {
      const hash = window.location.hash
      const match = hash.match(/^#panel-(\d+)$/)
      const panelId = match ? parseInt(match[1], 10) : null
      setSelectedPanelId(panelId)
    }
    updatePanelIdFromHash()
    window.addEventListener('hashchange', updatePanelIdFromHash)
    return () => window.removeEventListener('hashchange', updatePanelIdFromHash)
  }, [])

  const selectedPanel = useMemo(() => {
    return panels.find(p => p.id === selectedPanelId)
  }, [panels, selectedPanelId])

  useEffect(() => {
    if (selectedPanel) {
      const sourceValueString = JSON.stringify(selectedPanel.value)
      const editValueString = JSON.stringify(currentEditData)
      if (currentEditData === null || sourceValueString !== editValueString) {
        setCurrentEditData(JSON.parse(sourceValueString))
      }
    } else {
      if (currentEditData !== null) setCurrentEditData(null)
    }
  }, [selectedPanel])

  useEffect(() => {
    if (!apiKey) {
      setIsLoading(false)
      return
    }
    loadPanels()
  }, [botId, apiKey])

  useEffect(() => {
    fetch("/lottie/empty-bots.json")
      .then((r) => r.json())
      .then(setEmptyAnimationData)
      .catch(() => {})
  }, [])

  const loadPanels = async () => {
    if (!apiKey) return
    setIsLoading(true)
    const fetchedPanels = await fetchAdminPanels(botId, apiKey)
    fetchedPanels.sort((a, b) => {
      const valA = a.value as AdminPanelValue
      const valB = b.value as AdminPanelValue
      return (valA.index ?? 0) - (valB.index ?? 0) || valA.title.localeCompare(valB.title)
    })
    setPanels(fetchedPanels)
    setIsLoading(false)

    const hash = window.location.hash
    const match = hash.match(/^#panel-(\d+)$/)
    const panelId = match ? parseInt(match[1], 10) : null
    setSelectedPanelId(panelId)
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setCurrentEditData(prevData => {
      if (!prevData) return null
      const newFields = prevData.fields.map(field =>
        field.name === fieldName ? { ...field, value } : field
      )
      return { ...prevData, fields: newFields }
    })
  }

  const handleSaveChanges = async () => {
    if (!apiKey || !selectedPanelId || !currentEditData) return
    setIsSaving(true)
    const result = await saveAdminPanel(botId, selectedPanelId, currentEditData, apiKey)

    if (result.success && result.data) {
      setPanels(prevPanels => prevPanels.map(panel =>
        panel.id === selectedPanelId ? result.data! : panel
      ))
      setCurrentEditData(JSON.parse(JSON.stringify(result.data.value)))
      toast({ title: "Success", description: "Admin panel configuration saved." })
    } else {
      toast({ variant: "destructive", title: "Save Failed", description: result.error || "Could not save configuration." })
    }
    setIsSaving(false)
  }

  const closePanel = () => {
    window.location.hash = ""
    setSelectedPanelId(null)
    setCurrentEditData(null)
    router.replace(`/app/bots/${botId}/admin-panel`)
  }

  const panelValue = selectedPanel?.value as AdminPanelValue | undefined

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-20 border-b bg-card/60 backdrop-blur-xl">
        <div className="flex gap-1 p-2 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                onClick={() => { router.push(`/app/bots/${botId}/${tab.id}`) }}
                variant={tab.id === "admin-panel" ? "default" : "outline"}
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

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-3xl font-bold">Admin Panel</h2>
          {panels.length > 1 && !selectedPanelId && (
            <Select
              value={""}
              onValueChange={(idStr) => window.location.hash = `#panel-${idStr}`}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Select a panel to edit..." />
              </SelectTrigger>
              <SelectContent>
                {panels.map(panel => (
                  <SelectItem key={panel.id} value={panel.id.toString()}>
                    {(panel.value as AdminPanelValue).title || `Panel ${panel.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : selectedPanelId && panelValue && currentEditData ? (
          <div className="w-full">
            <div className="flex flex-row items-center justify-between mb-6 pb-4 border-b">
              <div>
                <h3 className="text-xl font-semibold">{panelValue.title}</h3>
                {panelValue.description && (
                  <p className="text-sm text-muted-foreground mt-1">{panelValue.description}</p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={closePanel} className="gap-1.5 hidden sm:flex">
                <ArrowLeft className="w-4 h-4" /> Back to Panels
              </Button>
            </div>

            <AdminPanelForm
              fields={currentEditData.fields}
              onChange={handleFieldChange}
              disabled={isSaving}
            />

            <div className="mt-8 pt-6 border-t flex justify-center">
              <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full sm:w-auto sm:min-w-[150px]">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isSaving ? "Saving..." : (panelValue.button_title || "Save Changes")}
              </Button>
            </div>
          </div>
        ) : panels.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 px-6">
            {emptyAnimationData ? (
              <div className="w-64 h-64 mx-auto mb-4">
                <Lottie animationData={emptyAnimationData} loop autoplay className="w-full h-full" style={{ background: "transparent" }} />
              </div>
            ) : (<LayoutDashboard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />)}
            <h2 className="text-xl font-semibold mt-2 mb-1">No Admin Panel Configured</h2>
            <p className="text-muted-foreground max-w-xs">This bot doesn't have an admin panel set up yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {panels.map(panel => {
              const panelInfo = panel.value as AdminPanelValue
              const IconComponent = iconMap[panelInfo.icon || 'settings'] || DefaultIcon
              return (
                <Card
                  key={panel.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    window.location.hash = `#panel-${panel.id}`
                  }}
                >
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <IconComponent className="w-6 h-6 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{panelInfo.title}</CardTitle>
                      {panelInfo.description && <CardDescription className="text-xs mt-1 line-clamp-2">{panelInfo.description}</CardDescription>}
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
