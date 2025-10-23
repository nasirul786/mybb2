"use client"
import type { ReactNode } from "react"
import { useRouter, useParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Terminal,
  Wrench,
  MessageSquare,
  Settings,
  Package,
  Folder,
  Megaphone,
  AlertTriangle,
  LayoutDashboard,
} from "lucide-react"

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

export default function BotIdLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const botId = params.id as string

  const currentTab = pathname.split("/").pop() || "commands"

  return (
    <>
      <div className="fixed top-[55px] left-0 right-0 z-20 bg-card/60 backdrop-blur-xl border-b w-screen">
        <div className="flex gap-1 p-2 overflow-x-auto overflow-y-hidden scrollbar-thin">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                onClick={() => {
                  router.push(`/app/bots/${botId}/${tab.id}`)
                }}
                variant={tab.id === currentTab ? "default" : "outline"}
                size="sm"
                className="gap-2 whitespace-nowrap flex-shrink-0"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            )
          })}
        </div>
      </div>

      <main className="flex-1 p-6 space-y-8 mt-[52px] overflow-x-hidden">{children}</main>
    </>
  )
}
