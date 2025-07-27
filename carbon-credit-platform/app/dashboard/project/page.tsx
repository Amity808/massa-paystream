// app/dashboard/project/page.tsx
"use client"

import { useEffect, useState } from "react"
import DashboardWidget from "@/components/dashboard/dashboard-widget"
import ProjectCard from "@/components/dashboard/project-card"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"
import { Loader2, Leaf, DollarSign, BarChart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Project } from "@/lib/types"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ProjectOwnerDashboardData {
  totalProjects: number
  totalCreditsMinted: number
  revenueGenerated: number
  recentProjects: Project[]
  creditPerformance: { month: string; value: number }[]
}

export default function ProjectOwnerDashboardPage() {
  const { getMyProjectDashboard, loading, error } = useContract()
  const { currentAddress } = useUser()
  const [dashboardData, setDashboardData] = useState<ProjectOwnerDashboardData | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (currentAddress) {
        const data = await getMyProjectDashboard(currentAddress)
        if (data) {
          setDashboardData(data)
        }
      }
    }
    fetchDashboardData()
  }, [currentAddress, getMyProjectDashboard])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading project owner dashboard...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-error text-center py-8">Error: {error}</div>
  }

  if (!dashboardData) {
    return (
      <div className="text-muted-foreground text-center py-8">
        No dashboard data available. Connect your wallet and ensure you are registered as a Project Owner.
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardWidget
          title="Total Projects"
          value={dashboardData.totalProjects}
          description="Number of projects managed"
          icon={Leaf}
          iconColor="text-green-500"
        />
        <DashboardWidget
          title="Credits Minted"
          value={`${dashboardData.totalCreditsMinted} tons`}
          description="Total CO2e credits minted"
          icon={BarChart}
          iconColor="text-blue-500"
        />
        <DashboardWidget
          title="Revenue Generated"
          value={`$${dashboardData.revenueGenerated.toFixed(2)}`}
          description="Estimated earnings from credit sales"
          icon={DollarSign}
          iconColor="text-orange-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credit Minting Performance (USD)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.creditPerformance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="month" className="text-sm text-gray-600 dark:text-gray-400" />
                <YAxis className="text-sm text-gray-600 dark:text-gray-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.recentProjects.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">No recent projects found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} showActions={false} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
