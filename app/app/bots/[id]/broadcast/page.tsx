"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { useToast } from "@/components/ui/use-toast"
import { BroadcastTaskItem } from "@/components/broadcast-task-item"
import {
    Terminal, Wrench, MessageSquare, Settings, Package, Folder, Megaphone, AlertTriangle,
    Loader2, Trash2, LayoutDashboard
} from "lucide-react"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

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

export type BroadcastTask = {
    id: number
    cur_position: number
    total: number | null
    progress: number | null
    scope_code: number
    status_code: number
    bot_id: number
    last_executed_at: string | null
    errors_count: number | null
    bjs_action: {
        name: string
        params?: {
            command?: string
            [key: string]: any
        }
    } | null
    created_at: string
    updated_at: string
    scope: string
    status: string
}

const BASE_URL = "https://appapi.bots.business/v2"

async function fetchBroadcastTasks(botId: string, apiKey: string): Promise<BroadcastTask[]> {
    try {
        const url = `${BASE_URL}/bots/${botId}/broadcaster_tasks?api_key=${apiKey}`
        const res = await fetch(url)
        if (!res.ok) {
            throw new Error(`Failed to fetch broadcast tasks: ${res.statusText}`)
        }
        return (await res.json()) as BroadcastTask[]
    } catch (e) {
        console.error("[fetchBroadcastTasks] Error:", e)
        return []
    }
}

async function pauseTask(botId: string, taskId: number, apiKey: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const url = `${BASE_URL}/bots/${botId}/broadcaster_tasks/${taskId}/pause?api_key=${apiKey}`
        const res = await fetch(url, { method: "POST" })
        const data = await res.json()
        if (!res.ok) {
             // Handle potential array of errors
            const errorMessage = Array.isArray(data.errors) ? data.errors.join(', ') : (data.error || "Failed to pause task");
            throw new Error(errorMessage)
        }
        return { success: true, message: data.message }
    } catch (e) {
        console.error("[pauseTask] Error:", e)
        return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
}

async function resumeTask(botId: string, taskId: number, apiKey: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const url = `${BASE_URL}/bots/${botId}/broadcaster_tasks/${taskId}/resume?api_key=${apiKey}`
        const res = await fetch(url, { method: "POST" })
        const data = await res.json()
        if (!res.ok) {
            const errorMessage = Array.isArray(data.errors) ? data.errors.join(', ') : (data.error || "Failed to resume task");
            throw new Error(errorMessage)
        }
        return { success: true, message: data.message }
    } catch (e) {
        console.error("[resumeTask] Error:", e)
        return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
}

async function deleteTask(botId: string, taskId: number, apiKey: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const url = `${BASE_URL}/bots/${botId}/broadcaster_tasks/${taskId}?api_key=${apiKey}`
        const res = await fetch(url, { method: "DELETE" })
        if (res.status === 204) {
             return { success: true, message: "Task deleted successfully" };
        }
        const data = await res.json()
        if (!res.ok) {
            const errorMessage = Array.isArray(data.errors) ? data.errors.join(', ') : (data.error || "Failed to delete task");
            throw new Error(errorMessage)
        }
        return { success: true, message: data.message }
    } catch (e) {
        console.error("[deleteTask] Error:", e)
        return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
}

export default function BroadcastPage() {
    const params = useParams()
    const router = useRouter()
    const botId = params.id as string
    const { toast } = useToast()

    const [tasks, setTasks] = useState<BroadcastTask[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [deleteConfirm, setDeleteConfirm] = useState<BroadcastTask | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [emptyAnimationData, setEmptyAnimationData] = useState<any>(null)

    const apiKey =
        typeof window !== "undefined" ? localStorage.getItem("mybb_api_key") : null

    useEffect(() => {
        if (!apiKey) {
            setIsLoading(false)
            return
        }
        loadTasks()
    }, [botId, apiKey])

    useEffect(() => {
        fetch("/lottie/empty-bots.json")
            .then((r) => r.json())
            .then(setEmptyAnimationData)
            .catch(() => { })
    }, [])

    const loadTasks = async () => {
        if (!apiKey) return
        if (!isLoading) setIsLoading(true)
        const fetchedTasks = await fetchBroadcastTasks(botId, apiKey)
        setTasks(fetchedTasks)
        setIsLoading(false)
    }

    const handleToggleStatus = async (taskId: number, currentStatus: string): Promise<boolean> => {
        if (!apiKey) return false

        const statusLower = currentStatus?.toLowerCase();
        const isPausable = ['running', 'active', 'new', 'in progress'].includes(statusLower);
        const action = isPausable ? pauseTask : resumeTask;
        const actionName = isPausable ? 'pause' : 'resume';
        const actionGerund = isPausable ? 'Pausing' : 'Resuming';

        const result = await action(botId, taskId, apiKey);

        if (result.success) {
            toast({ title: "Success", description: result.message || `Task ${actionName}d.` });
            await loadTasks();
            return true;
        } else {
            toast({ variant: "destructive", title: `${actionGerund} Failed`, description: result.error || `Could not ${actionName} task.` });
            console.error(`Failed to ${actionName} task:`, result.error);
            await loadTasks(); // Refresh even on failure
            return false;
        }
    };

    const handleDeleteRequest = (task: BroadcastTask) => {
        setDeleteConfirm(task)
    }

    const handleConfirmDelete = async () => {
        if (!apiKey || !deleteConfirm) return
        setIsDeleting(true)

        const result = await deleteTask(botId, deleteConfirm.id, apiKey)

        if (result.success) {
            setTasks((prev) => prev.filter((t) => t.id !== deleteConfirm.id))
            toast({ title: "Success", description: result.message || "Broadcast task deleted." })
            setDeleteConfirm(null)
        } else {
            toast({ variant: "destructive", title: "Delete Failed", description: result.error || "Could not delete task." })
            console.error("Delete failed:", result.error)
        }
        setIsDeleting(false)
    }

    return (
        <div className="flex flex-col h-full">
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
                            variant={tab.id === "broadcast" ? "default" : "outline"}
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

            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <h2 className="text-3xl font-bold">Broadcast Tasks</h2>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : tasks.length === 0 ? (
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
                            <Megaphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        )}
                        <h2 className="text-xl font-semibold mt-2 mb-1">No Broadcast Tasks</h2>
                        <p className="text-muted-foreground max-w-xs">
                            You haven't created any broadcast tasks yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tasks.map((task) => (
                           <BroadcastTaskItem
                                key={task.id}
                                task={task}
                                onToggleStatus={handleToggleStatus}
                                onDelete={handleDeleteRequest}
                           />
                        ))}
                    </div>
                )}
            </div>

            {deleteConfirm && (
                <DeleteConfirmModal
                    title="Delete Broadcast Task?"
                    description={
                        <>
                            Are you sure you want to delete this broadcast task (ID: {deleteConfirm.id})?
                            If it's running, it might stop abruptly. This action cannot be undone.
                        </>
                    }
                    confirmText="Delete Task"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setDeleteConfirm(null)}
                    isLoading={isDeleting}
                />
            )}
        </div>
    )
}