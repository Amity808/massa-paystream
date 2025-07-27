import type React from "react"
// app/dashboard/layout.tsx
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-4 md:px-6">
          <SidebarTrigger />
          <h1 className="font-semibold text-lg md:text-xl">Dashboard</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
