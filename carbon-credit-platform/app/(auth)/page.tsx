// app/(auth)/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import WalletConnect from "@/components/wallet-connect"
import RoleSelector from "./role-selector"
import { useWallet } from "@/hooks/use-wallet"
import { useUser } from "@/contexts/user-context"

export default function AuthPage() {
  const { isConnected } = useWallet()
  const { userRole, isAuthenticated } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && userRole) {
      // Redirect to appropriate dashboard based on role
      switch (userRole) {
        case "Company":
          router.push("/dashboard/company")
          break
        case "Project Owner":
          router.push("/dashboard/project")
          break
        case "Verifier":
          router.push("/dashboard/verifier")
          break
        case "Admin":
          router.push("/dashboard/admin")
          break
        default:
          router.push("/dashboard/overview")
      }
    }
  }, [isAuthenticated, userRole, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-green-500 mb-8">Carbon Credit Platform</h1>
      {!isConnected ? <WalletConnect /> : <RoleSelector />}
    </div>
  )
}
