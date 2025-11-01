"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CustomSwitch } from "@/components/custom-switch"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Zap,
  Info,
} from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://appapi.bots.business/v2"
const API_KEY_STORAGE_KEY = process.env.NEXT_PUBLIC_API_KEY_STORAGE_KEY || "bb_api_key"
const apiUrl = (p: string) => `${API_BASE}${p.startsWith("/") ? p : `/${p}`}`

type IterationRes = {
  id: number
  limit: number
  progress: number
  quotum_type_id: number
  user_id: number
  started_at: string
  created_at: string
  updated_at: string
  extra_points: number
  ended_at: string
  paid_cycles_count: number
  have_ads: boolean
  quotum_type: {
    id: number
    name: string
    base_limit: number
    payment_plan_id: number
    created_at: string
    updated_at: string
    ads_limit: number
  }
}

type PlanRes = {
  id: number
  name: string
  created_at: string
  updated_at: string
  can_have_ads: boolean
  command_execution_timeout: number
  priority: number
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

async function apiGet(path: string) {
  const res = await apiFetch(path)
  const d = await res.json().catch(() => null)
  return { ok: res.ok, data: d, status: res.status }
}

async function apiPost(path: string, body?: any) {
  const res = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  const d = await res.json().catch(() => null)
  return { ok: res.ok, data: d, status: res.status }
}

export default function IterationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toast } = useToast()

  const [iterations, setIterations] = useState<IterationRes | null>(null)
  const [plan, setPlan] = useState<PlanRes | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [togglingAds, setTogglingAds] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [it, pl] = await Promise.all([
        apiGet("/user/iterations"),
        apiGet("/user/payment_plan"),
      ])

      if (!it.ok) throw new Error(parseErr(it))
      if (!pl.ok) throw new Error(parseErr(pl))

      setIterations(it.data as IterationRes)
      setPlan(pl.data as PlanRes)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load data"
      if (msg === "Unauthorized" || msg === "No API key") {
        return
      }
      setError(msg)
      toast({ variant: "destructive", title: "Load failed", description: msg })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const parseErr = (res: { status: number; data: any }) =>
    res.data?.error || `HTTP ${res.status}`

  const pct = useMemo(() => {
    if (!iterations) return 0
    const p = (iterations.progress / Math.max(1, iterations.limit)) * 100
    return Math.min(100, Math.max(0, Number.isFinite(p) ? p : 0))
  }, [iterations])

  const remaining = useMemo(() => {
    if (!iterations) return 0
    return Math.max(0, iterations.limit - iterations.progress)
  }, [iterations])

  const nextCreditAt = useMemo(() => {
    if (!iterations?.ended_at) return null
    const d = new Date(iterations.ended_at)
    if (isNaN(d.getTime())) return null
    return d
  }, [iterations])

  const startedAt = useMemo(() => {
    if (!iterations?.started_at) return null
    const d = new Date(iterations.started_at)
    return isNaN(d.getTime()) ? null : d
  }, [iterations])

  const handleToggleAds = async () => {
    if (!iterations) return
    setTogglingAds(true)
    try {
      const r = await apiPost("/user/iterations/toggle_ads")
      if (!r.ok) throw new Error(parseErr(r))
      setIterations(r.data as IterationRes)
      toast({
        title: "Ads preference updated",
        description: r.data.have_ads ? "Ads enabled (higher limit)." : "Ads disabled.",
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Toggle failed"
      toast({ variant: "destructive", title: "Toggle failed", description: msg })
    } finally {
      setTogglingAds(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 space-y-6">
          <h1 className="text-3xl font-bold">Iteration</h1>

          <Card>
            <CardHeader className="flex flex-col gap-1">
              <CardTitle className="flex items-center justify-between">
                <span>Usage</span>
                {plan ? (
                  <Badge variant="secondary" className="text-xs">
                    Plan: {plan.name}
                  </Badge>
                ) : null}
              </CardTitle>

              {startedAt || nextCreditAt ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground">
                  {startedAt ? (
                    <span>Started: {startedAt.toLocaleString()}</span>
                  ) : null}
                  {nextCreditAt ? (
                    <span>Next credit: {nextCreditAt.toLocaleString()}</span>
                  ) : null}
                </div>
              ) : null}
            </CardHeader>

            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading usage…</span>
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              ) : iterations ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-medium">
                      {Intl.NumberFormat().format(iterations.progress)} used
                      <span className="text-muted-foreground">
                        {" "}
                        / {Intl.NumberFormat().format(iterations.limit)} total
                      </span>
                    </div>
                    <div className="text-muted-foreground hidden sm:block">
                      {Intl.NumberFormat().format(remaining)} remaining
                    </div>
                  </div>

                  <Progress value={pct} className="h-3" />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">
                          Extra Points: {iterations.extra_points}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        (auto-used when you hit the limit)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        {iterations.have_ads ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="text-emerald-600">Ads enabled</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Ads disabled</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <CustomSwitch
                          id="ads-toggle"
                          className="scale-65"
                          checked={iterations.have_ads}
                          onCheckedChange={handleToggleAds}
                          disabled={togglingAds || loading}
                        />
                        <span className="text-sm">
                          {togglingAds ? "Updating…" : "Ads"}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No iteration data available.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading plan…</span>
                </div>
              ) : plan ? (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge>{plan.name}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span>Priority: {plan.priority}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-lg border p-4">
                      <div className="text-xs text-muted-foreground">Ads Allowed</div>
                      <div className="mt-1 flex items-center gap-2">
                        {plan.can_have_ads ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm">Yes</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-destructive" />
                            <span className="text-sm">No</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="text-xs text-muted-foreground">Exec Timeout</div>
                      <div className="mt-1 text-sm font-medium">
                        {plan.command_execution_timeout}s
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="text-xs text-muted-foreground">Next Due</div>
                      <div className="mt-1 text-sm font-medium">
                        {nextCreditAt ? nextCreditAt.toLocaleString() : "—"}
                      </div>
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <a href="/app/cloud">
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Upgrade Plan
                    </a>
                  </Button>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No plan data.</div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}