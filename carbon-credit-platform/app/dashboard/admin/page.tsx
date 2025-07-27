// app/dashboard/admin/page.tsx
"use client"

import { useEffect, useState } from "react"
import DashboardWidget from "@/components/dashboard/dashboard-widget"
import TransactionTable from "@/components/dashboard/transaction-table"
import { useContract } from "@/hooks/use-contract"
import { Loader2, Users, Leaf, Package, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Transaction } from "@/lib/types"

interface PlatformStats {
  totalCompanies: number
  totalProjects: number
  totalCreditsMinted: number
  totalCreditsAvailable: number
  totalCreditsRetired: number
  recentActivity: { id: string; description: string; date: string }[]
}

export default function AdminDashboardPage() {
  const { getPlatformStats, loading, error } = useContract()
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      const stats = await getPlatformStats()
      if (stats) {
        setPlatformStats(stats)
      }
    }
    fetchStats()
  }, [getPlatformStats])

  const recentActivityAsTransactions: Transaction[] =
    platformStats?.recentActivity.map((activity) => ({
      id: activity.id,
      type: "activity",
      date: activity.date,
      amount: 0, // Not applicable for general activity
      unit: "", // Not applicable
      from: "Platform",
      to: "N/A",
      status: "completed",
      details: activity.description,
    })) || []

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading admin dashboard...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-error text-center py-8">Error: {error}</div>
  }

  if (!platformStats) {
    return <div className="text-muted-foreground text-center py-8">No platform statistics available.</div>
  }

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">Platform Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <DashboardWidget
          title="Total Companies"
          value={platformStats.totalCompanies}
          description="Registered companies"
          icon={Users}
          iconColor="text-green-500"
        />
        <DashboardWidget
          title="Total Projects"
          value={platformStats.totalProjects}
          description="Registered carbon projects"
          icon={Leaf}
          iconColor="text-blue-500"
        />
        <DashboardWidget
          title="Credits Minted"
          value={`${platformStats.totalCreditsMinted} tons`}
          description="Total CO2e credits minted"
          icon={Package}
          iconColor="text-orange-500"
        />
        <DashboardWidget
          title="Credits Retired"
          value={`${platformStats.totalCreditsRetired} tons`}
          description="Total CO2e credits retired"
          icon={CheckCircle}
          iconColor="text-green-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTable transactions={recentActivityAsTransactions} />
        </CardContent>
      </Card>
    </div>
  )
}
