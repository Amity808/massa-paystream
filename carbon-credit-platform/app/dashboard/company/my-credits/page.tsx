// app/dashboard/company/my-credits/page.tsx
"use client"

import CreditCard from "@/components/dashboard/credit-card"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"
import { useEffect, useState } from "react"
import type { CarbonCredit } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function MyCreditsPage() {
  const { getMockData, retireCredits, transferCredits, loading, error } = useContract()
  const { currentAddress } = useUser()
  const [myCredits, setMyCredits] = useState<CarbonCredit[]>([])
  const [transferToAddress, setTransferToAddress] = useState("")

  const fetchMyCredits = async () => {
    if (currentAddress) {
      // In a real app, this would be a contract call like getMyOwnedCredits(currentAddress)
      // For mock, we filter all credits that are 'sold' and assume currentAddress is the buyer.
      const allCredits = getMockData.carbonCredits()
      const owned = allCredits.filter((c) => c.status === "sold" && c.projectId === currentAddress) // Simplified ownership
      setMyCredits(owned)
    }
  }

  useEffect(() => {
    fetchMyCredits()
  }, [currentAddress, getMockData])

  const handleRetire = async (creditId: string) => {
    if (!currentAddress) return
    const result = await retireCredits(creditId, currentAddress)
    if (result?.success) {
      alert("Credit retired successfully!")
      fetchMyCredits() // Re-fetch to update status
    } else {
      alert(result?.message || "Failed to retire credit.")
    }
  }

  const handleTransfer = async (creditId: string) => {
    if (!currentAddress || !transferToAddress) {
      alert("Please enter a recipient address.")
      return
    }
    const result = await transferCredits(creditId, currentAddress, transferToAddress)
    if (result?.success) {
      alert("Credit transferred successfully!")
      setTransferToAddress("")
      fetchMyCredits() // Re-fetch to update status
    } else {
      alert(result?.message || "Failed to transfer credit.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading your credits...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-error text-center py-8">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Carbon Credits</h2>
      {myCredits.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">You currently do not own any carbon credits.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {myCredits.map((credit) => (
            <Card key={credit.id} className="flex flex-col">
              <CreditCard credit={credit} showActions={false} />
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  <Button
                    onClick={() => handleRetire(credit.id)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    disabled={credit.status === "retired"}
                  >
                    {credit.status === "retired" ? "Already Retired" : "Retire Credits"}
                  </Button>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Recipient Address"
                      value={transferToAddress}
                      onChange={(e) => setTransferToAddress(e.target.value)}
                      className="flex-grow"
                    />
                    <Button
                      onClick={() => handleTransfer(credit.id)}
                      variant="outline"
                      disabled={credit.status === "retired"}
                    >
                      Transfer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
