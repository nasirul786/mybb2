"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { Card } from "@/components/ui/card"
import { useEffect } from "react"

interface User {
  id: number
  email: string
  created_at: string
  api_key: string
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("mybb_user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 max-w-2xl">
          <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

          {user && (
            <Card className="p-6 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="text-lg font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">User ID</label>
                <p className="text-lg font-medium">{user.id}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Member Since</label>
                <p className="text-lg font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
