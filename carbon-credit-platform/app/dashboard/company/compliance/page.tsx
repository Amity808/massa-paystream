// app/dashboard/company/compliance/page.tsx
"use client"

import Image from "next/image"
import ComplianceGauge from "@/components/charts/compliance-gauge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"
import { useEffect, useState } from "react"
import { FileText, Loader2 } from "lucide-react"

export default function ComplianceCenterPage() {
  const { getMyCompanyDashboard, setComplianceTarget, generateOffsetCertificate, loading, error } = useContract()
  const { currentAddress } = useUser()
  const [complianceProgress, setComplianceProgress] = useState<number>(0)
  const [targetInput, setTargetInput] = useState<string>("")
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null)
  const [targetSetSuccess, setTargetSetSuccess] = useState<string | null>(null)
  const [certificateGenSuccess, setCertificateGenSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchComplianceData = async () => {
      if (currentAddress) {
        const data = await getMyCompanyDashboard(currentAddress)
        if (data) {
          setComplianceProgress(data.complianceProgress)
        }
      }
    }
    fetchComplianceData()
  }, [currentAddress, getMyCompanyDashboard])

  const handleSetTarget = async () => {
    if (!currentAddress || !targetInput) {
      alert("Please enter a target value.")
      return
    }
    const target = Number.parseFloat(targetInput)
    if (isNaN(target) || target < 0) {
      alert("Please enter a valid non-negative number for the target.")
      return
    }

    setTargetSetSuccess(null)
    const result = await setComplianceTarget(currentAddress, target)
    if (result?.success) {
      setTargetSetSuccess(`Compliance target set to ${target} tons CO2e.`)
      // In a real app, this would trigger a re-fetch of dashboard data to update gauge
      setComplianceProgress(Math.min(100, Math.max(0, Math.floor(Math.random() * 100)))) // Simulate new progress
    } else {
      alert(result?.message || "Failed to set compliance target.")
    }
  }

  const handleGenerateCertificate = async () => {
    if (!currentAddress) {
      alert("Wallet not connected.")
      return
    }
    setCertificateGenSuccess(null)
    // For mock, assume some retired credits
    const mockRetiredCredits = ["cc-002", "cc-003"] // Example IDs of retired credits
    const result = await generateOffsetCertificate(currentAddress, mockRetiredCredits)
    if (result?.success && result.certificateUrl) {
      setCertificateUrl(result.certificateUrl)
      setCertificateGenSuccess("Certificate generated successfully!")
    } else {
      alert(result?.message || "Failed to generate certificate. Ensure you have retired credits.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading compliance data...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-error text-center py-8">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Compliance Center</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ComplianceGauge progress={complianceProgress} />
        <Card>
          <CardHeader>
            <CardTitle>Set Compliance Target</CardTitle>
            <CardDescription>Define your annual carbon emission reduction target.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="target">Annual Target (Tons CO2e)</Label>
              <Input
                id="target"
                type="number"
                step="0.01"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder="e.g., 1000"
              />
            </div>
            {targetSetSuccess && <p className="text-success text-sm">{targetSetSuccess}</p>}
            <Button onClick={handleSetTarget} className="w-full bg-green-500 hover:bg-green-600 text-white">
              Set Target
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Offset Certificate</CardTitle>
          <CardDescription>
            Generate a certificate for your retired carbon credits to demonstrate your offsetting efforts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {certificateUrl ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-success text-sm">{certificateGenSuccess}</p>
              <a
                href={certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-2"
              >
                <FileText className="h-5 w-5" /> View Your Certificate
              </a>
              <Image
                src={certificateUrl || "/placeholder.svg"}
                alt="Carbon Offset Certificate"
                width={300}
                height={200}
                className="rounded-md border"
              />
            </div>
          ) : (
            <Button onClick={handleGenerateCertificate} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              Generate Certificate
            </Button>
          )}
          {error && <p className="text-error text-sm">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
