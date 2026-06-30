"use client"
import * as React from "react"
import {
  LayoutDashboard,
  MapPin,
  Settings2,
  Fuel,
  FileText,
  BarChart2,
  History,
  Zap,
  Users,
  ArrowRightLeft,
} from "lucide-react"
import { NavMain } from "@/components/layout/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

import { useUser } from "@clerk/nextjs"
import { FuelRequestSheet } from "@/features/fuel-requests/components/fuel-request-sheet"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const userRole = (user?.publicMetadata?.role as string) || "TECHNICIAN"
  const [sheetOpen, setSheetOpen] = React.useState(false)

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [],
      roles: ["ADMIN", "TECHNICIAN", "MANAGER", "SUPERVISOR"]
    },
    {
      title: "Sites",
      url: "/dashboard/sites",
      icon: MapPin,
      items: [],
      roles: ["ADMIN", "MANAGER", "SUPERVISOR", "TECHNICIAN"]
    },
    {
      title: "Field Engineers",
      url: "/dashboard/technicians",
      icon: Users,
      roles: ["ADMIN", "MANAGER"]
    },
    {
      title: "Generators",
      url: "/dashboard/generators",
      icon: Zap,
      items: [],
      roles: ["ADMIN", "MANAGER", "SUPERVISOR", "TECHNICIAN"]
    },
    {
      title: "Fuel Requests",
      url: "/dashboard/fuel-request",
      icon: FileText,
      items: [],
      roles: ["ADMIN", "MANAGER", "SUPERVISOR", "TECHNICIAN"]
    },
    {
      title: "Fuel Delivery",
      url: "/dashboard/fuel-delivery",
      icon: Fuel,
      items: [],
      roles: ["ADMIN", "TECHNICIAN", "SUPERVISOR"]
    },
    {
      title: "Transactions",
      url: "/dashboard/transactions",
      icon: ArrowRightLeft,
      items: [],
      roles: ["ADMIN", "MANAGER"]
    },
    {
      title: "Generator Fuel Journal",
      url: "/dashboard/fuel-journal",
      icon: BarChart2,
      roles: ["ADMIN", "MANAGER", "SUPERVISOR", "TECHNICIAN"]
    },

    {
      title: "Fuel Usage History",
      url: "/dashboard/history/fuel-usage",
      icon: History,
      roles: ["ADMIN", "MANAGER"]
    },
  ]

  const filteredNav = navMain.filter(item => 
    !item.roles || item.roles.includes(userRole)
  )

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="/dashboard">
                  <div className="flex items-center justify-center rounded-lg">
                    <img src="/ethio_logo_full.png" alt="ethio telecom" className="h-10 w-auto object-contain" />
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={filteredNav} />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      
      {/* Unified Request Sheet globally available from Sidebar */}
      <FuelRequestSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}
