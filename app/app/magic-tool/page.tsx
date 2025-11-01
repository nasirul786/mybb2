"use client"
import {
  useState,
  useEffect,
  ChangeEvent,
  DragEvent,
  useRef,
  useCallback,
} from "react"
import dynamic from "next/dynamic"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CustomSwitch } from "@/components/custom-switch"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Search,
  Download,
  Upload,
  FileJson,
  X,
  FileDown,
  FileCheck2,
  Check,
} from "lucide-react"
import { MagicToolTerminal } from "@/components/magic-tool-terminal"
import { AnimatedTabSwitcher, TabConfig } from "@/components/tab-switcher"
import { StyledBotSelector } from "@/components/radio-button"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://appapi.bots.business/v2"
const API_KEY_STORAGE_KEY = process.env.NEXT_PUBLIC_API_KEY_STORAGE_KEY || "bb_api_key"
const apiUrl = (p: string) => `${API_BASE}${p.startsWith("/") ? p : `/${p}`}`

type Bot = {
  id: string
  name: string
}

type Command = {
  command: string
  help: string | null
  answer: string | null
  keyboard_body: string | null
  need_reply: boolean
  commands_folder: { title: string } | null
  aliases: { command: string }[]
  code: string
}

type ExportData = {
  bot: { name: string; token: string | null }
  commands: any[]
  folders: string[]
  libs: string[]
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

async function apiPost(
  path: string,
  body: any
): Promise<{ ok: boolean; data: any; error?: string }> {
  try {
    const res = await apiFetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const d = await res.json().catch(() => null)
    return { ok: true, data: d }
  } catch (e) {
    return { ok: false, data: null, error: e instanceof Error ? e.message : String(e) }
  }
}

async function apiGet(
  path: string
): Promise<{ ok: boolean; data: any; error?: string }> {
  try {
    const res = await apiFetch(path)
    const d = await res.json().catch(() => null)
    return { ok: true, data: d }
  } catch (e) {
    return { ok: false, data: null, error: e instanceof Error ? e.message : String(e) }
  }
}

export default function MagicToolPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toast } = useToast()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [bots, setBots] = useState<Bot[]>([])
  const [filteredBots, setFilteredBots] = useState<Bot[]>([])
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null)
  const [isLoadingBots, setIsLoadingBots] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [emptyAnimationData, setEmptyAnimationData] = useState<any>(null)
  const [includeToken, setIncludeToken] = useState(false)
  const [autoDownload, setAutoDownload] = useState(false)
  const [loadedJsonFile, setLoadedJsonFile] = useState<ExportData | null>(null)
  const [uploadBotName, setUploadBotName] = useState("")
  const [uploadBotToken, setUploadBotToken] = useState("")
  const [uploadAutoStart, setUploadAutoStart] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])
  const [terminalBlobUrl, setTerminalBlobUrl] = useState<string | null>(null)
  const [terminalFilename, setTerminalFilename] = useState("")
  const [isTerminalBusy, setIsTerminalBusy] = useState(false)
  const [storeLibMap, setStoreLibMap] = useState<Record<string, string> | null>(
    null
  )
  const [currentTab, setCurrentTab] = useState("download")

  const tabConfigs: TabConfig[] = [
    { value: "download", label: "Download Bot", icon: <Download className="w-4 h-4" /> },
    { value: "upload", label: "Upload Bot", icon: <Upload className="w-4 h-4" /> },
  ]

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const loadBots = useCallback(async () => {
    setIsLoadingBots(true)
    const res = await apiGet(`/bots`)
    if (!res.ok) {
      toast({
        variant: "destructive",
        title: "Failed to load bots",
        description: res.data?.error || res.error || "Unknown error",
      })
      setBots([])
    } else {
      setBots(Array.isArray(res.data) ? res.data : [])
    }
    setIsLoadingBots(false)
  }, [toast])

  useEffect(() => {
    const key = localStorage.getItem(API_KEY_STORAGE_KEY)
    setApiKey(key)
    if (key) {
      loadBots()
    } else {
      setIsLoadingBots(false)
      toast({
        variant: "destructive",
        title: "API Key Not Found",
        description: "Please set your API key in the app settings.",
      })
    }
  }, [toast, loadBots])

  useEffect(() => {
    fetch("/lottie/empty-bots.json")
      .then((r) => r.json())
      .then(setEmptyAnimationData)
      .catch(() => {})
  }, [])

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase()
    setFilteredBots(bots.filter((b) => b.name.toLowerCase().includes(q)))
  }, [searchQuery, bots])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const logAppend = (msg: string) => {
    const now = new Date().toLocaleTimeString()
    setTerminalLogs((prev) => [...prev, `[${now}] ${msg}`])
  }

  const openTerminal = () => {
    setTerminalLogs([])
    setTerminalBlobUrl(null)
    setTerminalFilename("")
    setIsTerminalBusy(true)
    setIsTerminalOpen(true)
  }

  const closeTerminal = () => {
    setIsTerminalOpen(false)
    if (terminalBlobUrl) {
      try {
        URL.revokeObjectURL(terminalBlobUrl)
      } catch {}
    }
  }

  const prepareDownload = (exportData: ExportData, filename: string) => {
    if (terminalBlobUrl) {
      try {
        URL.revokeObjectURL(terminalBlobUrl)
      } catch {}
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    setTerminalBlobUrl(url)
    setTerminalFilename(filename)
    return url
  }

  const exportBotFlow = async () => {
    if (!selectedBotId) {
      toast({ title: "Please select a bot first" })
      return
    }

    openTerminal()
    try {
      logAppend("Starting export...")
      logAppend("Fetching bot details...")
      const botRes = await apiGet(`/bots/${selectedBotId}`)
      if (!botRes.ok) throw new Error("Failed to get bot details")
      const bot = botRes.data
      logAppend("Bot details fetched.")

      logAppend("Fetching commands (paginated)...")
      let allCommands: Command[] = []
      let page = 1
      let commandsArr: Command[]
      do {
        logAppend(`Fetching command page ${page}...`)
        const commandsRes = await apiGet(
          `/bots/${selectedBotId}/commands?page=${page}`
        )
        if (!commandsRes.ok) throw new Error("Failed to get commands")
        commandsArr = Array.isArray(commandsRes.data) ? commandsRes.data : []
        for (const cmd of commandsArr) {
          logAppend(` > Fetched cmd: ${cmd.command || "(unnamed)"}`)
        }
        allCommands = allCommands.concat(commandsArr)
        page++
        await new Promise((res) => setTimeout(res, 200))
      } while (commandsArr.length > 0)
      logAppend(`Total commands retrieved: ${allCommands.length}`)

      logAppend("Fetching folders...")
      const foldersRes = await apiGet(`/bots/${selectedBotId}/commands_folders`)
      if (!foldersRes.ok) throw new Error("Failed to get folders")
      const foldersArr = Array.isArray(foldersRes.data) ? foldersRes.data : []
      logAppend(`...Folders fetched: ${foldersArr.length}`)
      for (const f of foldersArr) {
        logAppend(` > Fetched folder: ${f.title || "(unnamed)"}`)
      }

      logAppend("Fetching libs...")
      const libsRes = await apiGet(`/bots/${selectedBotId}/libs`)
      if (!libsRes.ok) throw new Error("Failed to get libs")
      const libsArr = Array.isArray(libsRes.data) ? libsRes.data : []
      logAppend(`...Libs fetched: ${libsArr.length}`)
      for (const l of libsArr) {
        logAppend(` > Fetched lib: ${l.name || "(unnamed)"}`)
      }

      const commands = allCommands.map((c) => ({
        command: c.command,
        help: c.help,
        answer: c.answer,
        keyboard_body: c.keyboard_body,
        need_reply: c.need_reply,
        commands_folder: c.commands_folder ? c.commands_folder.title : null,
        aliases: Array.isArray(c.aliases)
          ? c.aliases.map((a) => a.command).join(", ")
          : "",
        code: c.code,
      }))
      const folders = foldersArr.map((f) => f.title || "")
      const libs = libsArr.map((l) => l.name || String(l.id))

      const exportData: ExportData = {
        bot: { name: bot.name, token: includeToken ? bot.token : null },
        commands,
        folders,
        libs,
      }

      const safeName = (bot.name || `bot-${selectedBotId}`).replace(
        /[^\w\-\.\s]/g,
        "_"
      )
      const filename = includeToken
        ? `${safeName}+token.json`
        : `${safeName}.json`

      const url = prepareDownload(exportData, filename)
      logAppend("...........................")
      logAppend("Export complete. File is ready.")
      toast({ title: "Export completed" })

      if (autoDownload) {
        logAppend("Auto-downloading...")
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        logAppend("Download started.")
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      logAppend("Error: " + msg)
      toast({ variant: "destructive", title: "Export failed", description: msg })
    } finally {
      setIsTerminalBusy(false)
    }
  }

  const validateExportJson = (obj: any): obj is ExportData => {
    return obj && typeof obj === "object" && obj.bot && Array.isArray(obj.commands)
  }

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".json")) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please select a .json file",
      })
      return
    }

    let text: string
    try {
      text = await file.text()
    } catch (e) {
      toast({ variant: "destructive", title: "Cannot read file" })
      return
    }

    let obj: any
    try {
      obj = JSON.parse(text)
    } catch (e) {
      toast({ variant: "destructive", title: "Invalid JSON" })
      return
    }

    if (!validateExportJson(obj)) {
      toast({
        variant: "destructive",
        title: "Invalid Schema",
        description: "JSON does not match expected bot schema",
      })
      return
    }

    setLoadedJsonFile(obj)
    setUploadBotName(obj.bot?.name || "New Bot")
    setUploadBotToken(obj.bot?.token || "")
    setUploadAutoStart(false)
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
    e.target.value = ""
  }

  const handleDrag = (e: DragEvent<HTMLDivElement>, type: "over" | "leave") => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(type === "over")
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const cancelUpload = () => {
    setLoadedJsonFile(null)
    setUploadBotName("")
    setUploadBotToken("")
    setUploadAutoStart(false)
  }

  const ensureLibsMap = async () => {
    if (storeLibMap) return storeLibMap
    const newMap: Record<string, string> = {}
    logAppend("Fetching library map from store...")
    const r = await apiGet(`/store/libs`)
    if (r.ok && Array.isArray(r.data)) {
      for (const l of r.data) {
        newMap[l.name.toLowerCase().trim()] = l.id
      }
    }
    logAppend(`Library map ready. Found ${Object.keys(newMap).length} libs.`)
    setStoreLibMap(newMap)
    return newMap
  }

  const uploadBotFlow = async () => {
    if (!apiKey || !loadedJsonFile) {
      toast({ title: "Load a bot JSON first" })
      return
    }
    openTerminal()
    try {
      const name = uploadBotName.trim() || "New Bot"
      const token = uploadBotToken.trim() || ""
      logAppend(`Sending request to create bot: ${name}`)
      const create = await apiPost(`/bots`, { name, token })
      if (!create.ok || !create.data?.id) {
        throw new Error(
          "Create bot failed: " +
            (create.data?.error || create.error || "Unknown")
        )
      }
      const botId = create.data.id
      logAppend(`Bot created successfully (ID: ${botId})`)

      const libsArr = Array.isArray(loadedJsonFile.libs)
        ? loadedJsonFile.libs
        : []
      if (libsArr.length) {
        logAppend(`Found ${libsArr.length} libs to install...`)
        const map = await ensureLibsMap()
        for (const libNameRaw of libsArr) {
          const libName = String(libNameRaw || "").trim()
          if (!libName) {
            logAppend("Skipping empty lib name entry")
            continue
          }
          const libId = map[libName.toLowerCase()]
          if (!libId) {
            logAppend(`Warning: Lib not found in store: "${libName}" — skipping.`)
            continue
          }
          logAppend(`Installing lib: ${libName} (id:${libId})`)
          logAppend(`> POST /bots/${botId}/libs ...`)
          const r = await apiPost(`/bots/${botId}/libs`, { lib_id: libId })
          if (r.ok) logAppend(`> Install OK: ${libName}`)
          else
            logAppend(
              `> Install FAILED: ${libName} — ${JSON.stringify(
                r.data || r.error
              )}`
            )
          await new Promise((res) => setTimeout(res, 300))
        }
      } else logAppend("No libs to install")

      const foldersArr = Array.isArray(loadedJsonFile.folders)
        ? loadedJsonFile.folders
        : []
      const folderMap: Record<string, string> = {}
      if (foldersArr.length) {
        logAppend(`Creating ${foldersArr.length} folders...`)
        for (const f of foldersArr) {
          const title = String(f || "(untitled)")
          logAppend(`Creating folder: ${title}`)
          const r = await apiPost(`/bots/${botId}/commands_folders`, { title })
          if (r.ok && r.data?.id) {
            folderMap[title] = r.data.id
            logAppend(`> Folder created: ${title} (id:${r.data.id})`)
          } else
            logAppend(
              `> FAILED create folder ${title}: ${JSON.stringify(
                r.data || r.error
              )}`
            )
          await new Promise((res) => setTimeout(res, 200))
        }
      } else logAppend("No folders to create")

      logAppend(`Creating ${loadedJsonFile.commands.length} commands...`)
      let cmdCount = 0
      for (const cmd of loadedJsonFile.commands) {
        cmdCount++
        const folderId = cmd.commands_folder ? folderMap[cmd.commands_folder] : null
        const payload = {
          command: cmd.command || "",
          aliases: cmd.aliases || "",
          answer: cmd.answer || "",
          group: "",
          help: cmd.help || null,
          keyboard_body: cmd.keyboard_body || "",
          commands_folder_id: folderId,
          auto_retry_time: "",
          need_reply: !!cmd.need_reply,
          bjs_code: cmd.code || cmd.bjs_code || "",
        }
        logAppend(
          `Creating command ${cmdCount}/${loadedJsonFile.commands.length}: ${payload.command}`
        )
        const r = await apiPost(`/bots/${botId}/commands`, payload)
        if (!r.ok)
          logAppend(
            `> FAILED create command ${payload.command}: ${JSON.stringify(
              r.data || r.error
            )}`
          )
        await new Promise((res) => setTimeout(res, 200))
      }
      logAppend("All commands processed.")

      if (uploadAutoStart) {
        logAppend("Auto-start enabled. Sending launch command...")
        await apiPost(`/bots/${botId}/status`, { status: "start_launch" })
        await new Promise((res) => setTimeout(res, 500))
        logAppend("Sending second launch command (for confirmation)...")
        await apiPost(`/bots/${botId}/status`, { status: "start_launch" })
        logAppend("Bot launch initiated.")
      }
      logAppend("...........................")
      logAppend("Upload completed successfully!")
      toast({ title: "Upload completed" })
      loadBots()
      cancelUpload()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      logAppend("Fatal Error during upload: " + msg)
      toast({ variant: "destructive", title: "Upload failed", description: msg })
    } finally {
      setIsTerminalBusy(false)
    }
  }

  const selectedBot = bots.find((b) => b.id === selectedBotId)

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <h1 className="text-3xl font-bold mb-2">Magic Tool</h1>
          <p className="text-muted-foreground mb-6 max-w-3xl">
            Download your existing bots as a JSON backup or upload a JSON file to
            create a new bot. All processing is done in your browser.
          </p>

          <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value || 'download')} className="w-full">
            <AnimatedTabSwitcher
              value={currentTab}
              onValueChange={setCurrentTab}
              tabs={tabConfigs}
            />

            <TabsContent value="download" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Select a Bot to Download</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {filteredBots.length} / {bots.length} bots
                    </span>
                  </CardTitle>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search bots... (Ctrl+K)"
                      className="pl-9 pr-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingBots ? (
                    <div className="flex justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : filteredBots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-10 px-6">
                      {emptyAnimationData ? (
                        <div className="w-64 h-64 mx-auto -mt-10 -mb-4">
                          <Lottie
                            animationData={emptyAnimationData}
                            loop
                            autoplay
                            className="w-full h-full"
                          />
                        </div>
                      ) : null}
                      <h2 className="text-xl font-semibold mt-2 mb-1">
                        No Bots Found
                      </h2>
                      <p className="text-muted-foreground max-w-xs">
                        {searchQuery
                          ? "No bots match your search."
                          : "You haven't created any bots yet."}
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto pr-2">
                      <StyledBotSelector
                        bots={filteredBots}
                        value={selectedBotId}
                        onValueChange={setSelectedBotId}
                        name="bot-selector"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedBot && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Download Options for {selectedBot.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                      <div>
                        <Label
                          htmlFor="include-token"
                          className="font-medium"
                        >
                          Include Bot Token
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Include the bot's API token in the JSON file.
                        </p>
                      </div>
                      <CustomSwitch
                        id="include-token"
                        checked={includeToken}
                        onCheckedChange={setIncludeToken}
                        className="data-[state=checked]:bg-primary w-8 h-8 after:h-6 after:w-6"
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <div>
                        <Label
                          htmlFor="auto-download"
                          className="font-medium"
                        >
                          Auto Download
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Start the download immediately when finished.
                        </p>
                      </div>
                      <CustomSwitch
                        id="auto-download"
                        checked={autoDownload}
                        onCheckedChange={setAutoDownload}
                        className="data-[state=checked]:bg-primary w-8 h-8 after:h-6 after:w-6"
                      />
                    </div>
                    <Button onClick={exportBotFlow} className="w-full hover:transform-none">
                      <FileDown className="w-4 h-4 mr-2" />
                      Start Download
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="upload" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Bot from JSON</CardTitle>
                </CardHeader>
                <CardContent>
                  {!loadedJsonFile ? (
                    <div>
                      <input
                        type="file"
                        id="fileInput"
                        accept="application/json"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <div
                        onDragOver={(e) => handleDrag(e, "over")}
                        onDragLeave={(e) => handleDrag(e, "leave")}
                        onDrop={handleDrop}
                        className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                          isDragging
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() =>
                          document.getElementById("fileInput")?.click()
                        }
                      >
                        <FileJson className="w-12 h-12 text-primary" />
                        <p className="mt-4 font-medium">
                          Drop JSON file here or{" "}
                          <span className="text-primary underline">browse</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Must be a valid bot export JSON.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <FileCheck2 className="w-5 h-5 text-green-500" />
                          File Loaded: {loadedJsonFile.bot.name || "Untitled Bot"}
                        </h3>
                        <div className="text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 mt-2 max-w-md">
                          <span>Commands:</span>
                          <span>{loadedJsonFile.commands.length}</span>
                          <span>Folders:</span>
                          <span>
                            {Array.isArray(loadedJsonFile.folders)
                              ? loadedJsonFile.folders.length
                              : 0}
                          </span>
                          <span>Libraries:</span>
                          <span>
                            {Array.isArray(loadedJsonFile.libs)
                              ? loadedJsonFile.libs.length
                              : 0}
                          </span>
                          <span>Token included:</span>
                          <span>{loadedJsonFile.bot.token ? "Yes" : "No"}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="botNameUpload">Bot Name</Label>
                          <Input
                            id="botNameUpload"
                            value={uploadBotName}
                            onChange={(e) => setUploadBotName(e.target.value)}
                            placeholder="New Bot Name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="botTokenUpload">Bot Token</Label>
                          <Input
                            id="botTokenUpload"
                            value={uploadBotToken}
                            onChange={(e) => setUploadBotToken(e.target.value)}
                            placeholder="Paste new bot token (optional)"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <CustomSwitch
                            id="autoStartUpload"
                            checked={uploadAutoStart}
                            onCheckedChange={setUploadAutoStart}
                            className="data-[state=checked]:bg-primary w-8 h-8 after:h-6 after:w-6"
                          />
                          <Label htmlFor="autoStartUpload">
                            Auto-start bot after creation
                          </Label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={uploadBotFlow}
                          className="w-full"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Start Upload
                        </Button>
                        <Button
                          onClick={cancelUpload}
                          variant="outline"
                          className="w-full"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <MagicToolTerminal
        isOpen={isTerminalOpen}
        onClose={closeTerminal}
        logs={terminalLogs}
        blobUrl={terminalBlobUrl}
        filename={terminalFilename}
        isBusy={isTerminalBusy}
      />
    </div>
  )
}