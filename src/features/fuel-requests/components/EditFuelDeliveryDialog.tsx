"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2 } from "lucide-react"
import { toast } from "sonner"
import { updateFuelDelivery } from "../actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function EditFuelDeliveryDialog({ delivery }: { delivery: any }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    const data = {
      actualRefueled: parseFloat(formData.get("actualRefueled") as string),
      fuelBeforeRefuel: parseFloat(formData.get("fuelBeforeRefuel") as string),
      begRunningHour: parseFloat(formData.get("begRunningHour") as string),
      endRunningHour: parseFloat(formData.get("endRunningHour") as string),
      driverName: formData.get("driverName") as string,
      driverId: formData.get("driverId") as string,
      technicianName: formData.get("technicianName") as string,
      technicianId: formData.get("technicianId") as string,
      employmentType: formData.get("employmentType") as string,
      workOrderNumber: formData.get("workOrderNumber") as string,
      unitPrice: parseFloat(formData.get("unitPrice") as string),
      siteId: delivery.siteId.toString()
    }

    try {
      await updateFuelDelivery(delivery.id, data)
      toast.success("Delivery updated successfully")
      setOpen(false)
    } catch (err: any) {
      toast.error(`Failed to update: ${err.message || err}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-lime-600 hover:bg-lime-50 focus:ring-0">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Delivery Record #{delivery.id}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Identification</h3>
              <div className="space-y-2">
                <Label htmlFor="workOrderNumber">Work Order Number</Label>
                <Input id="workOrderNumber" name="workOrderNumber" defaultValue={delivery.workOrderNumber || ''} placeholder="e.g. WO-1234" />
              </div>
              <h3 className="font-semibold text-sm border-b pb-2 mt-4">Fuel Readings</h3>
              <div className="space-y-2">
                <Label htmlFor="actualRefueled">Delivered Amount (L)</Label>
                <Input id="actualRefueled" name="actualRefueled" type="number" step="0.1" required defaultValue={delivery.fuelDelivered} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuelBeforeRefuel">Before Level (L)</Label>
                <Input id="fuelBeforeRefuel" name="fuelBeforeRefuel" type="number" step="0.1" required defaultValue={delivery.beforeLevel} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price (Birr)</Label>
                <Input id="unitPrice" name="unitPrice" type="number" step="0.01" required defaultValue={delivery.unitPrice || 70.50} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Running Hours</h3>
              <div className="space-y-2">
                <Label htmlFor="begRunningHour">Before Hours</Label>
                <Input id="begRunningHour" name="begRunningHour" type="number" step="0.1" required defaultValue={delivery.beforeHours} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endRunningHour">After Hours</Label>
                <Input id="endRunningHour" name="endRunningHour" type="number" step="0.1" required defaultValue={delivery.afterHours} />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Driver Info</h3>
              <div className="space-y-2">
                <Label htmlFor="driverName">Driver Name</Label>
                <Input id="driverName" name="driverName" defaultValue={delivery.driverName || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverId">Driver ID</Label>
                <Input id="driverId" name="driverId" defaultValue={delivery.driverId || ''} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Technician Info</h3>
              <div className="space-y-2">
                <Label htmlFor="technicianName">Technician Name</Label>
                <Input id="technicianName" name="technicianName" required defaultValue={delivery.technicianName || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="technicianId">Technician ID</Label>
                <Input id="technicianId" name="technicianId" required defaultValue={delivery.technicianIdStr || ''} />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="employmentType">Employment Type</Label>
                 <Select name="employmentType" defaultValue={delivery.employmentType || "EMPLOYEE"}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select type" />
                   </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="EMPLOYEE">Employee</SelectItem>
                       <SelectItem value="CONTRACT">Contract</SelectItem>
                     </SelectContent>
                 </Select>
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
