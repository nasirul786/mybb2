"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, Store, Wand2, Code2, X } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export function AppSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter()
  const pathname = usePathname()

  // lock/unlock page scroll behind sidebar
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

  const navItems = [
    { href: "/app", label: "Dashboard", icon: Store },
    { href: "/app/magic-tool", label: "Magic Tool", icon: Wand2 },
    { href: "/app/store", label: "Store", icon: Store },
    { href: "/app/account", label: "Account", icon: Settings },
  ]

  const handleLogout = () => {
    // your logout logic
    router.push("/login")
  }

  return (
    <>
      {/* Backdrop overlay — clickable on ALL screen sizes */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (overlay on all screens, top of everything, scrolls internally) */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-transform overflow-y-auto z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar"
      >
        <div className="p-4 sm:p-6 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              MyBB
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 sm:p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                  // active background okay, but hover should NOT add bg color; only text color
                  active ? "bg-muted text-foreground" : "text-sidebar-foreground",
                  "hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 sm:p-4 border-t border-sidebar-border space-y-3">
          <div className="text-xs text-muted-foreground">
            <div className="font-medium text-foreground">Logged in as</div>
            <a href="#" className="underline underline-offset-4">
              i am cc
            </a>
            <p className="mt-2 text-xs">v1.0.0</p>
          </div>
          <Button onClick={handleLogout} variant="destructive" className="w-full gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  )
}
