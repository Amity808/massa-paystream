// components/app-sidebar.tsx
"use client"

import {
  ShieldCheck,
  UserCog,
  Home,
  BarChart,
  Leaf,
  ShoppingCart,
  CreditCard,
  Target,
  FileText,
  Plus,
  Wallet,
  LogOut,
  Users,
  Activity,
  LineChart,
  Settings,
  ChevronUp,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUser } from "@/contexts/user-context"

export function AppSidebar() {
  const { userRole, currentAddress, logout } = useUser()
  const pathname = usePathname()
  const { state } = useSidebar()

  const companyMenuItems = [
    { title: "Dashboard", href: "/dashboard/company", icon: BarChart },
    { title: "Emissions Tracking", href: "/dashboard/company/emissions", icon: Leaf },
    { title: "Carbon Marketplace", href: "/dashboard/company/marketplace", icon: ShoppingCart },
    { title: "My Credits", href: "/dashboard/company/my-credits", icon: CreditCard },
    { title: "Compliance Center", href: "/dashboard/company/compliance", icon: Target },
    { title: "Marketplace", href: "/marketplace", icon: ShoppingCart },
  ]

  const projectOwnerMenuItems = [
    { title: "Dashboard", href: "/dashboard/project", icon: BarChart },
    { title: "Project Management", href: "/dashboard/project/management", icon: FileText },
    { title: "Credit Minting", href: "/dashboard/project/minting", icon: Plus },
    { title: "Revenue Analytics", href: "/dashboard/project/analytics", icon: LineChart },
    { title: "Marketplace", href: "/marketplace", icon: ShoppingCart },
  ]

  const adminMenuItems = [
    { title: "Platform Overview", href: "/dashboard/admin", icon: Activity },
    { title: "User Management", href: "/dashboard/admin/users", icon: Users },
    { title: "Platform Analytics", href: "/dashboard/admin/platform-analytics", icon: BarChart },
    { title: "Marketplace", href: "/marketplace", icon: ShoppingCart },
  ]

  const verifierMenuItems = [
    { title: "Dashboard", href: "/dashboard/verifier", icon: BarChart },
    { title: "Verification Queue", href: "/dashboard/verifier/queue", icon: ShieldCheck },
    { title: "Marketplace", href: "/marketplace", icon: ShoppingCart },
  ]

  const getMenuItems = () => {
    switch (userRole) {
      case "company":
        return companyMenuItems
      case "project":
        return projectOwnerMenuItems
      case "admin":
        return adminMenuItems
      case "verifier":
        return verifierMenuItems
      default:
        return [
          { title: "Overview", href: "/dashboard/overview", icon: Home },
          { title: "Marketplace", href: "/marketplace", icon: ShoppingCart },
        ]
    }
  }

  const currentMenuItems = getMenuItems()

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" className="flex items-center gap-2 font-bold text-green-500 text-lg p-2">
              <Leaf className="h-6 w-6" />
              <span className={state === "collapsed" ? "sr-only" : ""}>CarbonCredit.io</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {currentMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon />
                      <span className={state === "collapsed" ? "sr-only" : ""}>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Wallet Address">
                  <Wallet />
                  <span className={state === "collapsed" ? "sr-only" : ""}>
                    {currentAddress
                      ? `${currentAddress.substring(0, 6)}...${currentAddress.substring(currentAddress.length - 4)}`
                      : "Not Connected"}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"} tooltip="Settings">
                  <Link href="/dashboard/settings">
                    <Settings />
                    <span className={state === "collapsed" ? "sr-only" : ""}>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings/profile"} tooltip="Profile">
                  <Link href="/dashboard/settings/profile">
                    <UserCog />
                    <span className={state === "collapsed" ? "sr-only" : ""}>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <UserCog />
                  <span className={state === "collapsed" ? "sr-only" : ""}>{userRole || "Guest"}</span>
                  {state !== "collapsed" && <ChevronUp className="ml-auto h-4 w-4" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
