"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useEffect, useState } from "react"

export function AppSidebarToggle() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleSidebarToggle = () => {
      setIsOpen((prev) => !prev)
    }

    window.addEventListener("sidebar-toggle", handleSidebarToggle)
    return () => window.removeEventListener("sidebar-toggle", handleSidebarToggle)
  }, [])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        window.dispatchEvent(new Event("sidebar-toggle"))
      }}
      className="md:hidden"
    >
      <Menu className="w-5 h-5" />
    </Button>
  )
}
