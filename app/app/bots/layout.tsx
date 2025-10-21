"use client"
import { useState, useEffect } from "react"
import type { ReactNode } from "react"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { useRouter } from "next/navigation"

export default function BotsLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const apiKey = localStorage.getItem("mybb_api_key")
    if (!apiKey) {
      router.push("/app")
    }
  }, [router])

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 space-y-8">{children}</main>
      </div>
    </div>
  )
}