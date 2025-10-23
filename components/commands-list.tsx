"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Pencil, Code2, Trash2, Search as SearchIcon, X, Folder, FolderOpen } from "lucide-react"
import clsx from "clsx"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

export type Command = {
  id: number
  command: string
  answer?: string | null
  aliases?: unknown
  help?: string | null
  keyboard_body?: string | null
  updated_at?: string
  commands_folder_id?: number | string | null
  bjs_code?: string | null
  code?: string | null
}

export type CommandsFolder = { id: number | string; name?: string; title?: string }

type Props = {
  commands: Command[]
  folders: CommandsFolder[]
  onEdit: (c: Command) => void
  onCode: (c: Command) => void
  onDelete: (c: Command) => void
  onCreate: () => void
  isLoading?: boolean
  className?: string
}

function toAliasText(aliases: unknown): string {
  if (!aliases) return ""
  if (typeof aliases === "string") return aliases
  if (Array.isArray(aliases)) {
    return aliases
      .map((a) => {
        if (typeof a === "string") return a
        if (a && typeof a === "object" && "command" in a) return typeof (a as any).command === "string" ? (a as any).command : ""
        return ""
      })
      .filter(Boolean)
      .join(", ")
  }
  if (typeof aliases === "object" && "command" in (aliases as any)) {
    const c = (aliases as any).command
    return typeof c === "string" ? c : ""
  }
  return ""
}

export function CommandsList(props: Props) {
  const { commands, folders, onEdit, onCode, onDelete, onCreate, isLoading, className } = props

  const folderMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const f of folders || []) {
      const id = String(f.id)
      const label = (f.name ?? f.title ?? "").toString().trim()
      m.set(id, label || `Folder ${id}`)
    }
    return m
  }, [folders])

  const [q, setQ] = useState("")
  const [activeFolder, setActiveFolder] = useState<string | "all">("all")
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [emptyAnimationData, setEmptyAnimationData] = useState<any>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    fetch("/lottie/empty-bots.json")
      .then((r) => r.json())
      .then(setEmptyAnimationData)
      .catch(() => {})
  }, [])

  const normalized = useMemo(() => {
    const nq = q.trim().toLowerCase()
    const hasQuery = nq.length > 0
    return commands.filter((c) => {
      const fid = c.commands_folder_id == null ? "" : String(c.commands_folder_id)
      if (activeFolder !== "all" && fid !== activeFolder) return false
      if (!hasQuery) return true
      const inCmd = c.command.toLowerCase().includes(nq)
      const aliasText = toAliasText(c.aliases).toLowerCase()
      const inAlias = aliasText.includes(nq)
      return inCmd || inAlias
    })
  }, [commands, q, activeFolder])

  const totalCount = commands.length
  const filteredCount = normalized.length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    // No outer horizontal padding. This keeps the page 100% width.
    <div className={clsx("min-w-0 space-y-6", className)}>
      <div className="flex flex-col gap-4 min-w-0 px-2 sm:px-3 md:px-4">
        <div className="flex items-start sm:items-center justify-between gap-3 min-w-0">
          <div className="space-y-1 min-w-0">
            <h2 className="text-3xl font-bold">Commands</h2>
            <p className="text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{totalCount}</span> {" - "}
              Showing: <span className="font-semibold text-foreground">{filteredCount}</span>
            </p>
          </div>
          <Button onClick={onCreate} className="self-start sm:self-auto">New Command</Button>
        </div>

        <div className="relative group min-w-0">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
          <Input
            ref={searchRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by command or alias… (Ctrl+K)"
            className="pl-9 pr-10 h-10 bg-card focus:ring-2 focus:ring-primary/20"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Folder filter bar – full width, no outer gutters */}
        <div className="w-full overflow-hidden">
          <div
            className="max-w-full overflow-x-auto overflow-y-hidden whitespace-nowrap [scrollbar-gutter:stable] snap-x snap-mandatory"
            role="tablist"
            aria-label="Command folders"
            style={{ contain: "inline-size" }}
          >
            <div className="flex w-fit items-center gap-2 py-1 px-2">
              <button
                role="tab"
                aria-selected={activeFolder === "all"}
                onClick={() => setActiveFolder("all")}
                className={clsx(
                  "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm max-w-[60vw] md:max-w-[28ch] snap-start",
                  "transition-colors",
                  activeFolder === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted border-border text-foreground"
                )}
              >
                <FolderOpen className="w-4 h-4" />
                <span className="truncate">All</span>
              </button>

              {folders.map((f) => {
                const id = String(f.id)
                const label = (f.name ?? f.title ?? "").toString().trim() || `Folder ${id}`
                const active = activeFolder === id
                return (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveFolder(id)}
                    className={clsx(
                      "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm max-w-[60vw] md:max-w-[28ch] snap-start",
                      "transition-colors",
                      active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-border text-foreground"
                    )}
                    title={label}
                  >
                    <Folder className="w-4 h-4" />
                    <span className="truncate">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Cards section – still full-bleed; local padding inside cards only */}
      <div className="grid gap-4 min-w-0 px-2 sm:px-3 md:px-4">
        {normalized.map((cmd) => {
          const fid = cmd.commands_folder_id == null ? "" : String(cmd.commands_folder_id)
          const folderName = fid ? folderMap.get(fid) || `Folder ${fid}` : "—"
          const aliasText = toAliasText(cmd.aliases)
          return (
            <Card key={cmd.id} className="p-4">
              <div className="flex flex-col gap-2 min-w-0">
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <h3 className="text-lg font-semibold break-all">{cmd.command}</h3>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Folder: {folderName}</div>
                  {aliasText ? (
                    <div className="truncate">
                      Aliases: <span className="text-foreground">{aliasText}</span>
                    </div>
                  ) : null}
                  {cmd.updated_at && <div>Updated: {new Date(cmd.updated_at).toLocaleString()}</div>}
                </div>
                <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-end">
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onEdit(cmd)}>
                      <Pencil className="w-4 h-4 mr-1.5" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onCode(cmd)}>
                      <Code2 className="w-4 h-4 mr-1.5" />
                      Code
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(cmd)}>
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}

        {normalized.length === 0 && (
          <div className="p-0 text-center">
            <div className="flex flex-col items-center justify-center space-y-6 p-6">
              {emptyAnimationData ? (
                <div className="mx-auto pointer-events-none w-full max-w-xs sm:max-w-sm md:max-w-md aspect-square overflow-hidden">
                  <Lottie animationData={emptyAnimationData} loop autoplay className="w-full h-full" style={{ background: "transparent" }} />
                </div>
              ) : (
                <div className="w-24 h-24 flex items-center justify-center mb-4">
                  <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
                </div>
              )}
              <p className="text-muted-foreground text-lg">No commands match your filters.</p>
              <div className="flex gap-2">
                {q && (
                  <Button variant="ghost" onClick={() => setQ("")} className="mt-2">
                    Clear search
                  </Button>
                )}
                {activeFolder !== "all" && (
                  <Button variant="ghost" onClick={() => setActiveFolder("all")} className="mt-2">
                    Show all folders
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
