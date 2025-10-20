"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"

export default function CloudPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Cloud</h1>
            <p className="text-muted-foreground">Coming soon</p>
          </div>
        </main>
      </div>
    </div>
  )
}
