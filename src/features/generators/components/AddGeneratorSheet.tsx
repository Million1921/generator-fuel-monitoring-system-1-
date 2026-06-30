"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createGenerator } from "@/features/generators/actions"

interface Site {
  id: number
  siteId: string
  name: string
}

export function AddGeneratorSheet({ sites }: { sites: Site[] }) {
  const [open, setOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const [selectedSiteId, setSelectedSiteId] = React.useState<string>("")
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
      siteId: formData.get("siteId") as string,
    }

    try {
      await createGenerator(data)
      toast.success("Generator added successfully")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Failed to add generator")
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-2 bg-lime-600 hover:bg-lime-700 text-white font-bold uppercase tracking-tight">
          <Plus className="h-4 w-4" />
          Add Generator
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl p-0 border-none overflow-y-auto">
        <SheetHeader className="bg-lime-600 p-6 text-white relative">
          <SheetTitle className="text-xl font-bold text-white uppercase tracking-tight">Add New Generator</SheetTitle>
          <SheetDescription className="text-lime-100/90 text-sm mt-1">
            Register a new generator assigned to a specific site.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <Label htmlFor="site" className="text-sm font-semibold text-gray-700">Assign to Site</Label>
              <Select name="siteId" required>
                <SelectTrigger id="site" className="h-10 border-gray-200 focus:ring-lime-500 text-left">
                  <SelectValue placeholder="Select site..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {sites.map(site => (
                    <SelectItem key={site.id} value={site.id.toString()}>{site.siteId} - {site.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model" className="text-sm font-semibold text-gray-700">Model / Type</Label>
              <Input id="model" name="model" placeholder="e.g. Cummins 50kVA" required className="h-10 border-gray-200 focus:ring-lime-500" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber" className="text-sm font-semibold text-gray-700">Serial Number</Label>
              <Input id="serialNumber" name="serialNumber" placeholder="e.g. SN-987654321" required className="h-10 border-gray-200 focus:ring-lime-500" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacityKVA" className="text-sm font-semibold text-gray-700">Capacity (KVA)</Label>
              <Input id="capacityKVA" name="capacityKVA" type="number" step="0.1" placeholder="e.g. 50" required className="h-10 border-gray-200 focus:ring-lime-500" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stdFuelConsumption" className="text-sm font-semibold text-gray-700">Std Fuel (L/hr)</Label>
              <Input id="stdFuelConsumption" name="stdFuelConsumption" type="number" step="0.01" placeholder="e.g. 12.5" required className="h-10 border-gray-200 focus:ring-lime-500" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastRunningHours" className="text-sm font-semibold text-gray-700">Initial Running Hours</Label>
              <Input id="lastRunningHours" name="lastRunningHours" type="number" step="0.1" placeholder="e.g. 0" defaultValue="0" required className="h-10 border-gray-200 focus:ring-lime-500" />
            </div>
          </div>

          <div className="mt-12 flex items-center justify-end gap-3 border-t pt-6">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="px-6 h-10 font-bold text-gray-500 hover:bg-gray-50 uppercase tracking-tight">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="px-8 h-10 bg-lime-600 hover:bg-lime-700 text-white font-bold uppercase tracking-tight shadow-sm">
              {isPending ? "Adding..." : "Add Generator"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
