"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface LogoutConfirmModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export function LogoutConfirmModal({ onConfirm, onCancel }: LogoutConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Logout?</h2>
              <p className="text-sm text-muted-foreground mt-1">You'll need to sign in again to manage your bots.</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent cursor-pointer">
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleConfirm} className="flex-1 cursor-pointer">
              Logout
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
