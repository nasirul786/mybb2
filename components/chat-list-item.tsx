"use client"

import type { Chat } from "@/app/app/bots/[id]/chats/page"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, AtSign, Calendar, Ban, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type Props = {
  chat: Chat
  onUpdateStatus: (chatId: number) => void
}

export function ChatListItem({ chat, onUpdateStatus }: Props) {

  const isBlocked = chat.prohibited_by_admin === true

  const handleUpdate = () => {
      onUpdateStatus(chat.id)
  }

  const user = chat.user
  if (!user) return null;

  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim()
  const joinedDate = user.created_at
    ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true })
    : "N/A"

  return (
    <Card className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="font-semibold truncate text-foreground">{fullName || "N/A"}</span>
          {isBlocked && (
            <Badge variant="destructive" className="ml-auto sm:ml-2 flex-shrink-0">Blocked</Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          {user.username && (
            <div className="flex items-center gap-2 truncate">
              <AtSign className="w-3.5 h-3.5 flex-shrink-0" />
              <span>@{user.username}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">ID: {user.telegramid}</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Joined {joinedDate}</span>
          </div>
        </div>
      </div>
      <Button
        size="sm"
        variant={isBlocked ? "outline" : "destructive"}
        onClick={handleUpdate}
        className="gap-2 w-full sm:w-auto flex-shrink-0"
      >
        {isBlocked ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <Ban className="w-4 h-4" />
        )}
        {isBlocked ? "Unblock" : "Block"}
      </Button>
    </Card>
  )
}