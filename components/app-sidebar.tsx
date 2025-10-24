"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, Store, Wand2, Code2, X, Bot, Cloud, Zap } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { LogoutConfirmModal } from "./logout-confirm-modal"

export function AppSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [appVersion, setAppVersion] = useState("2.0")

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Fetch the version on component mount
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const res = await fetch("/api/version", {
          cache: "no-store",
        })
        if (res.ok) {
          const data = await res.json()
          if (data && data.version) {
            setAppVersion(data.version)
          }
        }
      } catch (error) {
        console.error("Failed to fetch app version:", error)
      }
    }

    fetchVersion()
  }, [])

  const navItems = [
    { href: "/app/bots", label: "Bots", icon: Bot },
    { href: "/app/magic-tool", label: "Magic Tool", icon: Wand2 },
    { href: "/app/store", label: "Store", icon: Store },
    { href: "/app/cloud", label: "Cloud", icon: Cloud },
    { href: "/app/iteration", label: "Iteration", icon: Zap },
    { href: "/app/account", label: "Account", icon: Settings },
  ] as const

  const handleLogoutClick = () => {
    onClose()
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = () => {
    try {
      localStorage.removeItem(process.env.NEXT_PUBLIC_API_KEY_STORAGE_KEY)
    } catch {}
    router.push("/app")
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 pointer-events-auto" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose()
        }}
        className={`fixed inset-y-0 left-0 w-64 h-svh max-h-svh bg-sidebar border-r border-sidebar-border z-60 pointer-events-auto
          flex flex-col min-h-0 transition-transform duration-300 ease-out overflow-hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-sidebar-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg" style={{ color: "#2DA5E1" }}>
              Bots.Business
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 pb-24">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200 cursor-pointer",
                  active
                    ? "bg-blue-600/20 text-blue-600 dark:text-blue-400 ml-2 border-l-2 border-blue-600 pl-2"
                    : "text-sidebar-foreground hover:bg-blue-600/10 hover:text-blue-500",
                ].join(" ")}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sticky footer */}
        <div className="sticky bottom-0 bg-sidebar border-t border-sidebar-border p-3 sm:p-4 space-y-3 shrink-0 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <Button variant="destructive" className="w-full gap-2 cursor-pointer hover:bg-red-700" onClick={handleLogoutClick}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>

          <p className="text-xs text-muted-foreground text-center">Version: {appVersion}</p>
        </div>
      </aside>

      {showLogoutModal && (
        <LogoutConfirmModal onConfirm={handleLogoutConfirm} onCancel={() => setShowLogoutModal(false)} />
      )}
    </>
  )
}
