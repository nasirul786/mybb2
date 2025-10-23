"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  AlertTriangle,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

type ErrorLog = {
  id: number
  title: string
  stack_trace: string | null
  bot_id: number
  scenario_id: number | null
  created_at: string
  updated_at: string
  scenario?: {
    id: number
    bot_command?: {
      id: number
      command: string
    }
  } | null
}

const BASE_URL = "https://appapi.bots.business/v2"

async function fetchErrorLogs(botId: string, apiKey: string): Promise<ErrorLog[]> {
  try {
    const url = `${BASE_URL}/bots/${botId}/error_logs?api_key=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch error logs: ${res.statusText}`)
    return (await res.json()) as ErrorLog[]
  } catch (e) {
    console.error("[fetchErrorLogs] Error:", e)
    return []
  }
}

async function clearErrorLogs(botId: string, apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${BASE_URL}/bots/${botId}/error_logs?api_key=${apiKey}`
    const res = await fetch(url, { method: "DELETE" })
    if (!res.ok) {
      let errorMsg = res.statusText
      try {
        const data = await res.json()
        errorMsg = data.error || errorMsg
      } catch {}
      throw new Error(errorMsg)
    }
    const data = await res.json()
    if (!Array.isArray(data) || data.length !== 0) {
      console.warn("Clear logs response was not an empty array:", data)
    }
    return { success: true }
  } catch (e) {
    console.error("[clearErrorLogs] Error:", e)
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export default function ErrorsPage() {
  const params = useParams()
  const router = useRouter()
  const botId = params.id as string
  const { toast } = useToast()

  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [emptyAnimationData, setEmptyAnimationData] = useState<any>(null)
  const [copiedLogId, setCopiedLogId] = useState<number | null>(null)

  const apiKey = typeof window !== "undefined" ? localStorage.getItem("mybb_api_key") : null

  useEffect(() => {
    if (!apiKey) {
      setIsLoading(false)
      return
    }
    loadErrorLogs()
  }, [botId, apiKey])

  useEffect(() => {
    fetch("/lottie/empty-bots.json")
      .then((r) => r.json())
      .then(setEmptyAnimationData)
      .catch(() => {})
  }, [])

  const loadErrorLogs = async () => {
    if (!apiKey) return
    setIsLoading(true)
    const fetchedLogs = await fetchErrorLogs(botId, apiKey)
    setErrorLogs(fetchedLogs)
    setIsLoading(false)
  }

  const handleCopyToClipboard = async (log: ErrorLog) => {
    const textToCopy = `Error: ${log.title}\n\n${log.stack_trace || "No stack trace available."}\n\nOccurred: ${new Date(
      log.created_at
    ).toLocaleString()}`
    try {
      await navigator.clipboard.writeText(textToCopy)
      toast({ title: "Copied!", description: "Error details copied to clipboard." })
      setCopiedLogId(log.id)
      setTimeout(() => setCopiedLogId(null), 1200)
    } catch (err) {
      console.error("Failed to copy:", err)
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy error details." })
      setCopiedLogId(null)
    }
  }

  const handleGoToCommand = (commandId: number) => {
    router.push(`/app/bots/${botId}/commands#cmd-${commandId}`)
  }

  const handleConfirmClearLogs = async () => {
    if (!apiKey) return
    setIsClearing(true)
    const result = await clearErrorLogs(botId, apiKey)
    if (result.success) {
      setErrorLogs([])
      setShowClearConfirm(false)
      toast({ title: "Success", description: "Error log cleared." })
    } else {
      toast({ variant: "destructive", title: "Clear Failed", description: result.error || "Could not clear error log." })
      console.error("Clear failed:", result.error)
    }
    setIsClearing(false)
  }

  return (
    // Full-bleed. No local tabs. Consistent top padding.
    <main className="absolute inset-0 flex flex-col min-w-0 pt-25">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-3xl font-bold">Error Log</h2>
          <Button
            variant="destructive"
            onClick={() => setShowClearConfirm(true)}
            disabled={isLoading || errorLogs.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Log
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : errorLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 px-6">
            {emptyAnimationData ? (
              <div className="w-64 h-64 mx-auto mb-4">
                <Lottie
                  animationData={emptyAnimationData}
                  loop
                  autoplay
                  className="w-full h-full"
                  style={{ background: "transparent" }}
                />
              </div>
            ) : (
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            )}
            <h2 className="text-xl font-semibold mt-2 mb-1">No Errors Logged</h2>
            <p className="text-muted-foreground max-w-xs">
              Looks like your bot is running smoothly! Any errors will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {errorLogs.map((log) => (
              <Card key={log.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-destructive break-words mb-1">
                      {log.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </p>
                    {log.scenario?.bot_command && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Command:{" "}
                        <Button
                          variant="link"
                          size="xs"
                          className="p-0 h-auto text-xs no-underline hover:underline"
                          onClick={() => handleGoToCommand(log.scenario!.bot_command!.id)}
                        >
                          {log.scenario.bot_command.command}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyToClipboard(log)}
                    className="gap-2 flex-shrink-0 mt-2 sm:mt-0 w-[110px]"
                    disabled={copiedLogId === log.id}
                  >
                    {copiedLogId === log.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copiedLogId === log.id ? "Copied!" : "Copy Details"}
                  </Button>
                </div>

                {log.stack_trace && (
                  <pre className="mt-3 text-xs p-2 bg-muted rounded-md whitespace-pre-wrap font-mono max-h-40 overflow-auto border">
                    <code>{log.stack_trace}</code>
                  </pre>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {showClearConfirm && (
        <DeleteConfirmModal
          title="Clear Error Log?"
          description={
            <>
              Are you sure you want to clear the entire error log for this bot?
              This action cannot be undone.
            </>
          }
          confirmText="Clear Log"
          onConfirm={handleConfirmClearLogs}
          onCancel={() => setShowClearConfirm(false)}
          isLoading={isClearing}
        />
      )}
    </main>
  )
}
