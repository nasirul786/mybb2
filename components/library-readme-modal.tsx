"use client"

import type { StoreLibrary } from "@/app/app/bots/[id]/libraries/page"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

type Props = {
  isOpen: boolean
  onClose: () => void
  library: StoreLibrary | null
}

export function LibraryReadmeModal({ isOpen, onClose, library }: Props) {
  if (!isOpen || !library) return null

  return (
    // FIX: Changed background to bg-black/50, removed blur
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border rounded-lg max-w-2xl w-full flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-10">
          <h2 className="text-xl font-bold truncate">{library.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="p-1">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {/* Use <pre> tag to respect whitespace and newlines in the description */}
          <pre className="text-sm text-foreground/90 whitespace-pre-wrap font-sans">
            {library.description}
          </pre>
        </div>
      </div>
    </div>
  )
}