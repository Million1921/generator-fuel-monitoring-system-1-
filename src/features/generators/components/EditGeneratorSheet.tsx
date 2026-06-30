"use client"

import * as React from "react"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { updateGenerator } from "@/features/generators/actions"

export function EditGeneratorSheet({ generator }: { generator: any }) {
  const [open, setOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      model: formData.get("model") as string,
      serialNumber: formData.get("serialNumber") as string,
      capacityKVA: formData.get("capacityKVA") as string,
      stdFuelConsumption: formData.get("stdFuelConsumption") as string,
      lastRunningHours: formData.get("lastRunningHours") as string,
    }

    try {
      await updateGenerator(generator.id, data)
      toast.success("Generator updated successfully")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Failed to update generator")
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5 text-lime-600 hover:bg-lime-50 hover:text-lime-700">
          <Pencil className="h-3 w-3" />
          <span className="sr-only">Edit</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl p-0 border-none overflow-y-auto bg-white">
        <SheetHeader className="bg-lime-600 p-6 text-white relative">
          <SheetTitle className="text-xl font-bold text-white uppercase tracking-tight">Edit Generator</SheetTitle>
          <SheetDescription className="text-lime-100/90 text-sm mt-1">
            Update the details for this generator.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <Label htmlFor="model" className="text-sm font-semibold text-gray-700">Model / Type</Label>
              <Input id="model" name="model" defaultValue={generator.model || ""} required className="h-10 border-gray-200 focus:ring-lime-500" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serialNumber" className="text-sm font-semibold text-gray-700">Serial Number</Label>
              <Input id="serialNumber" name="serialNumber" defaultValue={generator.serialNumber || ""} className="h-10 border-gray-200 focus:ring-lime-500" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacityKVA" className="text-sm font-semibold text-gray-700">Capacity (KVA)</Label>
              <Input
                id="capacityKVA"
                name="capacityKVA"
                type="number"
                step="0.1"
                defaultValue={generator.capacityKVA?.toString() || "0"}
                required
                className="h-10 border-gray-200 focus:ring-lime-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stdFuelConsumption" className="text-sm font-semibold text-gray-700">Standard Consumption (L/hr)</Label>
              <Input
                id="stdFuelConsumption"
                name="stdFuelConsumption"
                type="number"
                step="0.01"
                defaultValue={generator.stdFuelConsumption?.toString() || "0"}
                required
                className="h-10 border-gray-200 focus:ring-lime-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastRunningHours" className="text-sm font-semibold text-gray-700">Running Hours</Label>
              <Input
                id="lastRunningHours"
                name="lastRunningHours"
                type="number"
                step="0.1"
                defaultValue={generator.lastRunningHours?.toString() || "0"}
                required
                className="h-10 border-gray-200 focus:ring-lime-500"
              />
            </div>
          </div>
          
          <div className="mt-12 flex items-center justify-end gap-3 border-t pt-6">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="px-6 h-10 font-bold text-gray-500 hover:bg-gray-50 uppercase tracking-tight">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="px-8 h-10 bg-lime-600 hover:bg-lime-700 text-white font-bold uppercase tracking-tight shadow-sm">
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
