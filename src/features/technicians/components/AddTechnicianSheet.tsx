"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ADDIS_ABABA_REGIONS, OUTSIDE_ADDIS_REGIONS } from "@/lib/constants"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { createTechnician } from "@/features/technicians/actions"

interface Region {
  id: number;
  name: string;
}

export function AddTechnicianSheet({ regions }: { regions: Region[] }) {
  const [open, setOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      name: formData.get("name") as string,
      department: formData.get("department") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      regionId: formData.get("regionId") as string,
    }

    try {
      await createTechnician(data)
      toast.success("Technician registered successfully")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Failed to register technician")
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-2 bg-lime-600 hover:bg-lime-700 text-white">
          <Plus className="h-4 w-4" />
          Register Technician
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl p-0 border-none overflow-y-auto">
        <SheetHeader className="bg-lime-600 p-6 text-white relative">
          <SheetTitle className="text-xl font-semibold text-white uppercase tracking-tight">Add New Technician</SheetTitle>
          <SheetDescription className="text-lime-100/90 text-sm mt-1">
            Fill in the details for the new technician.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <Label htmlFor="id" className="text-sm font-semibold text-gray-700">Technician ID</Label>
              <Input id="id" name="id" placeholder="e.g. TECH001" required className="h-10 border-gray-200 focus:ring-lime-500" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
              <Input id="name" name="name" placeholder="e.g. Abebe Kebede" required className="h-10 border-gray-200 focus:ring-lime-500" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="e.g. abebe@email.com" required className="h-10 border-gray-200 focus:ring-lime-500" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
              <Input id="phone" name="phone" placeholder="e.g. +251 911 223344" required className="h-10 border-gray-200 focus:ring-lime-500" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region" className="text-sm font-semibold text-gray-700">Region</Label>
              <Select name="region" required>
                <SelectTrigger id="region" className="h-10 border-gray-200 focus:ring-lime-500 text-left">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    <SelectLabel className="font-semibold text-lime-700">Addis Ababa</SelectLabel>
                    {ADDIS_ABABA_REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="font-semibold text-lime-700">Outside Addis Ababa</SelectLabel>
                    {OUTSIDE_ADDIS_REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-semibold text-gray-700">Role</Label>
              <Select name="role" defaultValue="TECHNICIAN">
                <SelectTrigger id="role" className="h-10 border-gray-200 focus:ring-lime-500 text-left">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="TECHNICIAN">Technician</SelectItem>
                  <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-12 flex items-center justify-end gap-3 border-t pt-6">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="px-6 h-10 font-semibold text-gray-500 hover:bg-gray-50 uppercase tracking-tight">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="px-8 h-10 bg-lime-600 hover:bg-lime-700 text-white font-semibold uppercase tracking-tight shadow-sm">
              {isPending ? "Creating..." : "Save Technician"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
