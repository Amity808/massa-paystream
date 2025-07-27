// app/dashboard/overview/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/contexts/user-context"
import { useContract } from "@/hooks/use-contract"
import DashboardWidget from "@/components/dashboard/dashboard-widget"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, Users, Leaf, Package, DollarSign, Activity } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

export default function DashboardOverviewPage() {
  const { userRole, currentAddress } = useUser()
  const { getPlatformStats, getMyCompanyDashboard, getMyProjectDashboard, loading, error } = useContract()
  const [overviewData, setOverviewData] = useState<any>(null)

  useEffect(() => {
    const fetchOverviewData = async () => {
      if (!currentAddress) return

      const data: any = {}

      // Get platform-wide stats for all users
      const platformStats = await getPlatformStats()
      if (platformStats) {
        data.platformStats = platformStats
      }

      // Get role-specific data
      if (userRole === "Company") {
        const companyData = await getMyCompanyDashboard(currentAddress)
        if (companyData) {
          data.roleSpecific = companyData
        }
      } else if (userRole === "Project Owner") {
        const projectData = await getMyProjectDashboard(currentAddress)
        if (projectData) {
          data.roleSpecific = projectData
        }
      }

      // Mock market trends data
      data.marketTrends = [
        { month: "Jan", price: 22.5 },
        { month: "Feb", price: 24.0 },
        { month: "Mar", price: 23.5 },
        { month: "Apr", price: 26.0 },
        { month: "May", price: 25.5 },
        { month: "Jun", price: 28.0 },
      ]

      // Mock activity data
      data.activityData = [
        { category: "Credits Purchased", count: 150 },
        { category: "Credits Retired", count: 120 },
        { category: "Projects Verified", count: 25 },
        { category: "Emissions Recorded", count: 80 },
      ]

      setOverviewData(data)
    }

    fetchOverviewData()
  }, [currentAddress, userRole, getPlatformStats, getMyCompanyDashboard, getMyProjectDashboard])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading dashboard overview...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-error text-center py-8">Error: {error}</div>
  }

  if (!overviewData) {
    return <div className="text-muted-foreground text-center py-8">No overview data available.</div>
  }

  const renderRoleSpecificWidgets = () => {
    if (userRole === "Company" && overviewData.roleSpecific) {
      return (
        <>
          <DashboardWidget
            title="Your Total Emissions"
            value={`${overviewData.roleSpecific.totalEmissions.toFixed(2)} tons`}
            description="CO2e recorded this year"
            icon={Leaf}
            iconColor="text-red-500"
          />
          <DashboardWidget
            title="Compliance Progress"
            value={`${overviewData.roleSpecific.complianceProgress}%`}
            description="Towards your annual target"
            icon={TrendingUp}
            iconColor="text-green-500"
          />
        </>
      )
    }

    if (userRole === "Project Owner" && overviewData.roleSpecific) {
      return (
        <>
          <DashboardWidget
            title="Your Projects"
            value={overviewData.roleSpecific.totalProjects}
            description="Active carbon projects"
            icon={Leaf}
            iconColor="text-green-500"
          />
          <DashboardWidget
            title="Revenue Generated"
            value={`$${overviewData.roleSpecific.revenueGenerated.toFixed(2)}`}
            description="From credit sales"
            icon={DollarSign}
            iconColor="text-orange-500"
          />
        </>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <div className="text-sm text-muted-foreground">Welcome back, {userRole}!</div>
      </div>

      {/* Platform-wide metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardWidget
          title="Total Companies"
          value={overviewData.platformStats?.totalCompanies || 0}
          description="Registered on platform"
          icon={Users}
          iconColor="text-blue-500"
        />
        <DashboardWidget
          title="Active Projects"
          value={overviewData.platformStats?.totalProjects || 0}
          description="Carbon offset projects"
          icon={Activity}
          iconColor="text-green-500"
        />
        <DashboardWidget
          title="Credits Available"
          value={`${overviewData.platformStats?.totalCreditsAvailable || 0} tons`}
          description="Ready for purchase"
          icon={Package}
          iconColor="text-orange-500"
        />
        <DashboardWidget
          title="Credits Retired"
          value={`${overviewData.platformStats?.totalCreditsRetired || 0} tons`}
          description="CO2e offset achieved"
          icon={Leaf}
          iconColor="text-green-600"
        />
      </div>

      {/* Role-specific widgets */}
      {renderRoleSpecificWidgets() && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{renderRoleSpecificWidgets()}</div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Carbon Credit Market Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overviewData.marketTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    dataKey="price"
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
            <CardTitle>Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewData.activityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="category" className="text-sm text-gray-600 dark:text-gray-400" />
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
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overviewData.platformStats?.recentActivity?.map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-green-500" />
                  <span className="text-sm">{activity.description}</span>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</span>
              </div>
            )) || <div className="text-center text-muted-foreground py-4">No recent activity available.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
