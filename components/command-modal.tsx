"use client"

import { useState, useEffect } from "react"
import type { Command, CommandsFolder } from "@/lib/commands-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

interface CommandModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (command: Partial<Command>) => Promise<void>
  command?: Command | null
  folders: CommandsFolder[]
  isLoading?: boolean
}

export function CommandModal({
  isOpen,
  onClose,
  onSave,
  command,
  folders,
  isLoading = false,
}: CommandModalProps) {
  const [formData, setFormData] = useState<Omit<Partial<Command>, "aliases">>({
    command: "",
    answer: "",
    group: "",
    help: "",
    keyboard_body: "",
    commands_folder_id: null,
    auto_retry_time: undefined,
    need_reply: false,
  })

  const [aliases, setAliases] = useState<string[]>([])
  const [aliasInput, setAliasInput] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    // Set defaults for a new command
    setFormData({
      command: "",
      answer: "",
      group: "",
      help: "",
      keyboard_body: "",
      commands_folder_id: null,
      auto_retry_time: undefined,
      need_reply: false,
    })
    setAliases([])

    // If editing, override with existing command data
    if (command) {
      setFormData({
        command: command.command || "",
        answer: command.answer || "",
        group: command.group || "",
        help: command.help || "",
        keyboard_body: command.keyboard_body || "",
        commands_folder_id: command.commands_folder_id || null,
        auto_retry_time: command.auto_retry_time,
        need_reply: command.need_reply || false,
      })
      setAliases(
        Array.isArray(command.aliases)
          ? command.aliases.map((a) => a.command)
          : []
      )
    }

    setAliasInput("")
    setError("")
  }, [command, isOpen])

  const handleAddAlias = () => {
    if (aliasInput.trim() && !aliases.includes(aliasInput.trim())) {
      setAliases([...aliases, aliasInput.trim()])
      setAliasInput("")
    }
  }

  const handleRemoveAlias = (alias: string) => {
    setAliases(aliases.filter((a) => a !== alias))
  }

  const handleSubmit = async () => {
    if (!formData.command?.trim()) {
      setError("Command name is required")
      return
    }

    try {
      await onSave({
        ...formData,
        aliases: aliases.map((a) => ({ command: a })),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save command")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border rounded-lg max-w-2xl w-full flex flex-col max-h-[90vh]">
        {/* Header: Reduced padding from p-6 to p-4 */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-10">
          <h2 className="text-xl font-bold">
            {command ? "Edit Command" : "New Command"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Reduced padding, added overflow-y-auto */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
              {error}
            </div>
          )}

          {/* FIX: Changed to grid-cols-1 on mobile, md:grid-cols-2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Command</label>
              <Input
                placeholder="/start"
                value={formData.command || ""}
                onChange={(e) =>
                  setFormData({ ...formData, command: e.target.value })
                }
                className="cursor-pointer"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Group IDs (comma separated)
              </label>
              <Input
                placeholder="-100123,-100456"
                value={formData.group || ""}
                onChange={(e) =>
                  setFormData({ ...formData, group: e.target.value })
                }
                className="cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Aliases</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="help, ❤ Help"
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddAlias()}
                className="cursor-pointer"
              />
              <Button
                onClick={handleAddAlias}
                variant="outline"
                className="cursor-pointer"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {aliases.map((alias) => (
                <div
                  key={alias}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1.5"
                >
                  {alias}
                  <button
                    onClick={() => handleRemoveAlias(alias)}
                    className="rounded-full p-0.5 hover:bg-primary/20"
                    aria-label={`Remove ${alias} alias`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Answer (up to 4096 chars)
            </label>
            <Textarea
              placeholder="Plain text answer"
              value={formData.answer || ""}
              onChange={(e) =>
                setFormData({ ...formData, answer: e.target.value })
              }
              maxLength={4096}
              rows={3}
              className="cursor-pointer"
            />
          </div>

          {/* FIX: Changed to grid-cols-1 on mobile, md:grid-cols-2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Reply Keyboard</label>
              <Textarea
                placeholder="Contact, Reach out&#10;Support"
                value={formData.keyboard_body || ""}
                onChange={(e) =>
                  setFormData({ ...formData, keyboard_body: e.target.value })
                }
                rows={2}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma = same row, newline = next row
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Folder</label>
              <select
                value={formData.commands_folder_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commands_folder_id: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                className="flex h-10 w-full rounded-md border border-input bg-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                <option value="">— No folder —</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FIX: Changed to grid-cols-1 on mobile, md:grid-cols-2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Help (&lt;= 200 chars)</label>
              <Input
                placeholder="Help text"
                value={formData.help || ""}
                onChange={(e) =>
                  setFormData({ ...formData, help: e.g.target.value })
                }
                maxLength={200}
                className="cursor-pointer"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Auto retry time (ms)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={formData.auto_retry_time || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    auto_retry_time: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                min="0"
                step="100"
                className="cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="needReply"
              checked={formData.need_reply || false}
              onChange={(e) =>
                setFormData({ ...formData, need_reply: e.target.checked })
              }
              className="h-4 w-4 rounded border-muted-foreground text-primary focus:ring-primary cursor-pointer"
            />
            <label
              htmlFor="needReply"
              className="text-sm font-medium cursor-pointer"
            >
              Wait for answer
            </label>
          </div>
        </div>

        {/* Footer: Reduced padding from p-6 to p-4 */}
        <div className="flex gap-2 p-4 border-t sticky bottom-0 bg-card z-10">
          <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="cursor-pointer"
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  )
}