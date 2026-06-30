"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createFuelRefill } from "@/features/fuel-refills/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function MobileDeliveryForm({ sites, technicians }: { sites: any[], technicians: any[] }) {
  const [isPending, setIsPending] = React.useState(false)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      siteId: parseInt(formData.get("siteId") as string),
      fuelDelivered: parseFloat(formData.get("fuelDelivered") as string),
      beforeLevel: parseFloat(formData.get("beforeLevel") as string),
      afterLevel: parseFloat(formData.get("afterLevel") as string),
      beforeHours: parseFloat(formData.get("beforeHours") as string),
      afterHours: parseFloat(formData.get("afterHours") as string),
      tankerVehicle: (formData.get("tankerVehicle") as string) || undefined,
      driverName: (formData.get("driverName") as string) || undefined,
      technicianId: formData.get("technicianId") ? parseInt(formData.get("technicianId") as string) : undefined,
    }

    try {
      await createFuelRefill(data)
      toast.success("Delivery logged successfully!")
      router.refresh()
      router.push("/mobile")
    } catch (error) {
      toast.error("Failed to log delivery")
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-5">
        <div className="space-y-3">
          <Label className="text-gray-700 font-bold uppercase tracking-tight text-xs ml-1">Assign To Site</Label>
          <Select name="siteId" required>
            <SelectTrigger className="h-14 rounded-xl border-gray-200 text-base font-medium">
              <SelectValue placeholder="Tap to select site..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {sites.map(site => (
                <SelectItem key={site.id} value={site.id.toString()} className="py-3 text-base">
                  {site.siteId} - {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-gray-700 font-bold uppercase tracking-tight text-xs ml-1">Liters Delivered</Label>
          <Input name="fuelDelivered" type="number" step="0.1" required placeholder="e.g. 500" className="h-14 rounded-xl border-gray-200 text-lg font-bold w-full" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-5">
        <h3 className="text-sm font-bold uppercase tracking-tight text-lime-600 border-b border-gray-50 pb-2">Fuel Levels</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-500 text-xs font-semibold uppercase">Before Refill</Label>
            <Input name="beforeLevel" type="number" step="0.1" required placeholder="0.0" className="h-12 rounded-xl text-center font-bold" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-500 text-xs font-semibold uppercase">After Refill</Label>
            <Input name="afterLevel" type="number" step="0.1" required placeholder="0.0" className="h-12 rounded-xl text-center font-bold" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-5">
        <h3 className="text-sm font-bold uppercase tracking-tight text-violet-600 border-b border-gray-50 pb-2">Running Hours</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-500 text-xs font-semibold uppercase">Beginning</Label>
            <Input name="beforeHours" type="number" step="0.1" required placeholder="0.0" className="h-12 rounded-xl text-center font-bold" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-500 text-xs font-semibold uppercase">Ending</Label>
            <Input name="afterHours" type="number" step="0.1" required placeholder="0.0" className="h-12 rounded-xl text-center font-bold" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-5">
        <div className="space-y-3">
          <Label className="text-gray-700 font-bold uppercase tracking-tight text-xs ml-1">Technician (You)</Label>
          <Select name="technicianId">
            <SelectTrigger className="h-12 rounded-xl border-gray-200">
              <SelectValue placeholder="Select your name..." />
            </SelectTrigger>
            <SelectContent>
              {technicians.map(tech => (
                <SelectItem key={tech.id} value={tech.id.toString()} className="py-2">
                  {tech.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-500 text-xs font-semibold uppercase">Driver</Label>
            <Input name="driverName" placeholder="Driver Name" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-500 text-xs font-semibold uppercase">Plate No</Label>
            <Input name="tankerVehicle" placeholder="AA-1234" className="h-12 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Floating Action Button style container for submit */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto">
          <Button 
            type="submit" 
            disabled={isPending} 
            className="w-full h-14 rounded-xl bg-lime-600 hover:bg-lime-700 text-white font-bold text-lg tracking-tight active:scale-95 transition-transform shadow-lg shadow-lime-600/30"
          >
            {isPending ? "Connecting..." : "Submit Delivery Log"}
          </Button>
        </div>
      </div>
    </form>
  )
}
