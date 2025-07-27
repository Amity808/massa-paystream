// app/dashboard/company/page.tsx
"use client"

import { useEffect, useState } from "react"
import DashboardWidget from "@/components/dashboard/dashboard-widget"
import EmissionChart from "@/components/charts/emission-chart"
import ComplianceGauge from "@/components/charts/compliance-gauge"
import TransactionTable from "@/components/dashboard/transaction-table"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"
import { Loader2, Leaf, CreditCard, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EmissionRecord, Transaction } from "@/lib/types"
import ProtectedRoute from "@/components/protected-route"

interface CompanyDashboardData {
  totalEmissions: number
  complianceProgress: number
  ownedCreditsCount: number
  recentEmissions: EmissionRecord[]
  emissionsTrend: { month: string; value: number }[]
  emissionsByScope: { name: string; value: number }[]
}

export default function CompanyDashboardPage() {
  const { getCompanyDetails, isLoading } = useContract()
  const { currentAddress } = useUser()
  const [dashboardData, setDashboardData] = useState<CompanyDashboardData | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentAddress) return

      setError(null)

      try {
        // Get company details directly - this is more reliable
        console.log("Fetching company details for dashboard...")
        console.log("Current wallet address:", currentAddress)
        console.log("Expected registered address: AU1pucMsWWBjL6pKt4YTmRobWQJgZciHSNA6Hr5CrZcwTfm2RfzX")
        const companyDetails = await getCompanyDetails(currentAddress)

        console.log("Raw company details response:", companyDetails)
        console.log("Business name check:", companyDetails?.businessName, "Length:", companyDetails?.businessName?.length)

        if (companyDetails && companyDetails.businessName) {
          console.log("Company details retrieved:", companyDetails)

          // Clear any previous errors
          setError(null)

          const complianceProgress = companyDetails.complianceTarget && parseInt(companyDetails.complianceTarget) > 0
            ? Math.min((parseInt(companyDetails.totalCreditsRetired) / parseInt(companyDetails.complianceTarget)) * 100, 100)
            : 0

          setDashboardData({
            totalEmissions: parseInt(companyDetails.annualEmissions) || 0,
            complianceProgress: complianceProgress,
            ownedCreditsCount: 0, // Would need to fetch from credits
            recentEmissions: [], // Would need emissions tracking
            emissionsTrend: [
              { month: "Jan", value: 120 },
              { month: "Feb", value: 150 },
              { month: "Mar", value: 130 },
              { month: "Apr", value: 160 },
              { month: "May", value: 145 },
              { month: "Jun", value: 170 },
            ],
            emissionsByScope: [
              { name: "Scope 1", value: 40 },
              { name: "Scope 2", value: 30 },
              { name: "Scope 3", value: 30 },
            ],
          })

          console.log("Dashboard data set successfully")
        } else {
          setError("No company registration found. Please register your company first.")
          console.log("No company details found or invalid business name")
        }

        // Mock recent transactions for display
        setRecentTransactions([
          {
            id: "tx-001",
            type: "purchase",
            date: "2024-07-20",
            amount: 50,
            unit: "credits",
            from: "Marketplace",
            to: currentAddress,
            status: "completed",
          },
          {
            id: "tx-002",
            type: "retirement",
            date: "2024-07-15",
            amount: 20,
            unit: "credits",
            from: currentAddress,
            to: "Retired Pool",
            status: "completed",
          },
        ])
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data")
      }
    }

    fetchDashboardData()
  }, [currentAddress, getCompanyDetails])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading company dashboard...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-error text-center py-8">Error: {error}</div>
  }

  if (!dashboardData) {
    return (
      <div className="text-muted-foreground text-center py-8">
        No dashboard data available. Connect your wallet and ensure you are registered as a Company.
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRole={["company"]}>
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardWidget
            title="Total Emissions (YTD)"
            value={`${dashboardData.totalEmissions.toFixed(2)} tons`}
            description="Total CO2e recorded this year"
            icon={Leaf}
            iconColor="text-green-500"
          />
          <DashboardWidget
            title="Owned Carbon Credits"
            value={`${dashboardData.ownedCreditsCount}`}
            description="Credits available for offsetting"
            icon={CreditCard}
            iconColor="text-blue-500"
          />
          <DashboardWidget
            title="Compliance Progress"
            value={`${dashboardData.complianceProgress}%`}
            description="Towards your annual target"
            icon={CheckCircle}
            iconColor="text-orange-500"
          />
        </div>

        <EmissionChart trendData={dashboardData.emissionsTrend} scopeData={dashboardData.emissionsByScope} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComplianceGauge progress={dashboardData.complianceProgress} />
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTable transactions={recentTransactions} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Emission Records</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable
              transactions={dashboardData.recentEmissions.map((rec) => ({
                id: rec.id,
                type: "emission record",
                date: rec.date,
                amount: rec.total,
                unit: "tons CO2e",
                from: "Your Company",
                to: "Platform",
                status: rec.verified ? "completed" : "pending",
                details: `Scope 1: ${rec.scope1}, Scope 2: ${rec.scope2}, Scope 3: ${rec.scope3}`,
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
