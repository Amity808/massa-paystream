// components/protected-route.tsx
"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { useWallet } from "@/contexts/wallet-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string[]
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, userRole } = useUser()
  const { isConnected } = useWallet()
  const router = useRouter()

  useEffect(() => {
    // Give minimal time for role detection from smart contract
    const timeoutId = setTimeout(() => {
      console.log("ProtectedRoute check:", { isConnected, isAuthenticated, userRole, requiredRole })
      
      if (!isConnected) {
        console.log("No wallet connection, redirecting to auth")
        router.push("/auth")
        return
      }

      if (!isAuthenticated || !userRole) {
        console.log("Not authenticated or no role, redirecting to auth", { isAuthenticated, userRole })
        router.push("/auth")
        return
      }

      if (requiredRole && !requiredRole.includes(userRole)) {
        console.log("User role not in required roles, redirecting", { userRole, requiredRole })
        // Redirect to appropriate dashboard if user doesn't have required role
        switch (userRole) {
          case "company":
            router.push("/dashboard/company")
            break
          case "project":
            router.push("/dashboard/project")
            break
          case "verifier":
            router.push("/dashboard/verifier")
            break
          case "admin":
            router.push("/dashboard/admin")
            break
          default:
            router.push("/dashboard/overview")
        }
      } else {
        console.log("ProtectedRoute: Access granted")
      }
    }, 100) // Reduced from 500ms since no localStorage loading needed

    return () => clearTimeout(timeoutId)
  }, [isConnected, isAuthenticated, userRole, requiredRole, router])

  if (!isConnected || !isAuthenticated || !userRole) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading...</p>
      </div>
    )
  }

  if (requiredRole && !requiredRole.includes(userRole)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Redirecting...</p>
      </div>
    )
  }

  return <>{children}</>
}
