"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Pencil, Code2, Trash2, Search as SearchIcon, X } from "lucide-react"
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
        if (a && typeof a === "object" && "command" in a)
          // @ts-ignore
          return typeof a.command === "string" ? a.command : ""
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

  const countByFolder = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of commands) {
      const id = c.commands_folder_id == null ? "" : String(c.commands_folder_id)
      map.set(id, (map.get(id) || 0) + 1)
    }
    return map
  }, [commands])

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
    <div className={clsx("space-y-6", className)}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold">Commands</h2>
            <p className="text-muted-foreground">
              Total <span className="font-semibold text-foreground">{totalCount}</span>
              {q || activeFolder !== "all" ? (
                <>
                  {" · "}Showing <span className="font-semibold text-foreground">{filteredCount}</span>
                </>
              ) : null}
            </p>
          </div>
          <Button onClick={onCreate} className="self-start sm:self-auto">New Command</Button>
        </div>

        <div className="relative group">
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

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <FolderPill
            label={`All (${totalCount})`}
            active={activeFolder === "all"}
            onClick={() => setActiveFolder("all")}
          />
          {folders.map((f) => {
            const id = String(f.id)
            const name = folderMap.get(id) || `Folder ${id}`
            const cnt = countByFolder.get(id) || 0
            return (
              <FolderPill
                key={id}
                label={`${name} (${cnt})`}
                active={activeFolder === id}
                onClick={() => setActiveFolder(id)}
              />
            )
          })}
        </div>
      </div>

      <div className="grid gap-4">
        {normalized.map((cmd) => {
          const fid = cmd.commands_folder_id == null ? "" : String(cmd.commands_folder_id)
          const folderName = fid ? (folderMap.get(fid) || `Folder ${fid}`) : "—"
          const aliasText = toAliasText(cmd.aliases)
          return (
            <Card key={cmd.id} className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold break-all">{cmd.command}</h3>
                </div>

                <div className="text-sm text-muted-foreground">
                  <div>Folder: {folderName}</div>
                  {aliasText ? (
                    <div className="truncate">
                      Aliases: <span className="text-foreground">{aliasText}</span>
                    </div>
                  ) : null}
                  {cmd.updated_at && (
                    <div>Updated: {new Date(cmd.updated_at).toLocaleString()}</div>
                  )}
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
          <Card className="p-8 text-center border-muted bg-card/50">
            <div className="flex flex-col items-center justify-center space-y-6 p-6">
              {emptyAnimationData ? (
                <div className="w-64 h-64 mx-auto -mb-4">
                  <Lottie
                    animationData={emptyAnimationData}
                    loop
                    autoplay
                    className="w-full h-full"
                    style={{ background: "transparent" }}
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-4 border border-border">
                  <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
                </div>
              )}
              <p className="text-muted-foreground text-lg">No commands match your filters.</p>
              <Button variant="ghost" onClick={() => setQ("")} className="mt-2">
                Clear search
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

function FolderPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-3 py-1.5 text-sm rounded-full border transition-colors whitespace-nowrap",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card hover:bg-accent/50 border-border text-foreground"
      )}
    >
      {label}
    </button>
  )
}
