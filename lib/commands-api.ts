const API_BASE = "https://appapi.bots.business/v2"

export interface Command {
  id: number
  command: string
  answer?: string
  code?: string
  bjs_code?: string
  aliases?: Array<{ command: string }>
  group?: string
  help?: string
  keyboard_body?: string
  commands_folder_id?: number | null
  auto_retry_time?: number
  need_reply?: boolean
  updated_at?: string
  created_at?: string
}

export interface CommandsFolder {
  id: number
  title: string
}

export async function fetchCommands(botId: string, apiKey: string, page = 1): Promise<Command[]> {
  try {
    const url = `${API_BASE}/bots/${encodeURIComponent(botId)}/commands?api_key=${encodeURIComponent(apiKey)}&page=${page}`
    const res = await fetch(url)
    if (!res.ok) throw new Error("Failed to fetch commands")
    return await res.json()
  } catch (error) {
    console.error("[v0] Error fetching commands:", error)
    return []
  }
}

export async function fetchAllCommands(botId: string, apiKey: string): Promise<Command[]> {
  const all: Command[] = []
  let page = 1
  const maxPages = 100

  for (; page <= maxPages; page++) {
    const data = await fetchCommands(botId, apiKey, page)
    if (data.length === 0) break
    all.push(...data)
  }

  return all
}

export async function fetchCommandById(botId: string, commandId: string, apiKey: string): Promise<Command | null> {
  try {
    const url = `${API_BASE}/bots/${encodeURIComponent(botId)}/commands/${encodeURIComponent(commandId)}?api_key=${encodeURIComponent(apiKey)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error("Failed to fetch command")
    return await res.json()
  } catch (error) {
    console.error("[v0] Error fetching command:", error)
    return null
  }
}

export async function createCommand(botId: string, apiKey: string, command: Partial<Command>): Promise<Command | null> {
  try {
    const url = `${API_BASE}/bots/${encodeURIComponent(botId)}/commands?api_key=${encodeURIComponent(apiKey)}`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(command),
    })
    if (!res.ok) throw new Error("Failed to create command")
    return await res.json()
  } catch (error) {
    console.error("[v0] Error creating command:", error)
    return null
  }
}

export async function updateCommand(
  botId: string,
  commandId: string,
  apiKey: string,
  command: Partial<Command>,
): Promise<Command | null> {
  try {
    const url = `${API_BASE}/bots/${encodeURIComponent(botId)}/commands/${encodeURIComponent(commandId)}?api_key=${encodeURIComponent(apiKey)}`
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(command),
    })
    if (!res.ok) throw new Error("Failed to update command")
    return await res.json()
  } catch (error) {
    console.error("[v0] Error updating command:", error)
    return null
  }
}

export async function deleteCommand(botId: string, commandId: string, apiKey: string): Promise<boolean> {
  try {
    const url = `${API_BASE}/bots/${encodeURIComponent(botId)}/commands/${encodeURIComponent(commandId)}?api_key=${encodeURIComponent(apiKey)}`
    const res = await fetch(url, { method: "DELETE" })
    return res.ok
  } catch (error) {
    console.error("[v0] Error deleting command:", error)
    return false
  }
}

export async function fetchFolders(botId: string, apiKey: string): Promise<CommandsFolder[]> {
  try {
    const url = `${API_BASE}/bots/${encodeURIComponent(botId)}/commands_folders?api_key=${encodeURIComponent(apiKey)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error("Failed to fetch folders")
    return await res.json()
  } catch (error) {
    console.error("[v0] Error fetching folders:", error)
    return []
  }
}
