import prisma from "@/lib/db"
import { MobileDeliveryForm } from "./form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function MobileDeliveryPage() {
  const sites = await prisma.site.findMany({
    orderBy: { siteId: 'asc' },
    select: { id: true, siteId: true, name: true, tankerCapacity: true, generator: { select: { lastRunningHours: true } } }
  })

  // We fetch technicians so the user can easily select themselves
  const technicians = await prisma.technician.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  })

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex items-center gap-3">
        <Link href="/mobile" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Log Delivery</h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-tight">Record new fuel</p>
        </div>
      </div>
      
      <MobileDeliveryForm sites={sites} technicians={technicians} />
    </div>
  )
}
