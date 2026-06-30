"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavUser() {
  const { isLoaded, user } = useUser();

  if (!isLoaded || !user) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center justify-center py-2">
        <UserButton 
          appearance={{
            elements: {
              userButtonBox: "flex-row-reverse",
              userButtonOuterIdentifier: "text-sm font-medium",
            }
          }}
          showName={true}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}


