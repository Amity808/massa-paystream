import type React from "react"
// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
// import { WalletProvider } from "@/hooks/use-wallet"
import { UserProvider } from "@/contexts/user-context"
import { WalletProvider } from "@/contexts/wallet-context"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Carbon Credit Platform",
  description: "Accelerate Your Carbon Neutral Journey",
  generator: 'v0.dev',
  icons: {
    icon: '/favicon.ico',
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultSidebarOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <UserProvider>
            <SidebarProvider defaultOpen={defaultSidebarOpen}>{children}</SidebarProvider>
          </UserProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
