// app/dashboard/verifier/queue/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"
import { Loader2, CheckCircle } from "lucide-react"
import type { EmissionRecord, Project } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

export default function VerificationQueuePage() {
  const { getMockData, verifyEmissionRecord, verifyProject, loading, error } = useContract()
  const { currentAddress } = useUser()
  const [pendingEmissions, setPendingEmissions] = useState<EmissionRecord[]>([])
  const [pendingProjects, setPendingProjects] = useState<Project[]>([])

  const fetchQueue = () => {
    const allEmissionRecords = getMockData.emissionRecords()
    const allProjects = getMockData.projects()

    setPendingEmissions(allEmissionRecords.filter((rec) => !rec.verified))
    setPendingProjects(allProjects.filter((proj) => proj.status === "pending"))
  }

  useEffect(() => {
    fetchQueue()
  }, [getMockData])

  const handleVerifyEmission = async (recordId: string) => {
    if (!currentAddress) {
      alert("Wallet not connected.")
      return
    }
    const result = await verifyEmissionRecord(recordId, currentAddress)
    if (result?.success) {
      alert("Emission record verified!")
      fetchQueue() // Re-fetch to update queue
    } else {
      alert(result?.message || "Failed to verify emission record.")
    }
  }

  const handleVerifyProject = async (projectId: string) => {
    if (!currentAddress) {
      alert("Wallet not connected.")
      return
    }
    const result = await verifyProject(projectId, currentAddress)
    if (result?.success) {
      alert("Project verified!")
      fetchQueue() // Re-fetch to update queue
    } else {
      alert(result?.message || "Failed to verify project.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading verification queue...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-error text-center py-8">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Verification Queue</h2>

      <Card>
        <CardHeader>
          <CardTitle>Pending Emission Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Company ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Emissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingEmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No pending emission records.
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingEmissions.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.id}</TableCell>
                      <TableCell className="truncate max-w-[100px]">{record.companyId}</TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.total.toFixed(2)} tons CO2e</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-orange-500 text-white">
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleVerifyEmission(record.id)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" /> Verify
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project ID</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Owner ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No pending projects.
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.id}</TableCell>
                      <TableCell>{project.name}</TableCell>
                      <TableCell className="truncate max-w-[100px]">{project.ownerId}</TableCell>
                      <TableCell>{project.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-orange-500 text-white">
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleVerifyProject(project.id)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" /> Verify
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
