// app/dashboard/settings/profile/page.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import { useUser } from "@/contexts/user-context"
import { useContract } from "@/hooks/use-contract"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Building2, Calendar, Factory } from "lucide-react"

interface CompanyData {
  businessName: string
  registrationNumber: string
  industry: string
  annualEmissions: string
  isVerified: boolean
  registrationDate: string
  totalOffsetsRequired: string
  totalCreditsRetired: string
  complianceTarget: string
}

export default function UserProfilePage() {
  const { currentAddress, userRole } = useUser()
  const { getCompanyDetails, getProjectDetails, isLoading } = useContract()
  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const [projectData, setProjectData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchUserData = useCallback(async () => {
    if (!currentAddress) return

    setError(null)

    try {
      if (userRole === 'company') {
        console.log("Fetching company details for:", currentAddress)
        const company = await getCompanyDetails(currentAddress)
        if (company) {
          setCompanyData(company)
          console.log("Company data fetched:", company)
        } else {
          setError("Company registration not found. Please register your company first.")
        }
      } else if (userRole === 'project') {
        // For project owners, we'd need to fetch their projects
        // This would require a different approach since projects are identified by projectId, not owner address
        setError("Project data fetching not implemented yet.")
      }
    } catch (err) {
      console.error("Error fetching user data:", err)
      setError("Failed to fetch registration data.")
    }
  }, [currentAddress, userRole, getCompanyDetails, getProjectDetails])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading registration data...</p>
      </div>
    )
  }

  if (!currentAddress) {
    return (
      <div className="text-muted-foreground text-center py-8">Please connect your wallet to view your profile.</div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={fetchUserData}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Registration Details</h2>
        <p className="text-muted-foreground">Your registered information on the blockchain</p>
      </div>

      {/* Wallet Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Wallet Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
              <p className="font-mono text-sm bg-muted p-2 rounded">{currentAddress}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <div className="mt-1">
                <Badge variant="secondary">{userRole}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Registration Details */}
      {userRole === 'company' && companyData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="w-5 h-5" />
              Company Registration
              {companyData.isVerified && (
                <Badge className="bg-green-500">Verified</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Registered business information stored on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                <p className="text-lg font-medium">{companyData.businessName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                <p className="font-mono">{companyData.registrationNumber}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Industry</label>
                <p className="capitalize">{companyData.industry}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Annual Emissions</label>
                <p>{companyData.annualEmissions} tonnes CO2e</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Registration Date</label>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(parseInt(companyData.registrationDate) * 1000).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
                <div className="flex items-center gap-2">
                  {companyData.isVerified ? (
                    <Badge className="bg-green-500">Verified</Badge>
                  ) : (
                    <Badge variant="outline">Pending Verification</Badge>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Credits Retired</label>
                <p>{companyData.totalCreditsRetired} tonnes CO2e</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Compliance Target</label>
                <p>{companyData.complianceTarget} tonnes CO2e</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Registration would go here for project role */}
      {userRole === 'project' && (
        <Card>
          <CardHeader>
            <CardTitle>Project Registration</CardTitle>
            <CardDescription>Project owner functionality coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Project details fetching will be implemented next.</p>
          </CardContent>
        </Card>
      )}

      {!companyData && !projectData && userRole && (
        <Card>
          <CardHeader>
            <CardTitle>No Registration Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No registration found for your role. Please complete the registration process.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
