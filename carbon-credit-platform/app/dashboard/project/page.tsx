// app/dashboard/project/page.tsx
"use client"

import { useEffect, useState } from "react"
import DashboardWidget from "@/components/dashboard/dashboard-widget"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"
import { Loader2, TreePine, TrendingUp, DollarSign, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ProtectedRoute from "@/components/protected-route"

interface ProjectDashboardData {
  totalProjects: number
  totalCreditsIssued: number
  totalRevenue: number
  activeCredits: number
  verifiedProjects: number
}

export default function ProjectDashboardPage() {
  const { getProjectDetails, isLoading } = useContract()
  const { currentAddress } = useUser()
  const [dashboardData, setDashboardData] = useState<ProjectDashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentAddress) return

      setError(null)
      try {
        // For now, we'll use mock data since we need to implement project listing
        // In a real implementation, we'd fetch all projects owned by currentAddress
        setDashboardData({
          totalProjects: 2, // Mock data
          totalCreditsIssued: 1500,
          totalRevenue: 45000,
          activeCredits: 800,
          verifiedProjects: 1,
        })
      } catch (err) {
        console.error("Error fetching project dashboard data:", err)
        setError("Failed to load dashboard data")
      }
    }

    fetchDashboardData()
  }, [currentAddress])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading project dashboard...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">Error: {error}</div>
  }

  if (!dashboardData) {
    return (
      <div className="text-muted-foreground text-center py-8">
        No dashboard data available. Ensure you are registered as a Project Owner.
      </div>
    )
  }

  return (
    <ProtectedRoute requiredRole={["project"]}>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Project Owner Dashboard</h2>
          <div className="text-sm text-muted-foreground">Manage your carbon offset projects</div>
        </div>

        {/* Project Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardWidget
            title="Total Projects"
            value={`${dashboardData.totalProjects}`}
            description="Your carbon offset projects"
            icon={TreePine}
            iconColor="text-green-500"
          />
          <DashboardWidget
            title="Credits Issued"
            value={`${dashboardData.totalCreditsIssued.toLocaleString()} tons`}
            description="Total credits minted"
            icon={TrendingUp}
            iconColor="text-blue-500"
          />
          <DashboardWidget
            title="Total Revenue"
            value={`$${dashboardData.totalRevenue.toLocaleString()}`}
            description="Earnings from credit sales"
            icon={DollarSign}
            iconColor="text-green-600"
          />
          <DashboardWidget
            title="Active Credits"
            value={`${dashboardData.activeCredits.toLocaleString()} tons`}
            description="Credits available for sale"
            icon={Target}
            iconColor="text-orange-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Register New Project</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create a new carbon offset project to start generating credits.
              </p>
              <Button className="w-full" onClick={() => window.location.href = "/dashboard/project/management"}>
                Create Project
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mint Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Mint carbon credits from your verified projects.
              </p>
              <Button className="w-full" onClick={() => window.location.href = "/dashboard/project/minting"}>
                Mint Credits
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">View Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Analyze your project performance and revenue.
              </p>
              <Button className="w-full" onClick={() => window.location.href = "/dashboard/project/analytics"}>
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Project Status */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Verification Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Verified Projects</span>
                    <span className="text-green-500">{dashboardData.verifiedProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Verification</span>
                    <span className="text-orange-500">{dashboardData.totalProjects - dashboardData.verifiedProjects}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Credit Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Available for Sale</span>
                    <span className="text-blue-500">{dashboardData.activeCredits} tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Issued</span>
                    <span className="text-green-500">{dashboardData.totalCreditsIssued} tons</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div>
                  <p className="font-medium">Credits Minted</p>
                  <p className="text-sm text-muted-foreground">200 tons from Reforestation Project</p>
                </div>
                <span className="text-green-500">+200 tons</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div>
                  <p className="font-medium">Credits Sold</p>
                  <p className="text-sm text-muted-foreground">150 tons to TechCorp Inc.</p>
                </div>
                <span className="text-blue-500">+$15,000</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div>
                  <p className="font-medium">Project Verified</p>
                  <p className="text-sm text-muted-foreground">Solar Farm Project approved</p>
                </div>
                <span className="text-orange-500">✓ Verified</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
