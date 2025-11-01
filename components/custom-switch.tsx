"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CustomSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id: string
  className?: string
  disabled?: boolean
  [key: string]: any
}

const CustomSwitch = React.forwardRef<
  HTMLInputElement,
  CustomSwitchProps
>(({ className, checked, onCheckedChange, id, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange(e.target.checked)
  }

  return (
    <label className={"relative inline-flex items-center cursor-pointer"}>
      <input
        type="checkbox"
        id={id}
        value=""
        className="sr-only peer"
        checked={checked}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
      <div
        className={cn(
          "peer ring-0 bg-rose-400 rounded-full outline-none duration-300 after:duration-500 w-12 h-12 shadow-md peer-checked:bg-emerald-500 peer-focus:outline-none after:content-['✖️'] after:rounded-full after:absolute after:outline-none after:h-10 after:w-10 after:bg-gray-50 after:top-1 after:left-1 after:flex after:justify-center after:items-center peer-hover:after:scale-75 peer-checked:after:content-['✔️'] after:-rotate-180 peer-checked:after:rotate-0",
          className
        )}
      ></div>
    </label>
  )
})
CustomSwitch.displayName = "CustomSwitch"

export { CustomSwitch }
export default CustomSwitch
