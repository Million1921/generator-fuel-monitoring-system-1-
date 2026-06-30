"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface PaginationProps {
  totalPages: number
  currentPage: number
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  const handlePageChange = (page: number) => {
    router.push(createPageURL(page))
  }

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = []
    const showMax = 5
    
    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push("...")
      
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i)
      }
      
      if (currentPage < totalPages - 2) pages.push("...")
      if (!pages.includes(totalPages)) pages.push(totalPages)
    }
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none border-r border-gray-200 text-gray-400 hover:bg-gray-50 bg-white"
        disabled={currentPage <= 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {getPageNumbers().map((page, index) => (
        <Button
          key={index}
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-none p-0 text-[14px] font-normal transition-colors border-r last:border-r-0 border-gray-200",
            page === currentPage 
              ? "bg-[#1E6BFF] text-white hover:bg-[#1E6BFF]/90 border-[#1E6BFF] shadow-none" 
              : page === "..."
                ? "text-gray-400 bg-white cursor-default"
                : "text-[#1E6BFF] bg-white hover:bg-gray-50"
          )}
          disabled={page === "..."}
          onClick={() => typeof page === "number" && handlePageChange(page)}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none border-l border-gray-200 text-gray-400 hover:bg-gray-50 bg-white"
        disabled={currentPage >= totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
