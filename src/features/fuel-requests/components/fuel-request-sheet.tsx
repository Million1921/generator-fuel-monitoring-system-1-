"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createFuelRequest } from "@/features/fuel-requests/actions"
import { getSites } from "@/features/sites/actions"
import { getTechnicians } from "@/features/technicians/actions"
import { toast } from "sonner"
import { FuelRequestFormSchema, FuelRequestFormValues } from "@/schemas/fuel"

interface Site {
  id: number;
  siteId: string;
  name: string;
}

interface Technician {
  id: number;
  name: string | null;
}

export function FuelRequestSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [sites, setSites] = React.useState<Site[]>([])
  const [technicians, setTechnicians] = React.useState<Technician[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FuelRequestFormValues>({
    resolver: zodResolver(FuelRequestFormSchema),
    defaultValues: {
      priority: "ROUTINE",
      notifyUser: true,
      requesterEmail: "million.tesfahun@ethiotelecom.et",
      contactPreference: "email",
      driverType: "employ",
      siteId: "",
      department: "",
      requestedForId: "",
      requestDescription: "",
      additionalDescription: "",
      requesterPhone: "",
      driverName: "",
      technicianId: "",
      literRequired: 0,
      remark: "",
    },
  })

  React.useEffect(() => {
    if (open) {
      getSites().then(setSites)
      getTechnicians().then(res => {
        if (res && res.technicians) {
          setTechnicians(res.technicians.map(t => ({
            id: Number(t.id),
            name: t.name || "Unnamed Technician", // FIXED: References t.name directly instead of the empty t.user?.name
          })))
        }
      })
    }
  }, [open])

  async function onSubmit(data: FuelRequestFormValues) {
    setIsSubmitting(true)

    // Build the request matching backend Action interface
    const requestData = {
      siteId: data.siteId,
      priority: data.priority,
      literRequired: data.literRequired,
      technicianId: data.technicianId || undefined,
      remark: data.remark || undefined,
    }

    try {
      await createFuelRequest(requestData)
      toast.success("Work request submitted successfully")
      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to submit request")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get current date time for display
  const [currentDateTime, setCurrentDateTime] = React.useState("")
  React.useEffect(() => {
    const now = new Date()
    setCurrentDateTime(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`)
  }, [open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-3xl p-0 border-none overflow-y-auto bg-white dark:bg-neutral-900" side="right">
        <SheetHeader className="bg-lime-600 p-6 text-white relative">
          <SheetTitle className="text-xl font-semibold text-white uppercase tracking-tight">Fuel Request and Delivery System</SheetTitle>
          <SheetDescription className="text-lime-100/90 text-sm mt-1 font-medium italic">
            Submit a new fuel or work request with driver and delivery details.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          
          {/* Section 1: CREATE WORK REQUEST */}
          <div className="space-y-6">
            <h3 className="font-semibold text-sm text-lime-700 uppercase tracking-widest border-b border-lime-100 pb-2">1. Work Request Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteId" className="text-sm font-semibold text-gray-700">Site Number <span className="text-red-500">*</span></Label>
                <Controller
                  name="siteId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-10 border-gray-200 focus:ring-lime-500">
                        <SelectValue placeholder="Select site..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {sites.map((site) => (
                          <SelectItem key={site.id} value={site.id.toString()}>
                            {site.siteId} - {site.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.siteId && (
                  <p className="text-xs text-red-500 font-medium">{errors.siteId.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-semibold text-gray-700">Assign Department</Label>
                <Input id="department" {...register("department")} placeholder="e.g. Facilities" className="h-10 border-gray-200 focus:ring-lime-500" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Requested Date & Time</Label>
                <Input value={currentDateTime} disabled className="h-10 bg-gray-50 border-gray-100 text-gray-500 italic" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestedForId" className="text-sm font-semibold text-gray-700">Requested For ID <span className="text-red-500">*</span></Label>
                <Input id="requestedForId" {...register("requestedForId")} placeholder="e.g. ETHIO19492" className="h-10 border-gray-200 focus:ring-lime-500" />
                {errors.requestedForId && (
                  <p className="text-xs text-red-500 font-medium">{errors.requestedForId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-semibold text-gray-700">Priority Level</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-10 border-gray-200 focus:ring-lime-500">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="EMERGENCY" className="text-red-600 font-bold">Emergency</SelectItem>
                        <SelectItem value="HIGH" className="text-orange-600 font-semibold">High</SelectItem>
                        <SelectItem value="MEDIUM" className="text-lime-600">Medium</SelectItem>
                        <SelectItem value="LOW" className="text-gray-600">Low</SelectItem>
                        <SelectItem value="ROUTINE">Routine</SelectItem>
                        <SelectItem value="URGENT" className="text-red-500">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2 flex flex-col justify-end pb-1">
                <div className="flex items-center gap-3 bg-lime-50/50 p-2 rounded-lg border border-lime-100/50">
                  <Controller
                    name="notifyUser"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="notifyUser"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="notifyUser" className="text-xs font-semibold text-lime-700 uppercase cursor-pointer">Notify User via SMS/Email</Label>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <Label htmlFor="requestDescription" className="text-sm font-semibold text-gray-700">Request Description</Label>
                <Textarea id="requestDescription" {...register("requestDescription")} placeholder="Main purpose of this request..." rows={3} className="border-gray-200 focus:ring-lime-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalDescription" className="text-sm font-semibold text-gray-700">Additional Details</Label>
                <Textarea id="additionalDescription" {...register("additionalDescription")} placeholder="Extra information..." rows={3} className="border-gray-200 focus:ring-lime-500" />
              </div>
            </div>
          </div>

          {/* Section 2: Requester & Driver Info */}
          <div className="space-y-6 pt-4">
            <h3 className="font-semibold text-sm text-lime-700 uppercase tracking-widest border-b border-lime-100 pb-2">2. Requester & Personnel</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="requesterEmail" className="text-sm font-semibold text-gray-700">Email Address</Label>
                <Input id="requesterEmail" type="email" {...register("requesterEmail")} className="h-10 border-gray-200" />
                {errors.requesterEmail && (
                  <p className="text-xs text-red-500 font-medium">{errors.requesterEmail.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="requesterPhone" className="text-sm font-semibold text-gray-700">Phone Number <span className="text-red-500">*</span></Label>
                <Input id="requesterPhone" type="tel" {...register("requesterPhone")} placeholder="+251..." className="h-10 border-gray-200" />
                {errors.requesterPhone && (
                  <p className="text-xs text-red-500 font-medium">{errors.requesterPhone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Contact Preference</Label>
                <Controller
                  name="contactPreference"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center gap-6 h-10">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="c-email" />
                        <Label htmlFor="c-email" className="text-xs font-semibold text-gray-600 uppercase">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="c-phone" />
                        <Label htmlFor="c-phone" className="text-xs font-semibold text-gray-600 uppercase">Phone</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
              <div className="space-y-2">
                <Label htmlFor="driverName" className="text-sm font-semibold text-gray-700">Driver Full Name</Label>
                <Input id="driverName" {...register("driverName")} className="h-10 bg-white border-gray-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverType" className="text-sm font-semibold text-gray-700">Driver Category</Label>
                <Controller
                  name="driverType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-10 bg-white border-gray-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="employ">Employee</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                        <SelectItem value="third_party">Third Party</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="technicianId" className="text-sm font-semibold text-gray-700">Assigned Technician</Label>
                <Controller
                  name="technicianId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="technicianId" className="h-10 bg-white border-gray-200">
                        <SelectValue placeholder="Select technician..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id.toString()}>
                            {tech.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="literRequired" className="text-sm font-semibold text-gray-700">Liter Required <span className="text-red-500">*</span></Label>
                <Input id="literRequired" type="number" step="0.01" {...register("literRequired")} className="h-10 bg-white border-gray-200 font-bold text-lime-700" />
                {errors.literRequired && (
                  <p className="text-xs text-red-500 font-medium">{errors.literRequired.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="remark" className="text-sm font-semibold text-gray-700">Additional Remarks</Label>
              <Textarea id="remark" {...register("remark")} placeholder="Any final comments or observations..." rows={3} className="border-gray-200 focus:ring-lime-500" />
            </div>
          </div>

          <div className="mt-12 flex items-center justify-end gap-3 border-t pt-8 pb-8">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="px-6 h-10 font-semibold text-gray-500 hover:bg-gray-50 uppercase tracking-tight">
              Cancel
            </Button>
            <Button type="button" onClick={() => reset()} variant="secondary" className="px-6 h-10 font-semibold uppercase tracking-tight">
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting} className="px-8 h-10 bg-lime-600 hover:bg-lime-700 text-white font-semibold uppercase tracking-tight shadow-sm">
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
