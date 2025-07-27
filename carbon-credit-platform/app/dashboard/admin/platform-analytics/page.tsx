// app/dashboard/admin/platform-analytics/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useContract } from "@/hooks/use-contract"
import { Loader2 } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface PlatformAnalyticsData {
  userGrowth: { month: string; count: number }[]
  creditDistribution: { name: string; value: number }[]
  transactionVolume: { month: string; volume: number }[]
}

const COLORS = ["#22c55e", "#3b82f6", "#f97316", "#10b981", "#ef4444"] // Green, Blue, Orange, Success Green, Error Red

export default function PlatformAnalyticsPage() {
  const { getPlatformStats, loading, error } = useContract()
  const [analyticsData, setAnalyticsData] = useState<PlatformAnalyticsData | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      const stats = await getPlatformStats()
      if (stats) {
        // Mock detailed analytics data
        setAnalyticsData({
          userGrowth: [
            { month: "Jan", count: 100 },
            { month: "Feb", count: 120 },
            { month: "Mar", count: 150 },
            { month: "Apr", count: 180 },
            { month: "May", count: 220 },
            { month: "Jun", count: stats.totalCompanies + stats.totalProjects + stats.totalCreditsMinted }, // Dynamic based on mock data
          ],
          creditDistribution: [
            { name: "Available", value: stats.totalCreditsAvailable },
            { name: "Sold", value: stats.totalCreditsMinted - stats.totalCreditsAvailable - stats.totalCreditsRetired },
            { name: "Retired", value: stats.totalCreditsRetired },
          ],
          transactionVolume: [
            { month: "Jan", volume: 50000 },
            { month: "Feb", volume: 60000 },
            { month: "Mar", volume: 55000 },
            { month: "Apr", volume: 70000 },
            { month: "May", volume: 65000 },
            { month: "Jun", volume: 80000 },
          ],
        })
      }
    }
    fetchAnalytics()
  }, [getPlatformStats])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading platform analytics...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-error text-center py-8">Error: {error}</div>
  }

  if (!analyticsData) {
    return <div className="text-muted-foreground text-center py-8">No analytics data available.</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Platform Analytics</h2>

      <Card>
        <CardHeader>
          <CardTitle>User Growth Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.userGrowth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                  dataKey="count"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Credit Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.creditDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {analyticsData.creditDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Transaction Volume (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.transactionVolume} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    dataKey="volume"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
