"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CommandsList } from "@/components/commands-list"
import { CommandModal } from "@/components/command-modal"
import CodeEditor from "@/components/code-editor"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import {
  type Command,
  type CommandsFolder,
  fetchFolders,
  createCommand,
  updateCommand,
  deleteCommand,
} from "@/lib/commands-api"

const normalizeCommandAliases = (cmd: Command): Command => {
  if (Array.isArray(cmd.aliases)) {
    return { ...cmd, aliases: (cmd.aliases as any[]).map((a: any) => a.command) }
  }
  return cmd
}

export default function CommandsPage() {
  const params = useParams()
  const router = useRouter()
  const botId = params.id as string

  const [commands, setCommands] = useState<Command[]>([])
  const [folders, setFolders] = useState<CommandsFolder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Command | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const apiKey = typeof window !== "undefined" ? localStorage.getItem(process.NEXT_PUBLIC_API_KEY_STORAGE_KE) : null

  useEffect(() => {
    loadData()
  }, [botId, apiKey])

  useEffect(() => {
    if (!commands.length) return
    const h = window.location.hash || ""
    const m = h.match(/^#cmd-(\d+)$/)
    if (!m) return
    const id = Number.parseInt(m[1])
    const cmd = commands.find((c) => c.id === id)
    if (cmd) {
      setSelectedCommand(cmd)
      setIsEditorOpen(true)
    } else {
      history.replaceState(null, "", window.location.pathname + window.location.search)
    }
  }, [commands])

  useEffect(() => {
    const onPop = () => {
      if (!window.location.hash && isEditorOpen) {
        setIsEditorOpen(false)
        setSelectedCommand(null)
      }
    }
    window.addEventListener("popstate", onPop)
    window.addEventListener("hashchange", onPop)
    return () => {
      window.removeEventListener("popstate", onPop)
      window.removeEventListener("hashchange", onPop)
    }
  }, [isEditorOpen])

  const loadData = async () => {
    if (!apiKey) return
    setIsLoading(true)
    try {
      const all: Command[] = []
      let page = 1
      while (true) {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/${botId}/commands?page=${page}&api_key=${apiKey}`
        const r = await fetch(url)
        if (!r.ok) throw new Error("Failed to fetch commands")
        const batch: Command[] = await r.json()
        if (!Array.isArray(batch) || batch.length === 0) break
        all.push(...batch)
        page += 1
      }
      const fldrs = await fetchFolders(botId, apiKey)
      setCommands(all.map(normalizeCommandAliases))
      setFolders(fldrs)
    } catch (e) {
      console.error("[commands] load error:", e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCommand = async (data: Partial<Command>) => {
    if (!apiKey) return
    setIsSaving(true)
    try {
      const result = await createCommand(botId, apiKey, data)
      if (result) {
        setCommands((prev) => [...prev, normalizeCommandAliases(result)])
        setIsModalOpen(false)
      }
    } catch (e) {
      console.error("[commands] create error:", e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateCommand = async (data: Partial<Command>) => {
    if (!apiKey || !selectedCommand) return
    setIsSaving(true)
    try {
      const result = await updateCommand(botId, String(selectedCommand.id), apiKey, data)
      if (result) {
        const normalizedResult = normalizeCommandAliases(result)
        setCommands((prev) => prev.map((c) => (c.id === result.id ? normalizedResult : c)))
        setSelectedCommand(normalizedResult)
        setIsModalOpen(false)
      }
    } catch (e) {
      console.error("[commands] update error:", e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveCode = async (code: string) => {
    if (!apiKey || !selectedCommand) return
    setIsSaving(true)
    try {
      const result = await updateCommand(botId, String(selectedCommand.id), apiKey, {
        bjs_code: code,
        command: selectedCommand.command,
        answer: selectedCommand.answer,
        aliases: (selectedCommand.aliases as string[]).map((a: string) => ({ command: a })),
        help: selectedCommand.help,
        keyboard_body: selectedCommand.keyboard_body,
        commands_folder_id: selectedCommand.commands_folder_id,
        auto_retry_time: (selectedCommand as any).auto_retry_time,
        need_reply: (selectedCommand as any).need_reply,
      })
      if (result) {
        const normalizedResult = normalizeCommandAliases(result)
        setCommands((prev) => prev.map((c) => (c.id === result.id ? normalizedResult : c)))
        setSelectedCommand(normalizedResult)
      }
    } catch (e) {
      console.error("[commands] save code error:", e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!apiKey || !deleteConfirm) return
    setIsDeleting(true)
    try {
      await deleteCommand(botId, String(deleteConfirm.id), apiKey)
      setCommands((prev) => prev.filter((c) => c.id !== deleteConfirm.id))
      setDeleteConfirm(null)
    } catch (e) {
      console.error("[commands] delete error:", e)
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditor = (cmd: Command) => {
    setSelectedCommand(cmd)
    setIsEditorOpen(true)
    const newHash = `#cmd-${cmd.id}`
    if (window.location.hash !== newHash) history.pushState(null, "", newHash)
  }

  const requestCloseEditor = () => {
    setIsEditorOpen(false)
    setSelectedCommand(null)
    history.back()
  }

  const currentCommandName = useMemo(() => selectedCommand?.command || "", [selectedCommand])

  return (
    // Full-bleed, no outer padding/gutters from parent layout
    <main className="absolute inset-0 flex flex-col min-w-0 pt-30 sm:pt-30">
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        <CommandsList
          className="min-w-0" // do not re-introduce horizontal padding
          commands={commands}
          folders={folders}
          onEdit={(cmd) => {
            setSelectedCommand(cmd)
            setIsModalOpen(true)
          }}
          onCode={(cmd) => openEditor(cmd)}
          onDelete={(cmd) => setDeleteConfirm(cmd)}
          onCreate={() => {
            setSelectedCommand(null)
            setIsModalOpen(true)
          }}
          isLoading={isLoading}
        />
      </div>

      <CodeEditor
        isOpen={isEditorOpen}
        onClose={requestCloseEditor}
        onSave={handleSaveCode}
        commandName={currentCommandName}
        initialCode={selectedCommand?.code || selectedCommand?.bjs_code || ""}
        isLoading={isSaving}
        showCloseOnMobile={true}
        onEditMeta={() => setIsModalOpen(true)}
      />

      <CommandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={selectedCommand ? handleUpdateCommand : handleCreateCommand}
        command={selectedCommand}
        folders={folders}
        isLoading={isSaving}
      />

      {deleteConfirm && (
        <DeleteConfirmModal
          title="Delete Command?"
          description={
            <>
              Delete <span className="font-semibold text-foreground">{deleteConfirm.command}</span>? This cannot be undone.
            </>
          }
          confirmText="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm(null)}
          isLoading={isDeleting}
        />
      )}
    </main>
  )
}
