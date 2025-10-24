"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Cloud,
  Gauge,
  Zap,
  CheckCircle2,
  Info,
  Loader2,
  ArrowRight,
} from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://appapi.bots.business/v2"
const API_KEY_STORAGE_KEY = process.env.NEXT_PUBLIC_API_KEY_STORAGE_KEY || "bb_api_key"
const apiUrl = (p: string) => `${API_BASE}${p.startsWith("/") ? p : `/${p}`}`

type CloudPlan = {
  name: string
  iterations: number
  cost: number
  description: string
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const apiKey = typeof window !== "undefined" ? localStorage.getItem(API_KEY_STORAGE_KEY) : null
  if (!apiKey) {
    if (typeof window !== "undefined") window.location.href = "/app"
    throw new Error("No API key")
  }
  const sep = path.includes("?") ? "&" : "?"
  const url = apiUrl(`${path}${sep}api_key=${encodeURIComponent(apiKey)}`)
  const res = await fetch(url, { cache: "no-store", ...options })
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(API_KEY_STORAGE_KEY)
      window.location.href = "/app"
    }
    throw new Error("Unauthorized")
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res
}

export default function CloudPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toast } = useToast()

  const [plans, setPlans] = useState<CloudPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPlans = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch("/clouds")
      const data = await res.json()
      setPlans(Array.isArray(data) ? data : [])
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      if (errorMsg === "Unauthorized" || errorMsg === "No API key") {
        return
      }
      setError(errorMsg)
      toast({
        variant: "destructive",
        title: "Failed to load plans",
        description: errorMsg,
      })
      setPlans([])
    }
    setLoading(false)
  }, [toast])

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  const pretty = (n: number) =>
    Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)

  const short = (n: number) => {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return `${n}`
  }

  const orderedPlans = useMemo(() => {
    return [...plans].sort((a, b) => a.iterations - b.iterations)
  }, [plans])

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Cloud</h1>
              <p className="text-muted-foreground">
                Dedicated BB.Cloud instances with monthly iteration quotas.
              </p>
            </div>
          </div>

          <section>
            {loading ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading plans…
              </div>
            ) : error ? (
              <div className="text-destructive">{error}</div>
            ) : orderedPlans.length === 0 ? (
              <div className="text-muted-foreground">No plans available.</div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {orderedPlans.map((p) => {
                  const orderUrl = `https://t.me/BotsBusinessAdminBot?start=${encodeURIComponent(
                    `order-${p.name}`
                  )}`

                  return (
                    <Card
                      key={p.name}
                      className="overflow-hidden border-muted/60 hover:shadow-md transition"
                    >
                      <CardHeader className="relative">
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-blue-600/10 via-transparent to-transparent" />
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Cloud className="h-5 w-5 text-blue-600" />
                            <span>{p.name.replace("Cloud.", "")}</span>
                          </CardTitle>
                          <Badge variant="secondary" className="font-normal">
                            {short(p.iterations)} iters/mo
                          </Badge>
                        </div>
                        <div className="mt-2 text-3xl font-bold">
                          ${p.cost}
                          <span className="text-sm font-medium text-muted-foreground">
                            {" "}
                            / month
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="rounded-lg border p-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Gauge className="h-4 w-4" />
                            <span>
                              Iterations:{" "}
                              <span className="font-medium">{pretty(p.iterations)}</span>{" "}
                              / month
                            </span>
                          </div>
                          <div className="mt-2 flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                            <span className="text-muted-foreground">{p.description}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="text-muted-foreground">
                              Dedicated BB.Cloud capacity
                            </span>
                          </div>
                        </div>

                        <Button asChild className="w-full">
                          <a href={orderUrl} target="_blank" rel="noopener noreferrer">
                            Order {p.name} <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  What’s different: BB.Cloud vs BB.General?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">BB.Cloud</span> — your
                    own server instance.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">BB.Cloud</span> has big
                    iterations.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">BB.General</span> — all
                    resources are shared across non-cloud bots.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">BB.Cloud</span> — resources
                    are shared only between <em>your</em> bots.
                  </li>
                </ul>
                <a
                  href="https://help.bots.business/cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Read more
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  How much load can a cloud handle?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>1 user can run 1000 commands per hour.</li>
                  <li>1000 users can run 1 command per hour.</li>
                  <li>Same total usage. No limit on number of users or bots.</li>
                </ul>
                <a
                  href="https://help.bots.business/cloud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Read more
                </a>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  )
}