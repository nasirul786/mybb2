"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Terminal, Wrench, MessageSquare, Settings, Package, Folder, Megaphone, AlertTriangle } from "lucide-react"

const TABS = [
  { id: "commands", label: "Commands", icon: Terminal },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "chats", label: "Chats", icon: MessageSquare },
  { id: "properties", label: "Properties", icon: Settings },
  { id: "libraries", label: "Libraries", icon: Package },
  { id: "folders", label: "Folders", icon: Folder },
  { id: "broadcast", label: "Broadcast", icon: Megaphone },
  { id: "errors", label: "Errors", icon: AlertTriangle },
]

export default function BroadcastPage() {
  const params = useParams()
  const router = useRouter()
  const botId = params.id as string

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="border-b bg-card sticky top-0 z-30 overflow-x-auto">
        <div className="flex gap-1 p-2">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                onClick={() => {
                  router.push(`/app/bots/${botId}/${tab.id}`)
                }}
                variant={tab.id === "broadcast" ? "default" : "outline"}
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

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <Megaphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground">Broadcast feature is coming soon</p>
        </div>
      </div>
    </div>
  )
}
