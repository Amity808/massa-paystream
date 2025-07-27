// app/dashboard/verifier/page.tsx
"use client"

import { useEffect, useState } from "react"
import DashboardWidget from "@/components/dashboard/dashboard-widget"
import TransactionTable from "@/components/dashboard/transaction-table"
import { useContract } from "@/hooks/use-contract"
import { Loader2, ShieldCheck, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EmissionRecord, Project, Transaction } from "@/lib/types"

interface VerifierDashboardData {
  pendingEmissions: EmissionRecord[]
  pendingProjects: Project[]
}

export default function VerifierDashboardPage() {
  const { getMockData, loading, error } = useContract()
  const [dashboardData, setDashboardData] = useState<VerifierDashboardData | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      // In a real app, this would be a contract call to get pending items for the verifier
      const allEmissionRecords = getMockData.emissionRecords()
      const allProjects = getMockData.projects()

      setDashboardData({
        pendingEmissions: allEmissionRecords.filter((rec) => !rec.verified),
        pendingProjects: allProjects.filter((proj) => proj.status === "pending"),
      })
    }
    fetchDashboardData()
  }, [getMockData])

  const pendingEmissionsAsTransactions: Transaction[] =
    dashboardData?.pendingEmissions.map((rec) => ({
      id: rec.id,
      type: "emission verification",
      date: rec.date,
      amount: rec.total,
      unit: "tons CO2e",
      from: rec.companyId,
      to: "Verifier",
      status: "pending",
      details: `Scope 1: ${rec.scope1}, Scope 2: ${rec.scope2}, Scope 3: ${rec.scope3}`,
    })) || []

  const pendingProjectsAsTransactions: Transaction[] =
    dashboardData?.pendingProjects.map((proj) => ({
      id: proj.id,
      type: "project verification",
      date: new Date().toISOString().split("T")[0], // Mock date
      amount: 0, // Not applicable
      unit: "", // Not applicable
      from: proj.ownerId,
      to: "Verifier",
      status: "pending",
      details: `Project: ${proj.name}, Location: ${proj.location}`,
    })) || []

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading verifier dashboard...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-error text-center py-8">Error: {error}</div>
  }

  if (!dashboardData) {
    return (
      <div className="text-muted-foreground text-center py-8">
        No dashboard data available. Ensure you are registered as a Verifier.
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">Verifier Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardWidget
          title="Pending Emission Reviews"
          value={dashboardData.pendingEmissions.length}
          description="Emissions awaiting your verification"
          icon={FileText}
          iconColor="text-orange-500"
        />
        <DashboardWidget
          title="Pending Project Reviews"
          value={dashboardData.pendingProjects.length}
          description="Projects awaiting your approval"
          icon={ShieldCheck}
          iconColor="text-blue-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Emission Verification Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTable transactions={pendingEmissionsAsTransactions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Project Verification Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTable transactions={pendingProjectsAsTransactions} />
        </CardContent>
      </Card>
    </div>
  )
}
