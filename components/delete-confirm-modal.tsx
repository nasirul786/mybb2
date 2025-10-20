"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"

interface DeleteConfirmModalProps {
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
  title: string // Was hard-coded "Delete Bot?"
  description: React.ReactNode // Was hard-coded with `botName`
  confirmText?: string // Was hard-coded "Delete Bot"
}

export function DeleteConfirmModal({
  onConfirm,
  onCancel,
  isLoading,
  title,
  description,
  confirmText = "Delete", // Default to "Delete"
}: DeleteConfirmModalProps) {
  return (
    // Re-added bg-black/50 for the dim effect you wanted
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-transparent cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                confirmText // Use the prop here
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}