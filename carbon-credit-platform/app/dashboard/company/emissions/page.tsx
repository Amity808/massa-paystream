// app/dashboard/company/emissions/page.tsx
"use client"

import EmissionsTrackingForm from "@/components/forms/emissions-tracking-form"
import TransactionTable from "@/components/dashboard/transaction-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import type { EmissionRecord, Transaction } from "@/lib/types"

export default function EmissionsTrackingPage() {
  const { getMockData, loading, error } = useContract()
  const { currentAddress } = useUser()
  const [emissionRecords, setEmissionRecords] = useState<EmissionRecord[]>([])

  useEffect(() => {
    if (currentAddress) {
      const allRecords = getMockData.emissionRecords()
      const companyRecords = allRecords.filter((rec) => rec.companyId === currentAddress)
      setEmissionRecords(companyRecords)
    }
  }, [currentAddress, getMockData])

  const emissionTransactions: Transaction[] = emissionRecords.map((rec) => ({
    id: rec.id,
    type: "emission record",
    date: rec.date,
    amount: rec.total,
    unit: "tons CO2e",
    from: "Your Company",
    to: "Platform",
    status: rec.verified ? "completed" : "pending",
    details: `Scope 1: ${rec.scope1}, Scope 2: ${rec.scope2}, Scope 3: ${rec.scope3}`,
  }))

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading emissions data...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-error text-center py-8">Error: {error}</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <EmissionsTrackingForm />
      <Card>
        <CardHeader>
          <CardTitle>Emission History</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTable transactions={emissionTransactions} />
        </CardContent>
      </Card>
    </div>
  )
}
