"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
import * as XLSX from "xlsx"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ExportProps {
  deliveries: any[]
}

export function FuelDeliveryExportButtons({ deliveries }: ExportProps) {
  const prepareData = () => {
    return deliveries.map(d => ({
      "Site ID": d.site?.siteId,
      "Site Name": d.site?.name,
      "Region": d.site?.region || 'N/A',
      "Refill Date": new Date(d.refillDate).toLocaleDateString(),
      "Fuel Delivered (L)": d.fuelDelivered,
      "Before Hours": d.beforeHours,
      "After Hours": d.afterHours,
      "Before Level (L)": d.beforeLevel,
      "After Level (L)": d.afterLevel,
      "Technician": d.technicianName || '',
      "Technician ID": d.technicianIdStr || '',
      "Driver": d.driverName || '',
      "Driver ID": d.driverId || '',
      "Employment Type": d.employmentType || ''
    }))
  }

  const handleExportCSV = () => {
    try {
      const data = prepareData()
      if (data.length === 0) {
        toast.error("No data available to export")
        return
      }
      
      const ws = XLSX.utils.json_to_sheet(data)
      const csv = XLSX.utils.sheet_to_csv(ws)
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `Fuel_Deliveries_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("CSV exported successfully")
    } catch (e) {
      toast.error("Failed to export CSV")
    }
  }

  const handleExportExcel = () => {
    try {
      const data = prepareData()
      if (data.length === 0) {
        toast.error("No data available to export")
        return
      }

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Deliveries")
      
      XLSX.writeFile(wb, `Fuel_Deliveries_${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success("Excel exported successfully")
    } catch (e) {
      toast.error("Failed to export Excel")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-11 px-4 bg-slate-50/50 border-slate-200 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 shadow-sm"
        >
          <FileSpreadsheet className="h-6 w-6 text-slate-800" />
          <Download className="h-5 w-5 text-slate-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportExcel} className="flex items-center gap-2 cursor-pointer font-bold text-lime-700">
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export as Excel</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV} className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
          <FileText className="h-4 w-4" />
          <span>Export as CSV</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
