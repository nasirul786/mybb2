"use client"

import * as React from "react"

export interface TabConfig {
  value: string
  label: string
  icon?: React.ReactNode
}

interface AnimatedTabSwitcherProps {
  value: string
  onValueChange: (value: string) => void
  tabs: TabConfig[]
}

export const AnimatedTabSwitcher: React.FC<AnimatedTabSwitcherProps> = ({
  value,
  onValueChange,
  tabs,
}) => {
  const selectedIndex = tabs.findIndex((tab) => tab.value === value)
  const tabCount = tabs.length

  if (tabCount === 0) return null

  const tabWidthPercentage = 100 / tabCount

  return (
    <div className="relative flex w-full bg-gray-200 dark:bg-gray-700 rounded-lg shadow-inner">
      <div
        className="absolute top-0 left-0 h-full p-1 transition-all duration-200 ease-out z-10"
        style={{
          width: `${tabWidthPercentage}%`,
          transform: `translateX(calc(${selectedIndex} * 100%))`,
        }}
      >
        <div className="w-full h-full bg-white dark:bg-gray-500 rounded-md shadow-lg" />
      </div>

      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onValueChange(tab.value)}
          className={`relative z-20 flex-1 flex items-center justify-center p-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
            value === tab.value
              ? "text-primary dark:text-white"
              : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          }`}
          style={{ flexBasis: `${tabWidthPercentage}%` }}
        >
          {tab.icon && <span className="mr-2 flex-shrink-0">{tab.icon}</span>}
          <span className="truncate">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}