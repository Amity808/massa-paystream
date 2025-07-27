// app/dashboard/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { userRole, isAuthenticated } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    // Redirect to role-specific dashboard
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
  }, [userRole, isAuthenticated, router])

  return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-10 w-10 animate-spin text-green-500" />
      <p className="ml-4 text-lg">Redirecting to your dashboard...</p>
    </div>
  )
}
