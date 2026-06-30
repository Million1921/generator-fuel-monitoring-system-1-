"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export function AutoRefresh({ intervalMs = 60000 }: { intervalMs?: number }) {
  const router = useRouter()

  React.useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, intervalMs)

    return () => clearInterval(interval)
  }, [router, intervalMs])

  return null
}
