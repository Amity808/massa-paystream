// app/dashboard/company/marketplace/page.tsx
"use client"

import CreditCard from "@/components/dashboard/credit-card"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"
import { useEffect, useState } from "react"
import type { CarbonCredit } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function CarbonMarketplacePage() {
  const { getAllAvailableCredits, purchaseCredits, loading, error } = useContract()
  const { currentAddress } = useUser()
  const [availableCredits, setAvailableCredits] = useState<CarbonCredit[]>([])
  const [filteredCredits, setFilteredCredits] = useState<CarbonCredit[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterVintage, setFilterVintage] = useState("")

  const fetchCredits = async () => {
    const credits = await getAllAvailableCredits()
    if (credits) {
      setAvailableCredits(credits)
      setFilteredCredits(credits)
    }
  }

  useEffect(() => {
    fetchCredits()
  }, [])

  useEffect(() => {
    let currentCredits = availableCredits

    if (searchTerm) {
      currentCredits = currentCredits.filter(
        (credit) =>
          credit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          credit.projectId.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterVintage) {
      currentCredits = currentCredits.filter((credit) => credit.vintageYear === Number.parseInt(filterVintage))
    }

    setFilteredCredits(currentCredits)
  }, [searchTerm, filterVintage, availableCredits])

  const handlePurchase = async (creditId: string) => {
    if (!currentAddress) {
      alert("Please connect your wallet to purchase credits.")
      return
    }
    const result = await purchaseCredits(creditId, currentAddress)
    if (result?.success) {
      alert("Credit purchased successfully!")
      fetchCredits() // Re-fetch to update status
    } else {
      alert(result?.message || "Failed to purchase credit.")
    }
  }

  const uniqueVintageYears = Array.from(new Set(availableCredits.map((c) => c.vintageYear))).sort((a, b) => b - a)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading marketplace...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-error text-center py-8">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Carbon Credit Marketplace</h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by project or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select value={filterVintage} onValueChange={setFilterVintage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Vintage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vintages</SelectItem>
            {uniqueVintageYears.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setSearchTerm("")
            setFilterVintage("")
          }}
        >
          Clear Filters
        </Button>
      </div>
      {filteredCredits.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No available carbon credits matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCredits.map((credit) => (
            <CreditCard key={credit.id} credit={credit} onPurchase={handlePurchase} showActions={true} />
          ))}
        </div>
      )}
    </div>
  )
}
