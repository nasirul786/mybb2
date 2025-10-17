"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, ChevronDown } from "lucide-react"

interface FilterState {
  name?: "asc" | "desc"
  creation?: "asc" | "desc"
  update?: "asc" | "desc"
  status?: "works" | "stopped"
}

interface FilterModalProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClose: () => void
}

export function FilterModal({ filters, onFiltersChange, onClose }: FilterModalProps) {
  const [tempFilters, setTempFilters] = useState<FilterState>(filters)

  const handleApply = () => {
    onFiltersChange(tempFilters)
    onClose()
  }

  const handleReset = () => {
    setTempFilters({})
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Filter Bots</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Name Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <div className="flex gap-2">
                <Button
                  variant={tempFilters.name === "asc" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setTempFilters({
                      ...tempFilters,
                      name: tempFilters.name === "asc" ? undefined : "asc",
                    })
                  }
                  className="flex-1 gap-1"
                >
                  A-Z
                  {tempFilters.name === "asc" && <ChevronDown className="w-3 h-3" />}
                </Button>
                <Button
                  variant={tempFilters.name === "desc" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setTempFilters({
                      ...tempFilters,
                      name: tempFilters.name === "desc" ? undefined : "desc",
                    })
                  }
                  className="flex-1 gap-1"
                >
                  Z-A
                  {tempFilters.name === "desc" && <ChevronDown className="w-3 h-3" />}
                </Button>
              </div>
            </div>

            {/* Creation Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Creation Date</label>
              <div className="flex gap-2">
                <Button
                  variant={tempFilters.creation === "asc" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setTempFilters({
                      ...tempFilters,
                      creation: tempFilters.creation === "asc" ? undefined : "asc",
                    })
                  }
                  className="flex-1"
                >
                  Newest
                </Button>
                <Button
                  variant={tempFilters.creation === "desc" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setTempFilters({
                      ...tempFilters,
                      creation: tempFilters.creation === "desc" ? undefined : "desc",
                    })
                  }
                  className="flex-1"
                >
                  Oldest
                </Button>
              </div>
            </div>

            {/* Update Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Last Updated</label>
              <div className="flex gap-2">
                <Button
                  variant={tempFilters.update === "asc" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setTempFilters({
                      ...tempFilters,
                      update: tempFilters.update === "asc" ? undefined : "asc",
                    })
                  }
                  className="flex-1"
                >
                  Newest
                </Button>
                <Button
                  variant={tempFilters.update === "desc" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setTempFilters({
                      ...tempFilters,
                      update: tempFilters.update === "desc" ? undefined : "desc",
                    })
                  }
                  className="flex-1"
                >
                  Oldest
                </Button>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <div className="flex gap-2">
                <Button
                  variant={tempFilters.status === "works" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setTempFilters({
                      ...tempFilters,
                      status: tempFilters.status === "works" ? undefined : "works",
                    })
                  }
                  className="flex-1"
                >
                  Running
                </Button>
                <Button
                  variant={tempFilters.status === "stopped" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setTempFilters({
                      ...tempFilters,
                      status: tempFilters.status === "stopped" ? undefined : "stopped",
                    })
                  }
                  className="flex-1"
                >
                  Stopped
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 mt-6 border-t border-border">
            <Button variant="outline" onClick={handleReset} className="flex-1 bg-transparent">
              Reset
            </Button>
            <Button onClick={handleApply} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              Apply
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
