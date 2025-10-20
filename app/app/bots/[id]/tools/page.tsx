"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import {
    Terminal, Wrench, MessageSquare, Settings, Package, Folder, Megaphone, AlertTriangle,
    Loader2, Trash2, Copy, Check, ExternalLink, GitBranch, UploadCloud, DownloadCloud, CopyIcon, LinkIcon, LayoutDashboard
} from "lucide-react"

const TABS = [
    { id: "commands", label: "Commands", icon: Terminal },
    { id: "tools", label: "Tools", icon: Wrench },
    { id: "chats", label: "Chats", icon: MessageSquare },
    { id: "properties", label: "Properties", icon: Settings },
    { id: "libraries", label: "Libraries", icon: Package },
    { id: "folders", label: "Folders", icon: Folder },
    { id: "admin-panel", label: "Admin Panel", icon: LayoutDashboard },
    { id: "broadcast", label: "Broadcast", icon: Megaphone },
    { id: "errors", label: "Errors", icon: AlertTriangle },
]

type BotDetails = {
    id: number;
    name: string;
    token: string | null;
    csv_url: string | null;
    git_remote: string | null;
    rsa_public_key: string | null;
    status?: string;
    created_at?: string;
    updated_at?: string;
}

const BASE_URL = "https://appapi.bots.business/v2"

async function fetchBotDetails(botId: string, apiKey: string): Promise<BotDetails | null> {
    try {
        const url = `${BASE_URL}/bots/${botId}?api_key=${apiKey}`
        const res = await fetch(url)
        if (!res.ok) {
            throw new Error(`Failed to fetch bot details: ${res.statusText}`)
        }
        return (await res.json()) as BotDetails
    } catch (e) {
        console.error("[fetchBotDetails] Error:", e)
        return null
    }
}

async function updateBotDetails(
    botId: string,
    apiKey: string,
    data: Partial<Pick<BotDetails, 'name' | 'token' | 'csv_url' | 'git_remote'>>
): Promise<{ success: boolean; data?: BotDetails; error?: string }> {
    try {
        const url = `${BASE_URL}/bots/${botId}?api_key=${apiKey}`
        const res = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        const responseData = await res.json()
        if (!res.ok) {
            throw new Error(responseData.error || "Failed to update bot details")
        }
        return { success: true, data: responseData as BotDetails }
    } catch (e) {
        console.error("[updateBotDetails] Error:", e)
        return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
}

async function cloneBot(botId: string, apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
        const url = `${BASE_URL}/bots/${botId}/cloning?api_key=${apiKey}`
        const res = await fetch(url, { method: "POST" })
        const responseText = await res.text()

        if (!res.ok || responseText !== 'ok') {
            let errorMsg = "Cloning failed";
            try {
                const data = JSON.parse(responseText);
                errorMsg = data.error || errorMsg;
            } catch {}
            throw new Error(errorMsg)
        }
        return { success: true }
    } catch (e) {
        console.error("[cloneBot] Error:", e)
        return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
}

export default function ToolsPage() {
    const params = useParams()
    const router = useRouter()
    const botId = params.id as string
    // Removed useToast
    // const { toast } = useToast()
    const [toast, setToast] = useState<string | null>(null); // Added local toast state

    const [isLoading, setIsLoading] = useState(true)
    const [botDetails, setBotDetails] = useState<BotDetails | null>(null)

    const [csvUrl, setCsvUrl] = useState("")
    const [gitRemoteUrl, setGitRemoteUrl] = useState("")

    const [isImportingCsv, setIsImportingCsv] = useState(false)
    const [isCloning, setIsCloning] = useState(false)
    const [isExportingGit, setIsExportingGit] = useState(false)
    const [isImportingGit, setIsImportingGit] = useState(false)

    const [showGitImportConfirm, setShowGitImportConfirm] = useState(false)
    const [copiedKey, setCopiedKey] = useState(false)

    const apiKey =
        typeof window !== "undefined" ? localStorage.getItem("mybb_api_key") : null

    // Function to show toast message
    const showToast = (message: string, duration = 2000) => {
        setToast(message);
        setTimeout(() => setToast(null), duration);
    };

    const loadBotDetails = useCallback(async () => {
        if (!apiKey) {
            setIsLoading(false)
            showToast("API Key Error: Not found.", 3000)
            return
        }
        setIsLoading(true)
        const details = await fetchBotDetails(botId, apiKey)
        if (details) {
            setBotDetails(details)
            setCsvUrl(details.csv_url || "")
            setGitRemoteUrl(details.git_remote || "")
        } else {
            showToast("Error: Failed to load bot details.", 3000)
        }
        setIsLoading(false)
    }, [botId, apiKey]) // Removed toast from dependencies

    useEffect(() => {
        loadBotDetails()
    }, [loadBotDetails])

    const handleImportCsv = async () => {
        if (!apiKey || !botDetails) return;
        setIsImportingCsv(true);
        const result = await updateBotDetails(botId, apiKey, {
            name: botDetails.name,
            token: botDetails.token,
            csv_url: csvUrl.trim() || null,
            git_remote: botDetails.git_remote,
        });
        if (result.success && result.data) {
            setBotDetails(result.data);
            setCsvUrl(result.data.csv_url || "");
            showToast("Success: Commands imported from CSV URL.");
        } else {
            showToast(`CSV Import Failed: ${result.error || "Could not import from CSV."}`, 3000);
        }
        setIsImportingCsv(false);
    };

    const handleCloneBot = async () => {
        if (!apiKey) return;
        setIsCloning(true);
        const result = await cloneBot(botId, apiKey);
        if (result.success) {
            showToast("Success: Bot cloning initiated.", 3000);
        } else {
            showToast(`Cloning Failed: ${result.error || "Could not start cloning."}`, 3000);
        }
        setIsCloning(false);
    };

    const handleCopyKey = async () => {
        if (!botDetails?.rsa_public_key) return;
        try {
            await navigator.clipboard.writeText(botDetails.rsa_public_key);
            setCopiedKey(true);
            showToast("Copied! Deploy key copied.", 1500);
            setTimeout(() => setCopiedKey(false), 1500);
        } catch (err) {
            showToast("Copy Failed: Could not copy deploy key.", 3000);
        }
    };

    const handleExportGit = async () => {
        if (!apiKey || !botDetails) return;
        setIsExportingGit(true);
        const result = await updateBotDetails(botId, apiKey, {
            name: botDetails.name,
            token: botDetails.token,
            csv_url: null,
            git_remote: gitRemoteUrl.trim() || null,
        });
        if (result.success && result.data) {
            setBotDetails(result.data);
            setGitRemoteUrl(result.data.git_remote || "");
            setCsvUrl("");
            showToast("Success: Bot exported to Git repository.");
        } else {
            showToast(`Git Export Failed: ${result.error || "Could not export to Git."}`, 3000);
        }
        setIsExportingGit(false);
    };

    const handleImportGitRequest = () => {
        setShowGitImportConfirm(true);
    };

    const handleConfirmGitImport = async () => {
        if (!apiKey || !botDetails) return;
        setIsImportingGit(true);
        const result = await updateBotDetails(botId, apiKey, {
            name: botDetails.name,
            token: botDetails.token,
            csv_url: null,
            git_remote: gitRemoteUrl.trim() || null,
        });
        if (result.success && result.data) {
            setBotDetails(result.data);
            setGitRemoteUrl(result.data.git_remote || "");
            setCsvUrl("");
            showToast("Success: Bot imported from Git. Commands may take a moment.", 3000);
        } else {
            showToast(`Git Import Failed: ${result.error || "Could not import from Git."}`, 3000);
        }
        setIsImportingGit(false);
        setShowGitImportConfirm(false);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-full">
                 <div className="sticky top-0 z-20 border-b bg-card/60 backdrop-blur-xl">
                    <div className="flex gap-1 p-2 overflow-x-auto">
                        {TABS.map((tab) => <Button key={tab.id} variant="outline" size="sm" disabled className="gap-2"><tab.icon className="w-4 h-4" />{tab.label}</Button>)}
                    </div>
                 </div>
                 <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                 </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full relative"> {/* Added relative positioning */}
            <div className="sticky top-0 z-20 border-b bg-card/60 backdrop-blur-xl">
                 <div className="flex gap-1 p-2 overflow-x-auto">
                    {TABS.map((tab) => {
                        const Icon = tab.icon
                        return (
                        <Button
                            key={tab.id}
                            onClick={() => {
                            router.push(`/app/bots/${botId}/${tab.id}`)
                            }}
                            variant={tab.id === "tools" ? "default" : "outline"}
                            size="sm"
                            className="gap-2 cursor-pointer whitespace-nowrap"
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </Button>
                        )
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <h2 className="text-3xl font-bold">Bot Tools</h2>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UploadCloud className="w-5 h-5"/>Import Commands from CSV</CardTitle>
                        <CardDescription>
                            Import commands directly from a published Google Sheet CSV URL.
                            <Link href="https://help.bots.business/create-bot-from-google-table" target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline inline-flex items-center gap-1 text-xs">
                                Learn More <ExternalLink className="w-3 h-3"/>
                            </Link>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                         <Input
                            value={csvUrl}
                            onChange={(e) => setCsvUrl(e.target.value)}
                            placeholder="Enter Google Sheet CSV URL (e.g., .../pub?output=csv)"
                            disabled={isImportingCsv}
                        />
                        <Button onClick={handleImportCsv} disabled={isImportingCsv || !csvUrl.trim()}>
                            {isImportingCsv ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <UploadCloud className="w-4 h-4 mr-2"/>}
                            {isImportingCsv ? "Importing..." : "Import Commands"}
                        </Button>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CopyIcon className="w-5 h-5"/>Clone Bot</CardTitle>
                        <CardDescription>Create an exact copy of this bot, including commands, settings, and libraries.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleCloneBot} disabled={isCloning}>
                             {isCloning ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <CopyIcon className="w-4 h-4 mr-2"/>}
                            {isCloning ? "Cloning..." : "Make a Copy"}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><GitBranch className="w-5 h-5"/>Git Integration</CardTitle>
                        <CardDescription>
                            Synchronize your bot's commands and libraries with a Git repository.
                             <Link href="https://help.bots.business/git" target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline inline-flex items-center gap-1 text-xs">
                                Learn More <ExternalLink className="w-3 h-3"/>
                            </Link>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium block mb-1">Deploy Key (Read-Only)</label>
                            <div className="relative">
                                <Textarea
                                    readOnly
                                    value={botDetails?.rsa_public_key || "Loading key..."}
                                    rows={3}
                                    className="pr-10 bg-muted/50 font-mono text-xs"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-7 w-7"
                                    onClick={handleCopyKey}
                                    aria-label="Copy Deploy Key"
                                >
                                    {copiedKey ? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Add this public key as a deploy key in your Git repository settings.</p>
                        </div>
                        <div>
                             <label htmlFor="git-url" className="text-sm font-medium block mb-1">Git Repository URL (SSH)</label>
                            <Input
                                id="git-url"
                                value={gitRemoteUrl}
                                onChange={(e) => setGitRemoteUrl(e.target.value)}
                                placeholder="git@github.com:user/repo.git"
                                disabled={isExportingGit || isImportingGit}
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                             <Button onClick={handleExportGit} disabled={isExportingGit || isImportingGit || !gitRemoteUrl.trim()}>
                                {isExportingGit ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <UploadCloud className="w-4 h-4 mr-2"/>}
                                {isExportingGit ? "Exporting..." : "Export to Git"}
                            </Button>
                             <Button variant="outline" onClick={handleImportGitRequest} disabled={isExportingGit || isImportingGit || !gitRemoteUrl.trim()}>
                                 <DownloadCloud className="w-4 h-4 mr-2"/>
                                Import from Git
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {showGitImportConfirm && (
                <DeleteConfirmModal
                    title="Import from Git?"
                    description={
                        <>
                            Importing from Git will <span className="font-semibold text-destructive">overwrite all existing commands and libraries</span> in this bot with the content from the repository: <br/>
                            <code className="text-xs bg-muted p-1 rounded font-semibold">{gitRemoteUrl || "N/A"}</code><br/>
                            Are you sure you want to proceed? This cannot be undone.
                        </>
                    }
                    confirmText="Import & Overwrite"
                    onConfirm={handleConfirmGitImport}
                    onCancel={() => setShowGitImportConfirm(false)}
                    isLoading={isImportingGit}
                />
            )}

             {/* Toast Display */}
            {toast && (
                <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-[60] bg-foreground text-background text-sm px-4 py-2 rounded-full shadow animate-in fade-in slide-in-from-bottom duration-300">
                {toast}
                </div>
            )}
        </div>
    )
}