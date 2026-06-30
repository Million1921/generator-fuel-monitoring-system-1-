"use client"

import { ArrowUpDown, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface TableColumnHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  sortActive?: boolean
  onSort?: () => void
}

export function TableColumnHeader({
  label,
  sortActive,
  onSort,
  className,
  ...props
}: TableColumnHeaderProps) {
  return (
    <div 
      className={cn("flex items-center gap-1.5 group cursor-pointer select-none", className)} 
      onClick={onSort}
      {...props}
    >
      <span className="font-bold text-black dark:text-white uppercase tracking-tight text-[13px] whitespace-nowrap">
        {label}
      </span>
      <div className="flex items-center gap-0.5 opacity-100 transition-opacity">
        <ArrowUpDown 
          className={cn(
            "h-4 w-4 transition-colors",
            sortActive ? "text-lime-600" : "text-gray-400"
          )} 
        />
        <GripVertical className="h-4 w-4 text-black stroke-[3]" />
      </div>
    </div>
  )
}
