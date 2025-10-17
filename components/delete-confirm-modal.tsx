"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"

interface DeleteConfirmModalProps {
  botName: string
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

export function DeleteConfirmModal({ botName, onConfirm, onCancel, isLoading }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Delete Bot?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Are you sure you want to delete <span className="font-semibold text-foreground">"{botName}"</span>? This
                action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={onConfirm} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Bot"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
