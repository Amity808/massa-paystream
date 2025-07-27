// app/(auth)/role-selector.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import WalletConnect from "@/components/wallet-connect"
import { RoleRegistration } from "@/components/role-registration"

export default function RoleSelector() {
  const { isConnected, address } = useWallet()
  const { userRole, setUserRole } = useUser()
  const router = useRouter()

  // Handle navigation after role is set
  useEffect(() => {
    if (userRole) {
      console.log("Role detected, navigating to dashboard:", userRole)
      router.push("/dashboard")
    }
  }, [userRole, router])

  const handleRegistrationComplete = () => {
    router.push("/dashboard")
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Welcome to Carbon Credit Platform</CardTitle>
            <CardDescription>
              Connect with the deployed smart contract and register your role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WalletConnect />
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Connected Address:</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {address || "Not connected"}
              </code>
            </div>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h3 className="font-semibold mb-2">Smart Contract Integration</h3>
              <p className="text-sm text-muted-foreground">
                This platform is integrated with the deployed carbon credit smart contract on Massa blockchain.
                Register your role to start interacting with the platform.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Get Started - Choose Your Role</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="text-sm text-muted-foreground">
              Connected: <code className="text-xs">{address}</code>
            </div>
            <WalletConnect />
          </div>
        </div>

        <RoleRegistration onComplete={handleRegistrationComplete} />
      </div>
    </div>
  )
}
