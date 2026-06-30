"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useTransition, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function SearchInput({ placeholder, className }: { placeholder: string, className?: string }) {
  const { replace } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState(searchParams.get("search")?.toString() || "")

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set("search", value)
      } else {
        params.delete("search")
      }
      params.set("page", "1")

      startTransition(() => {
        replace(`${pathname}?${params.toString()}`)
      })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [value, pathname, replace])

  return (
    <div className={cn("relative flex-1 group", className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-lime-600 transition-colors" />
      <Input
        type="search"
        placeholder={placeholder}
        className="h-9 pl-10 pr-10 border-slate-200 rounded-md focus-visible:ring-lime-500 shadow-sm text-[13px] placeholder:text-slate-400 transition-all bg-slate-50/30 hover:bg-white focus:bg-white"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 rounded-full"
          title="Clear search"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      {isPending && (
         <div className="absolute right-10 top-1/2 -translate-y-1/2">
           <div className="h-3 w-3 animate-spin rounded-full border-2 border-lime-500 border-t-transparent" />
         </div>
      )}
    </div>
  )
}
