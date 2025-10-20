"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { StoreLibrary } from "@/app/app/bots/[id]/libraries/page" 
import { Download, Check, Book, Loader2 } from "lucide-react"

type Props = {
  library: StoreLibrary
  isInstalled: boolean
  onInstall: (libId: number) => Promise<boolean>
  onReadMore: (lib: StoreLibrary) => void
}

export function LibraryCard({
  library,
  isInstalled,
  onInstall,
  onReadMore,
}: Props) {
  const [isInstalling, setIsInstalling] = useState(false)

  // Truncate description to ~150 chars
  const shortDescription =
    library.description.length > 150
      ? library.description.substring(0, 150) + "..."
      : library.description

  const handleInstall = async () => {
    setIsInstalling(true)
    await onInstall(library.id)
    setIsInstalling(false)
  }

  return (
    <Card className="flex flex-col overflow-hidden">
      {/* Image */}
      <div className="h-40 w-full bg-muted flex items-center justify-center overflow-hidden">
        {/* We use an <img> tag inside a next/image-like structure for external URLs */}
        {library.img_url ? (
          <img
            src={library.img_url}
            alt={`${library.name} thumbnail`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide on error and show fallback
              const parent = e.currentTarget.parentElement
              if (parent) {
                const fallback = parent.querySelector(".fallback-icon")
                if (fallback) fallback.removeAttribute("hidden")
              }
              e.currentTarget.style.display = "none"
            }}
          />
        ) : null}
        <Book
          className="fallback-icon w-12 h-12 text-muted-foreground"
          hidden={!!library.img_url}
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold truncate">{library.name}</h3>
        <p className="text-sm text-muted-foreground mt-1 flex-1">
          {shortDescription}
        </p>

        <div className="text-sm text-muted-foreground mt-4">
          <Download className="w-4 h-4 inline-block mr-1.5" />
          {library.installations_count.toLocaleString()} installs
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t flex gap-2">
        <Button
          onClick={handleInstall}
          disabled={isInstalled || isInstalling}
          className="w-full"
        >
          {isInstalling ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : isInstalled ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {isInstalling ? "Installing..." : isInstalled ? "Installed" : "Install"}
        </Button>
        <Button
          variant="outline"
          onClick={() => onReadMore(library)}
          className="flex-shrink-0"
        >
          <Book className="w-4 h-4 mr-2" />
          Read More
        </Button>
      </div>
    </Card>
  )
}