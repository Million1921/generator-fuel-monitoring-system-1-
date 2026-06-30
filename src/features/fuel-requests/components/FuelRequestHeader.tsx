"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { FuelRequestSheet } from "@/features/fuel-requests/components/fuel-request-sheet"

export function FuelRequestHeader() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-lime-500 hover:bg-lime-600 text-white shadow-sm text-sm h-9">
        <PlusCircle className="mr-2 h-4 w-4" />
        New Request
      </Button>
      <FuelRequestSheet open={open} onOpenChange={setOpen} />
    </>
  )
}
