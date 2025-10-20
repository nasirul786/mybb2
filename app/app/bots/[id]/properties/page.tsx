"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { PropertyDetailsModal } from "@/components/property-details-modal"
import { useToast } from "@/components/ui/use-toast"
import {
  Terminal, Wrench, MessageSquare, Settings, Package, Folder, Megaphone, AlertTriangle,
  Loader2, Trash2, Eye, CircleX, X, LayoutDashboard
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

export type Property = {
  id: number
  user_id: number | null
  bot_id: number
  name: string
  created_at: string
  updated_at: string
  size: number
  bot_list_id: number | null
  user?: {
    first_name: string | null
    last_name: string | null
    username: string | null
    telegramid: number
  }
  value: any
  type: string
}

const BASE_URL = "https://appapi.bots.business/v2"

async function fetchProperties(
  botId: string,
  apiKey: string
): Promise<Property[]> {
  try {
    const url = `${BASE_URL}/bots/${botId}/properties?api_key=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Failed to fetch properties: ${res.statusText}`)
    }
    return (await res.json()) as Property[]
  } catch (e) {
    console.error("[fetchProperties] Error:", e)
    return []
  }
}

async function deleteProperty(
  botId: string,
  propertyId: number,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${BASE_URL}/bots/${botId}/properties/${propertyId}?api_key=${apiKey}`
    const res = await fetch(url, { method: "DELETE" })

    if (!res.ok) {
      let errorMsg = res.statusText
      try { const data = await res.json(); errorMsg = data.error || errorMsg } catch { }
      throw new Error(errorMsg)
    }
    await res.json();
    return { success: true }
  } catch (e) {
    console.error("[deleteProperty] Error:", e)
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export default function PropertiesPage() {
  const params = useParams()
  const router = useRouter()
  const botId = params.id as string
  const { toast } = useToast()

  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState<Property | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false)
  const [isClearingAll, setIsClearingAll] = useState(false)
  const [clearProgress, setClearProgress] = useState(0)
  const [totalToDelete, setTotalToDelete] = useState(0)
  const [deletedCount, setDeletedCount] = useState(0)
  const [clearErrorsCount, setClearErrorsCount] = useState(0);

  const apiKey =
    typeof window !== "undefined" ? localStorage.getItem("mybb_api_key") : null

  useEffect(() => {
    if (!apiKey) {
      setIsLoading(false)
      return
    }
    loadProperties()
  }, [botId, apiKey])

  const loadProperties = async () => {
    if (!apiKey) return
    setIsLoading(true)
    const fetchedProperties = await fetchProperties(botId, apiKey)
    fetchedProperties.sort((a, b) => a.name.localeCompare(b.name))
    setProperties(fetchedProperties)
    setIsLoading(false)
  }

  const handleViewProperty = (prop: Property) => {
    setSelectedProperty(prop)
    setIsModalOpen(true)
  }

  const handleDeleteRequest = (prop: Property) => {
    if (isModalOpen && selectedProperty?.id === prop.id) {
      setIsModalOpen(false)
    }
    setDeleteConfirm(prop)
  }

  const handleConfirmDelete = async () => {
    if (!apiKey || !deleteConfirm) return
    setIsDeleting(true)
    const result = await deleteProperty(botId, deleteConfirm.id, apiKey)
    if (result.success) {
      setProperties((prev) => prev.filter((p) => p.id !== deleteConfirm.id))
      toast({ title: "Success", description: `Property "${deleteConfirm.name}" deleted.` })
      setDeleteConfirm(null)
    } else {
      toast({ variant: "destructive", title: "Delete Failed", description: result.error })
      console.error("Delete failed:", result.error)
    }
    setIsDeleting(false)
  }

  const handleClearAllRequest = () => {
    setShowClearAllConfirm(true)
  }

 
  const handleConfirmClearAll = async () => {
    if (!apiKey) return;
    setShowClearAllConfirm(false);
    setIsClearingAll(true);
    setClearProgress(0);
    setDeletedCount(0);
    setClearErrorsCount(0); 

    
    const idsToDelete = properties.map(p => p.id);
    setTotalToDelete(idsToDelete.length);

    if (idsToDelete.length === 0) {
      setIsClearingAll(false);
      toast({ title: "Nothing to clear", description: "No properties found to delete." });
      return;
    }

    let count = 0;
    let errors = 0;
    for (const id of idsToDelete) {
      const result = await deleteProperty(botId, id, apiKey);
      if (!result.success) {
        errors++;
        console.error(`Failed to delete property ID ${id}: ${result.error}`);
      }
      count++;
      setDeletedCount(count); 
      setClearProgress(Math.round((count / idsToDelete.length) * 100));
      // Optional small delay
      // await new Promise(resolve => setTimeout(resolve, 50));
    }

    setClearErrorsCount(errors);
    setIsClearingAll(false); 

   
    if (errors === 0) {
      toast({ title: "Success", description: `All ${count} properties cleared.` });
    } else {
      toast({
          variant: "destructive",
          title: "Clear Partially Failed",
          description: `Deleted ${count - errors} of ${count} properties. ${errors} failed.`
      });
    }

    await loadProperties();
  };

  const formatValuePreview = (value: any, type: string) => {
    if (type === "json" || typeof value === "object") {
      try {
        const str = JSON.stringify(value);
        return str.length > 50 ? str.substring(0, 50) + "..." : str;
      } catch { return "[Object]" }
    }
    const str = String(value);
    return str.length > 50 ? str.substring(0, 50) + "..." : str;
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
                variant={tab.id === "properties" ? "default" : "outline"}
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-3xl font-bold">Properties</h2>
          <Button
            variant="destructive"
            onClick={handleClearAllRequest}
            disabled={isLoading || properties.length === 0 || isClearingAll}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : properties.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">
            No properties found for this bot.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((prop) => (
              <Card key={prop.id} className="flex flex-col">
                <div className="p-4 flex-1">
                  <h3 className="font-semibold truncate mb-1">{prop.name}</h3>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>Type: <span className="font-medium text-foreground/80">{prop.type}</span></p>
                    {prop.user && (
                      <p className="truncate">User: {prop.user.first_name || ""} {prop.user.last_name || ""} {prop.user.username ? `(@${prop.user.username})` : ""}</p>
                    )}
                    <div className="font-mono text-xs bg-muted p-1 rounded break-all max-h-16 overflow-hidden">
                      <pre className="whitespace-pre-wrap">{formatValuePreview(prop.value, prop.type)}</pre>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => handleViewProperty(prop)}>
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1 gap-2" onClick={() => handleDeleteRequest(prop)}>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <PropertyDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        property={selectedProperty}
        onDelete={handleDeleteRequest}
      />

      {deleteConfirm && (
        <DeleteConfirmModal
          title="Delete Property?"
          description={
            <>
              Are you sure you want to delete the property{" "}
              <span className="font-semibold text-foreground">
                "{deleteConfirm.name}"
              </span>
              ? This action cannot be undone.
            </>
          }
          confirmText="Delete Property"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm(null)}
          isLoading={isDeleting}
        />
      )}

      {showClearAllConfirm && (
        <DeleteConfirmModal
          title="Clear All Properties?"
          description={
            <>
              Are you sure you want to delete <span className="font-semibold text-foreground">all properties</span> for this bot?
              This action cannot be undone.
            </>
          }
          confirmText="Clear All"
          onConfirm={handleConfirmClearAll}
          onCancel={() => setShowClearAllConfirm(false)}
          isLoading={isClearingAll}
        />
      )}

      {/* Simplified Clear All Progress Modal */}
      {isClearingAll && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[52] p-4">
          <Card className="w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Clearing Properties...</h3>
            <Progress value={clearProgress} className="w-full mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              Deleted {deletedCount} of {totalToDelete}...
            </p>
            {/* Message shown after completion if there were errors */}
             {clearErrorsCount > 0 && !isClearingAll && (
                 <p className="text-xs text-destructive mt-3 text-center">
                     {clearErrorsCount} {clearErrorsCount === 1 ? 'property' : 'properties'} failed to delete. Check console for details.
                 </p>
             )}
            {/* Close button appears only after completion */}
            {!isClearingAll && (
                <Button className="mt-4 w-full" onClick={() => setIsClearingAll(false)}>Close</Button>
            )}
          </Card>
        </div>
      )}

    </div>
  )
}