"use client"

import type { InstalledLibrary } from "@/app/app/bots/[id]/libraries/page"
import { Button } from "@/components/ui/button"
import { X, Trash2, Package } from "lucide-react"

type Props = {
  isOpen: boolean
  onClose: () => void
  installedLibraries: InstalledLibrary[]
  onDelete: (lib: InstalledLibrary) => void
}

export function InstalledLibsModal({
  isOpen,
  onClose,
  installedLibraries,
  onDelete,
}: Props) {
  if (!isOpen) return null

  return (
    // FIX: Changed background to bg-black/50, removed blur
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border rounded-lg max-w-lg w-full flex flex-col max-h-[70vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-10">
          <h2 className="text-xl font-bold">Installed Libraries</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="p-1">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-2">
          {installedLibraries.length === 0 && (
            <p className="text-muted-foreground text-center p-8">
              You have no libraries installed.
            </p>
          )}
          {installedLibraries.map((lib) => (
            <div
              key={lib.id}
              className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-md"
            >
              <div className="flex items-center gap-3 truncate">
                {lib.img_url ? (
                  <img
                    src={lib.img_url}
                    alt={lib.name}
                    className="w-8 h-8 rounded-md object-cover bg-muted"
                  />
                ) : (
                  <Package className="w-8 h-8 p-1.5 text-muted-foreground bg-muted rounded-md" />
                )}
                <span className="font-medium truncate">{lib.name}</span>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(lib)}
                className="px-3"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}