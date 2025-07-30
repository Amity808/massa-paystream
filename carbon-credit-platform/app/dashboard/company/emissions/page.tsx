// app/dashboard/company/emissions/page.tsx
"use client"

import { useState, useEffect } from "react"
import EmissionsTrackingForm from "@/components/forms/emissions-tracking-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"
import { Loader2, Plus, FileText, TrendingUp } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import type { EmissionRecord } from "@/lib/types"

interface EmissionsData {
  totalEmissions: number
  scope1Emissions: number
  scope2Emissions: number
  scope3Emissions: number
  recentRecords: EmissionRecord[]
}

export default function EmissionsTrackingPage() {
  const { currentAddress } = useUser()
  const { getEmissionRecord, isLoading } = useContract()
  const [emissionsData, setEmissionsData] = useState<EmissionsData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmissionsData = async () => {
      if (!currentAddress) return

      setError(null)
      try {
        // For now, we'll use mock data since we need to implement emission record listing
        // In a real implementation, we'd fetch all emission records for the company
        setEmissionsData({
          totalEmissions: 1250,
          scope1Emissions: 450,
          scope2Emissions: 600,
          scope3Emissions: 200,
          recentRecords: [
            {
              id: "1",
              companyId: currentAddress,
              date: "2024-01-15",
              scope1: 150,
              scope2: 200,
              scope3: 50,
              total: 400,
              verified: true,
              verifiedBy: "verifier1"
            },
            {
              id: "2",
              companyId: currentAddress,
              date: "2024-01-10",
              scope1: 120,
              scope2: 180,
              scope3: 40,
              total: 340,
              verified: false,
              verifiedBy: null
            }
          ]
        })
      } catch (err) {
        console.error("Error fetching emissions data:", err)
        setError("Failed to load emissions data")
      }
    }

    fetchEmissionsData()
  }, [currentAddress])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading emissions data...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">Error: {error}</div>
  }

  return (
    <ProtectedRoute requiredRole={["company"]}>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Emissions Tracking</h2>
            <p className="text-muted-foreground">Monitor and record your company's carbon emissions</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Record Emissions
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Record New Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <EmissionsTrackingForm />
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="mt-4"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        )}

        {emissionsData && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="records">Emission Records</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{emissionsData.totalEmissions.toLocaleString()} tons</div>
                    <p className="text-xs text-muted-foreground">CO2e this year</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Scope 1</CardTitle>
                    <FileText className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{emissionsData.scope1Emissions.toLocaleString()} tons</div>
                    <p className="text-xs text-muted-foreground">Direct emissions</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Scope 2</CardTitle>
                    <FileText className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{emissionsData.scope2Emissions.toLocaleString()} tons</div>
                    <p className="text-xs text-muted-foreground">Indirect emissions</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Scope 3</CardTitle>
                    <FileText className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{emissionsData.scope3Emissions.toLocaleString()} tons</div>
                    <p className="text-xs text-muted-foreground">Other indirect</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Emissions Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Scope 1 (Direct)</span>
                        <span>{emissionsData.scope1Emissions} tons</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(emissionsData.scope1Emissions / emissionsData.totalEmissions) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Scope 2 (Indirect)</span>
                        <span>{emissionsData.scope2Emissions} tons</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${(emissionsData.scope2Emissions / emissionsData.totalEmissions) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Scope 3 (Other)</span>
                        <span>{emissionsData.scope3Emissions} tons</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${(emissionsData.scope3Emissions / emissionsData.totalEmissions) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="records" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Emission Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {emissionsData.recentRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{record.date}</p>
                          <p className="text-sm text-muted-foreground">
                            Total: {record.total} tons CO2e
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Scope 1: {record.scope1} | Scope 2: {record.scope2} | Scope 3: {record.scope3}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs ${record.verified
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                            {record.verified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Emissions Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Detailed analytics and reporting features will be implemented here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ProtectedRoute>
  )
}
