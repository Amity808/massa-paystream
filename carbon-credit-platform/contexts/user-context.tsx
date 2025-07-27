// contexts/user-context.tsx
"use client"

import { createContext, useContext, useState, type ReactNode, useCallback, useEffect } from "react"
import type { UserRole } from "@/lib/types"
import { useWallet } from "@/contexts/wallet-context"
import { useRouter } from "next/navigation"

interface UserContextType {
  userRole: UserRole
  setUserRole: (role: UserRole) => void
  isAuthenticated: boolean
  currentAddress: string | null
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { isConnected, address, disconnect } = useWallet()
  const [userRole, setUserRoleState] = useState<UserRole>(null)
  const router = useRouter()

  const smartContractAddress = "AS1YGnZa9trz13AdDyZx2Gj49xmt4UgKzwP3kZEn73rAPb2ar3NS"

  // Simple role setter - no localStorage persistence
  // The smart contract is the source of truth
  const setUserRole = useCallback((role: UserRole) => {
    console.log("UserContext: Setting role to:", role)
    setUserRoleState(role)
  }, [])

  const logout = useCallback(() => {
    disconnect()
    setUserRole(null)
    router.push("/") // Redirect to landing page or auth page
  }, [disconnect, setUserRole, router])

  // Clear role when wallet disconnects
  useEffect(() => {
    if (!isConnected && userRole) {
      console.log("UserContext: Clearing role due to wallet disconnect")
      setUserRole(null)
      // Only redirect if we're currently on a dashboard page
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard")) {
        router.push("/auth")
      }
    }
  }, [isConnected, userRole, setUserRole, router])

  const isAuthenticated = isConnected && userRole !== null

  const value = {
    userRole,
    setUserRole,
    isAuthenticated,
    currentAddress: address,
    logout,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
