"use client"

import { useState } from "react"
import type { BroadcastTask } from "@/app/app/bots/[id]/broadcast/page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Trash2, Loader2, Calendar, Users, Terminal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type Props = {
    task: BroadcastTask
    onToggleStatus: (taskId: number, currentStatus: string) => Promise<boolean>
    onDelete: (task: BroadcastTask) => void
}

const getStatusProps = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
        case 'running':
        case 'active':
        case 'in progress':
            return { color: "bg-blue-500/20 text-blue-600 border-blue-500/30", text: "Running" };
        case 'paused':
            return { color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30", text: "Paused" };
        case 'completed':
            return { color: "bg-green-500/20 text-green-600 border-green-500/30", text: "Completed" };
        case 'new':
            return { color: "bg-gray-500/20 text-gray-600 border-gray-500/30", text: "New" };
        case 'error':
            return { color: "bg-red-500/20 text-red-600 border-red-500/30", text: "Error" };
        default:
            return { color: "bg-gray-500/20 text-gray-600 border-gray-500/30", text: status || "Unknown" };
    }
}

export function BroadcastTaskItem({ task, onToggleStatus, onDelete }: Props) {
    const [isToggling, setIsToggling] = useState(false)

    const statusProps = getStatusProps(task.status)
    const statusLower = task.status?.toLowerCase();

    const isPausable = statusLower === 'running' || statusLower === 'active' || statusLower === 'new' || statusLower === 'in progress';
    const isResumable = statusLower === 'paused';
    const canToggle = isPausable || isResumable;

    const command = task.bjs_action?.params?.command || "N/A"
    const createdAt = task.created_at
        ? formatDistanceToNow(new Date(task.created_at), { addSuffix: true })
        : "N/A"

    const handleToggle = async () => {
        setIsToggling(true)
        await onToggleStatus(task.id, task.status)
        setIsToggling(false) // Reset after API call finishes (success or fail handled by parent)
    }

    return (
        <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`${statusProps.color} border text-xs`}>
                            {statusProps.text}
                        </Badge>
                        <span className="text-xs text-muted-foreground">ID: {task.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Terminal className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                        <span className="font-semibold truncate">Command: {command}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4 flex-shrink-0"/>
                        <span>Scope: {task.scope || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0"/>
                        <span>Created {createdAt}</span>
                    </div>
                    {task.progress != null && (
                         <div className="pt-1">
                             <Progress value={task.progress} className="h-2" />
                             <p className="text-xs text-muted-foreground mt-1">{task.progress}% complete ({task.cur_position ?? 0} / {task.total ?? '?'})</p>
                         </div>
                    )}
                     {task.errors_count != null && task.errors_count > 0 && (
                         <p className="text-xs text-destructive pt-1">Errors: {task.errors_count}</p>
                     )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 sm:items-start">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleToggle}
                        disabled={!canToggle || isToggling}
                        className="gap-2 w-full sm:w-auto"
                    >
                        {isToggling ? (
                            <Loader2 className="w-4 h-4 animate-spin"/>
                        ) : isResumable ? (
                             <Play className="w-4 h-4"/>
                        ) : (
                            <Pause className="w-4 h-4"/>
                        )}
                        {isToggling ? (isResumable ? 'Resuming...' : 'Pausing...') : (isResumable ? 'Resume' : 'Pause')}
                    </Button>
                     <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(task)}
                        disabled={isToggling}
                        className="gap-2 w-full sm:w-auto"
                    >
                        <Trash2 className="w-4 h-4"/>
                        Delete
                    </Button>
                </div>
            </div>
        </Card>
    )
}