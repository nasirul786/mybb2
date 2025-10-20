"use client"

import { useEffect, useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'

import type { Property } from "@/app/app/bots/[id]/properties/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Trash2 } from "lucide-react"

type Props = {
  isOpen: boolean
  onClose: () => void
  property: Property | null
  onDelete: (prop: Property) => void
}

export function PropertyDetailsModal({
  isOpen,
  onClose,
  property,
  onDelete,
}: Props) {
  const [formattedValue, setFormattedValue] = useState("")
  const [codeStyle, setCodeStyle] = useState<any>(vs)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setCodeStyle(isDark ? vscDarkPlus : vs)

    if (property) {
      if (property.type === "json" || typeof property.value === "object") {
        try {
          setFormattedValue(JSON.stringify(property.value, null, 2))
        } catch {
          setFormattedValue(String(property.value))
        }
      } else {
        setFormattedValue(String(property.value))
      }
    } else {
      setFormattedValue("")
    }
  }, [property])

  if (!isOpen || !property) return null

  const isJson = property.type === "json" || typeof property.value === "object"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between py-1 px-2 border-b h-12">
          <CardTitle className="text-lg font-semibold truncate">{property.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="p-1 h-auto w-auto flex-shrink-0">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-4 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">ID:</span> {property.id}
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Type:</span> {property.type}
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Size (bytes):</span> {property.size}
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Updated At:</span>{" "}
              {new Date(property.updated_at).toLocaleString()}
            </div>
            {property.user && (
              <div className="col-span-2">
                <span className="font-medium text-muted-foreground">User:</span>{" "}
                {property.user.first_name || ""}{" "}
                {property.user.last_name || ""}
                {property.user.username ? ` (@${property.user.username})` : ""}
                {property.user.telegramid ? ` [${property.user.telegramid}]` : ""}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-base font-semibold mb-2">Value</h4>
            {/* FIX: Removed 'background: transparent' from customStyle */}
            <div className="text-sm max-h-64 overflow-auto border rounded-md bg-muted/50">
              <SyntaxHighlighter
                language={isJson ? "json" : "text"}
                style={codeStyle}
                customStyle={{ margin: 0, padding: '0.75rem' }} // Only margin and padding needed
                wrapLines={true}
                wrapLongLines={true}
                // Use PreTag to prevent invalid nesting if library renders a <pre>
                PreTag="div"
              >
                {formattedValue}
              </SyntaxHighlighter>
            </div>
          </div>
        </CardContent>

        <div className="p-3 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="destructive" onClick={() => onDelete(property)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Property
          </Button>
        </div>
      </Card>
    </div>
  )
}