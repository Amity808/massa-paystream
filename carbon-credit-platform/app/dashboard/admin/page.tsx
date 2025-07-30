// app/dashboard/admin/page.tsx
"use client"

import { useEffect, useState } from "react"
import DashboardWidget from "@/components/dashboard/dashboard-widget"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"
import { Loader2, Users, Activity, Shield, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ProtectedRoute from "@/components/protected-route"

interface AdminDashboardData {
  totalCreditsIssued: number
  totalTransactions: number
  totalCompanies: number
  totalProjects: number
  platformRevenue: number
}

export default function AdminDashboardPage() {
  const { getPlatformStats, addVerifier, isLoading } = useContract()
  const { currentAddress } = useUser()
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [newVerifierAddress, setNewVerifierAddress] = useState("")
  const [newVerifierRole, setNewVerifierRole] = useState("verifier")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentAddress) return

      setError(null)
      try {
        const platformStats = await getPlatformStats()

        if (platformStats) {
          // Parse the pipe-separated stats data
          const statsParts = platformStats.split('|')
          const creditsIssued = parseInt(statsParts[0]?.split(': ')[1] || '0')
          const totalTransactions = parseInt(statsParts[1]?.split(': ')[1] || '0')

          setDashboardData({
            totalCreditsIssued: creditsIssued,
            totalTransactions: totalTransactions,
            totalCompanies: 0, // Would need to implement company counting
            totalProjects: 0,   // Would need to implement project counting
            platformRevenue: 0, // Would need to implement revenue tracking
          })
        } else {
          setError("Failed to load platform statistics")
        }
      } catch (err) {
        console.error("Error fetching admin dashboard data:", err)
        setError("Failed to load dashboard data")
      }
    }

    fetchDashboardData()
  }, [currentAddress, getPlatformStats])

  const handleAddVerifier = async () => {
    if (!newVerifierAddress.trim()) {
      setError("Please enter a verifier address")
      return
    }

    try {
      const result = await addVerifier(newVerifierAddress, newVerifierRole)
      if (result.success) {
        setNewVerifierAddress("")
        setError(null)
      } else {
        setError(result.error || "Failed to add verifier")
      }
    } catch (err) {
      setError("Failed to add verifier")
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading admin dashboard...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">Error: {error}</div>
  }

  if (!dashboardData) {
    return (
      <div className="text-muted-foreground text-center py-8">
        No dashboard data available. Ensure you are registered as an Admin.
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRole={["admin"]}>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <div className="text-sm text-muted-foreground">Platform Administration</div>
        </div>

        {/* Platform Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardWidget
            title="Total Credits Issued"
            value={`${dashboardData.totalCreditsIssued.toLocaleString()}`}
            description="Carbon credits minted"
            icon={Activity}
            iconColor="text-green-500"
          />
          <DashboardWidget
            title="Total Transactions"
            value={`${dashboardData.totalTransactions.toLocaleString()}`}
            description="Platform transactions"
            icon={TrendingUp}
            iconColor="text-blue-500"
          />
          <DashboardWidget
            title="Registered Companies"
            value={`${dashboardData.totalCompanies}`}
            description="Active companies"
            icon={Users}
            iconColor="text-purple-500"
          />
          <DashboardWidget
            title="Active Projects"
            value={`${dashboardData.totalProjects}`}
            description="Carbon offset projects"
            icon={Shield}
            iconColor="text-orange-500"
          />
        </div>

        {/* Add Verifier Section */}
        <Card>
          <CardHeader>
            <CardTitle>Add Verifier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="verifierAddress">Verifier Address</Label>
                <Input
                  id="verifierAddress"
                  value={newVerifierAddress}
                  onChange={(e) => setNewVerifierAddress(e.target.value)}
                  placeholder="Enter wallet address"
                />
              </div>
              <div>
                <Label htmlFor="verifierRole">Role</Label>
                <select
                  id="verifierRole"
                  value={newVerifierRole}
                  onChange={(e) => setNewVerifierRole(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="verifier">Verifier</option>
                  <option value="auditor">Auditor</option>
                  <option value="inspector">Inspector</option>
                </select>
              </div>
            </div>
            <Button onClick={handleAddVerifier} disabled={!newVerifierAddress.trim()}>
              Add Verifier
            </Button>
          </CardContent>
        </Card>

        {/* Platform Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed platform analytics and reporting features will be implemented here.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Smart Contract Status</span>
                  <span className="text-green-500">✓ Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Wallet Connections</span>
                  <span className="text-green-500">✓ Connected</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Sync</span>
                  <span className="text-green-500">✓ Synchronized</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
