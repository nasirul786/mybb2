"use client"
import { useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
type TerminalModalProps = {
  isOpen: boolean
  onClose: () => void
  logs: string[]
  blobUrl: string | null
  filename: string
  isBusy: boolean
}
export function MagicToolTerminal({
  isOpen,
  onClose,
  logs,
  blobUrl,
  filename,
  isBusy,
}: TerminalModalProps) {
  const logAreaRef = useRef<HTMLPreElement>(null)
  useEffect(() => {
    if (logAreaRef.current) {
      logAreaRef.current.scrollTop = logAreaRef.current.scrollHeight
    }
  }, [logs])
  const handleDownloadClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const url = (e.currentTarget as HTMLAnchorElement).href
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url)
      } catch {}
    }, 500)
  }
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isBusy && !open && onClose()}>
      <DialogContent
        className="max-w-3xl"
        onInteractOutside={(e) => isBusy && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Terminal</DialogTitle>
        </DialogHeader>
        <pre
          ref={logAreaRef}
          className="bg-black text-green-400 p-4 rounded-md h-96 overflow-y-auto text-sm font-mono whitespace-pre-wrap break-all"
        >
          {logs.join("\n")}
        </pre>
        <DialogFooter className="gap-2 sm:justify-between">
          <div>
            {blobUrl && (
              <Button asChild variant="default">
                <a
                  href={blobUrl}
                  download={filename}
                  onClick={handleDownloadClick}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Download JSON
                </a>
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isBusy}
          >
            {isBusy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isBusy ? "Processing..." : "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}