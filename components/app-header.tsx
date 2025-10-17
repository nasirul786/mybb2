"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Monitor, Menu, Code2 } from "lucide-react"
import { useTheme } from "next-themes"

export function AppHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showThemePopup, setShowThemePopup] = useState(false)
  const themeButtonRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!showThemePopup) return
      const t = e.target as Node
      if (
        themeButtonRef.current &&
        !themeButtonRef.current.contains(t) &&
        popupRef.current &&
        !popupRef.current.contains(t)
      ) {
        setShowThemePopup(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [showThemePopup])

  if (!mounted) return null

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-14 items-center gap-2 px-4">
        <button
          onClick={onMenuClick}
          className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:text-foreground text-muted-foreground"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="ml-2 flex items-center gap-2">
          <Code2 className="w-5 h-5" />
          <span className="font-semibold">MyBB</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Theme switcher (click only) */}
          <div className="relative">
            <Button
              ref={themeButtonRef}
              variant="ghost"
              size="icon"
              aria-haspopup="menu"
              aria-expanded={showThemePopup}
              onClick={() => setShowThemePopup((prev) => !prev)}
              className="hover:text-foreground"
            >
              {theme === "dark" ? (
                <Moon className="w-4 h-4" />
              ) : theme === "light" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Monitor className="w-4 h-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {showThemePopup && (
              <div
                ref={popupRef}
                role="menu"
                className="absolute right-0 mt-2 w-40 rounded-md border bg-popover p-1 shadow-md z-50"
              >
                <button
                  onClick={() => {
                    setTheme("light")
                    setShowThemePopup(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors hover:text-foreground hover:bg-muted ${
                    theme === "light" ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>

                <button
                  onClick={() => {
                    setTheme("dark")
                    setShowThemePopup(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors hover:text-foreground hover:bg-muted ${
                    theme === "dark" ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>

                <button
                  onClick={() => {
                    setTheme("system")
                    setShowThemePopup(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors hover:text-foreground hover:bg-muted ${
                    theme === "system" ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  System
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
