// app/marketplace/page.tsx
"use client"

import { useEffect, useState } from "react"
import CreditCard from "@/components/dashboard/credit-card"
import { useContract } from "@/hooks/use-contract"
import type { CarbonCredit } from "@/lib/types"
import { Loader2, Leaf } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PublicMarketplacePage() {
  const { getAllAvailableCredits, loading, error } = useContract()
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

    if (filterVintage && filterVintage !== "all") {
      currentCredits = currentCredits.filter((credit) => credit.vintageYear === Number.parseInt(filterVintage))
    }

    setFilteredCredits(currentCredits)
  }, [searchTerm, filterVintage, availableCredits])

  const uniqueVintageYears = Array.from(new Set(availableCredits.map((c) => c.vintageYear))).sort((a, b) => b - a)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-60px)]">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading marketplace...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-error text-center py-8">Error: {error}</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between bg-white dark:bg-gray-900 shadow-sm">
        <Link href="/" className="flex items-center gap-2 font-bold text-green-500 text-lg">
          <Leaf className="h-6 w-6" />
          <span>CarbonCredit.io</span>
        </Link>
        <nav className="hidden md:flex gap-4 sm:gap-6">
          <Link
            href="/#features"
            className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 dark:text-gray-300"
          >
            Features
          </Link>
          <Link
            href="/#stats"
            className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 dark:text-gray-300"
          >
            Statistics
          </Link>
          <Link href="/marketplace" className="text-sm font-medium hover:underline underline-offset-4 text-green-500">
            Marketplace
          </Link>
          <Link
            href="/dashboard/company"
            className="text-sm font-medium hover:underline underline-offset-4 text-gray-700 dark:text-gray-300"
          >
            Dashboard
          </Link>
        </nav>
        <Link href="/(auth)">
          <Button className="bg-green-500 hover:bg-green-600 text-white">Connect Wallet</Button>
        </Link>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:px-6 md:py-12">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Public Carbon Credit Marketplace</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Browse available carbon credits from verified projects worldwide. Connect your wallet and register as a
          company to purchase.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
              setFilterVintage("all")
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
              <CreditCard key={credit.id} credit={credit} showActions={false} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        <p className="text-xs">&copy; 2024 CarbonCredit.io. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
