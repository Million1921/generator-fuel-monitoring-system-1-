"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createFuelRequest } from "@/features/fuel-requests/actions"
import { getSites } from "@/features/sites/actions"
import { toast } from "sonner"

export default function NewFuelRequestPage(props: { searchParams: Promise<{ region?: string }> }) {
  const router = useRouter()
  const [sites, setSites] = React.useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const searchParams = React.use(props.searchParams)
  const region = searchParams.region

  React.useEffect(() => {
    getSites(region).then(setSites)
  }, [region])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      siteId: formData.get("siteId") as string,
      priority: (formData.get("priority") as string) || undefined,
      requestedBy: formData.get("requestedBy") as string,
      requesterEmail: formData.get("requesterEmail") as string,
      requesterPhone: formData.get("requesterPhone") as string,
      notifyUser: true, // Default to true as per form requirements
      remark: formData.get("remark") as string || undefined,
    }

    try {
      await createFuelRequest(data)
      toast.success("Fuel request submitted successfully")
      router.push("/dashboard")
    } catch (error) {
      toast.error("Failed to submit fuel request")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center justify-between px-2">
          <h1 className="text-2xl font-bold tracking-tight">New Fuel Request</h1>
        </div>
      <div className="max-w-2xl rounded-xl border bg-card p-6 shadow-sm">
        <form onSubmit={onSubmit} className="space-y-6 ml-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="siteId">Site</Label>
              <Select name="siteId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id.toString()}>
                      {site.siteId} - {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue="ROUTINE">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="ROUTINE">Routine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestedBy">Requested By (ID)</Label>
            <Input id="requestedBy" name="requestedBy" placeholder="e.g. ETHIO19492" required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="requesterEmail">Email</Label>
              <Input id="requesterEmail" name="requesterEmail" type="email" placeholder="email@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requesterPhone">Phone</Label>
              <Input id="requesterPhone" name="requesterPhone" type="tel" placeholder="+251..." required />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
