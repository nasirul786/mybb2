"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  TextCursorInput, KeyRound, Users, CircleDollarSign, Power, FileText, Settings as DefaultIcon,
  Eye, EyeOff
} from "lucide-react"

type Field = {
  name: string
  title: string
  description: string
  type: "string" | "password" | "integer" | "float" | "checkbox" | "text"
  placeholder?: string | null
  value: any
  icon?: string | null
  hidden?: boolean | null
}

type Props = {
  fields: Field[]
  onChange: (fieldName: string, value: any) => void
  disabled?: boolean
}

const iconMap: { [key: string]: React.ElementType } = {
  chatbubble: TextCursorInput,
  key: KeyRound,
  people: Users,
  pricetag: CircleDollarSign,
  power: Power,
  "document-text": FileText,
  settings: DefaultIcon,
}

export function AdminPanelForm({ fields, onChange, disabled }: Props) {
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({})

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPassword(prev => ({ ...prev, [fieldName]: !prev[fieldName] }))
  }

  const renderIcon = (field: Field) => {
    const IconComponent = iconMap[field.icon || "settings"] || DefaultIcon
    return <IconComponent className="w-4 h-4 text-primary" />
  }

  const renderFieldInput = (field: Field) => {
    const baseInputClass = "border border-border focus:border-primary outline-none transition-colors rounded-md bg-background"

    switch (field.type) {
      case "string":
        return (
          <Input
            type="text"
            id={field.name}
            name={field.name}
            placeholder={field.placeholder || ""}
            value={field.value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            disabled={disabled}
            className={baseInputClass}
          />
        )
      case "password":
        return (
          <div className="relative">
            <Input
              type={showPassword[field.name] ? "text" : "password"}
              id={field.name}
              name={field.name}
              placeholder={field.placeholder || ""}
              value={field.value || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              disabled={disabled}
              className={`${baseInputClass} pr-10`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => togglePasswordVisibility(field.name)}
              aria-label={showPassword[field.name] ? "Hide password" : "Show password"}
            >
              {showPassword[field.name] ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        )
      case "integer":
        return (
          <Input
            type="number"
            id={field.name}
            name={field.name}
            placeholder={field.placeholder || ""}
            value={field.value ?? ""}
            onChange={(e) =>
              onChange(field.name, e.target.value === "" ? null : parseInt(e.target.value, 10))
            }
            step="1"
            disabled={disabled}
            className={baseInputClass}
          />
        )
      case "float":
        return (
          <Input
            type="number"
            id={field.name}
            name={field.name}
            placeholder={field.placeholder || ""}
            value={field.value ?? ""}
            onChange={(e) =>
              onChange(field.name, e.target.value === "" ? null : parseFloat(e.target.value))
            }
            step="any"
            disabled={disabled}
            className={baseInputClass}
          />
        )
      case "checkbox":
        return (
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id={field.name}
              name={field.name}
              checked={!!field.value}
              onCheckedChange={(checked) => onChange(field.name, !!checked)}
              disabled={disabled}
              className="border-primary/70 data-[state=checked]:bg-primary/80"
            />
            <Label
              htmlFor={field.name}
              className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
            >
              {renderIcon(field)}
              {field.title}
            </Label>
          </div>
        )
      case "text":
        return (
          <Textarea
            id={field.name}
            name={field.name}
            placeholder={field.placeholder || ""}
            value={field.value || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            rows={4}
            disabled={disabled}
            className={`${baseInputClass} resize-none`}
          />
        )
      default:
        return (
          <p className="text-sm text-destructive">
            Unsupported field type: {field.type}
          </p>
        )
    }
  }

  return (
    <div className="space-y-4 w-full">
      {fields.map((field) => {
        if (field.hidden) return null

        const content = (
          <>
            {field.type !== "checkbox" && (
              <div className="flex items-center gap-2 mb-1">
                {renderIcon(field)}
                <Label htmlFor={field.name} className="text-base font-medium">
                  {field.title}
                </Label>
              </div>
            )}
            {renderFieldInput(field)}
            {field.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {field.description}
              </p>
            )}
          </>
        )

        return (
          <div
            key={field.name}
            className="rounded-xl p-4 bg-background/40"
          >
            {content}
          </div>
        )
      })}
    </div>
  )
}
