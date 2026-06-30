import Link from "next/link"
import { Droplet, FilePlus2, ScanLine, Clock } from "lucide-react"

export default function MobileDashboard() {
  return (
    <div className="flex flex-col gap-6 pt-4">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 w-full">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Active Shift</h2>
        <p className="text-sm text-gray-500 font-medium">Ready to log data.</p>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-tight text-gray-400 pl-1">Actions</h3>
        
        {/* Action Card: Log Delivery */}
        <Link href="/mobile/delivery">
          <div className="group bg-gradient-to-br from-lime-500 to-lime-600 rounded-2xl p-5 shadow-lime-500/20 shadow-lg active:scale-[0.98] transition-transform">
            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Droplet className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Log Fuel Delivery</h3>
            <p className="text-lime-50 text-sm mt-1">Record a recent tanker refill</p>
          </div>
        </Link>
        
        {/* Action Card: Fuel Request */}
        <Link href="/mobile/request">
          <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-transparent active:border-lime-500 flex items-center gap-4 active:scale-[0.98] transition-transform">
            <div className="bg-lime-100 w-12 h-12 rounded-full flex items-center justify-center shrink-0">
              <FilePlus2 className="w-6 h-6 text-lime-700" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-bold text-gray-800 tracking-tight">Request Fuel</h3>
              <p className="text-sm text-gray-500">Create a new site order</p>
            </div>
          </div>
        </Link>

        {/* Action Card: Scan Generator */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 opacity-50 relative pointer-events-none">
          <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center shrink-0">
            <ScanLine className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-gray-800 tracking-tight">Scan Generator</h3>
            <p className="text-sm text-gray-500">QR scanning coming soon</p>
          </div>
        </div>
      </div>
      
    </div>
  )
}
