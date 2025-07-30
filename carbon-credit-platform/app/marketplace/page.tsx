// app/marketplace/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"
import { Loader2, Search, Filter, ShoppingCart, Leaf, DollarSign, Calendar } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CreditListing {
  id: string
  projectId: string
  projectName: string
  projectType: string
  location: string
  amount: number // tons CO2e
  pricePerTon: number
  vintageYear: number
  verificationStandard: string
  issuer: string
  status: "available" | "sold" | "retired"
  description: string
}

export default function MarketplacePage() {
  const { currentAddress, userRole } = useUser()
  const { purchaseCredits, getCreditDetails, isLoading } = useContract()
  const [credits, setCredits] = useState<CreditListing[]>([])
  const [filteredCredits, setFilteredCredits] = useState<CreditListing[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [selectedCredits, setSelectedCredits] = useState<string[]>([])
  const [isPurchasing, setIsPurchasing] = useState(false)

  useEffect(() => {
    const fetchCredits = async () => {
      // Mock data for now - in real implementation, fetch from smart contract
      const mockCredits: CreditListing[] = [
        {
          id: "1",
          projectId: "PROJ001",
          projectName: "Amazon Reforestation",
          projectType: "reforestation",
          location: "Brazil",
          amount: 500,
          pricePerTon: 25,
          vintageYear: 2023,
          verificationStandard: "VCS",
          issuer: "0x123...",
          status: "available",
          description: "Large-scale reforestation project in the Amazon rainforest"
        },
        {
          id: "2",
          projectId: "PROJ002",
          projectName: "Solar Farm Development",
          projectType: "renewable-energy",
          location: "India",
          amount: 300,
          pricePerTon: 30,
          vintageYear: 2023,
          verificationStandard: "Gold Standard",
          issuer: "0x456...",
          status: "available",
          description: "Solar energy project replacing coal-fired power plants"
        },
        {
          id: "3",
          projectId: "PROJ003",
          projectName: "Methane Capture",
          projectType: "methane-capture",
          location: "United States",
          amount: 200,
          pricePerTon: 35,
          vintageYear: 2022,
          verificationStandard: "VCS",
          issuer: "0x789...",
          status: "available",
          description: "Landfill methane capture and utilization project"
        }
      ]

      setCredits(mockCredits)
      setFilteredCredits(mockCredits)
    }

    fetchCredits()
  }, [])

  useEffect(() => {
    let filtered = credits.filter(credit => credit.status === "available")

    if (searchTerm) {
      filtered = filtered.filter(credit =>
        credit.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credit.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(credit => credit.projectType === selectedType)
    }

    if (selectedLocation !== "all") {
      filtered = filtered.filter(credit => credit.location === selectedLocation)
    }

    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number)
      filtered = filtered.filter(credit => {
        if (max) {
          return credit.pricePerTon >= min && credit.pricePerTon <= max
        }
        return credit.pricePerTon >= min
      })
    }

    setFilteredCredits(filtered)
  }, [credits, searchTerm, selectedType, selectedLocation, priceRange])

  const handleCreditSelection = (creditId: string) => {
    setSelectedCredits(prev =>
      prev.includes(creditId)
        ? prev.filter(id => id !== creditId)
        : [...prev, creditId]
    )
  }

  const handlePurchase = async () => {
    if (selectedCredits.length === 0) {
      toast({
        title: "No Credits Selected",
        description: "Please select credits to purchase",
        variant: "destructive",
      })
      return
    }

    if (!currentAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to purchase credits",
        variant: "destructive",
      })
      return
    }

    setIsPurchasing(true)
    try {
      const selectedCreditData = filteredCredits.filter(credit =>
        selectedCredits.includes(credit.id)
      )

      const totalPrice = selectedCreditData.reduce((sum, credit) =>
        sum + (credit.amount * credit.pricePerTon), 0
      )

      const result = await purchaseCredits(
        selectedCredits,
        totalPrice,
        "ESG compliance and carbon neutrality"
      )

      if (result.success) {
        toast({
          title: "Purchase Successful",
          description: `Successfully purchased ${selectedCredits.length} credit(s)`,
        })
        setSelectedCredits([])
        // Refresh credits list
      } else {
        toast({
          title: "Purchase Failed",
          description: result.error || "Failed to purchase credits",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "An error occurred during purchase",
        variant: "destructive",
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  const getProjectTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "reforestation": "Reforestation",
      "renewable-energy": "Renewable Energy",
      "energy-efficiency": "Energy Efficiency",
      "methane-capture": "Methane Capture",
      "soil-carbon": "Soil Carbon",
      "blue-carbon": "Blue Carbon",
      "biochar": "Biochar",
      "direct-air-capture": "Direct Air Capture"
    }
    return labels[type] || type
  }

  const getVerificationBadgeColor = (standard: string) => {
    const colors: Record<string, string> = {
      "VCS": "bg-green-100 text-green-800",
      "Gold Standard": "bg-yellow-100 text-yellow-800",
      "CCB": "bg-blue-100 text-blue-800"
    }
    return colors[standard] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carbon Credit Marketplace</h1>
          <p className="text-muted-foreground">Purchase verified carbon credits to offset your emissions</p>
        </div>
        {selectedCredits.length > 0 && (
          <Button onClick={handlePurchase} disabled={isPurchasing}>
            {isPurchasing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Purchasing...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Purchase {selectedCredits.length} Credit(s)
              </>
            )}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Project Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="reforestation">Reforestation</SelectItem>
                  <SelectItem value="renewable-energy">Renewable Energy</SelectItem>
                  <SelectItem value="energy-efficiency">Energy Efficiency</SelectItem>
                  <SelectItem value="methane-capture">Methane Capture</SelectItem>
                  <SelectItem value="soil-carbon">Soil Carbon</SelectItem>
                  <SelectItem value="blue-carbon">Blue Carbon</SelectItem>
                  <SelectItem value="biochar">Biochar</SelectItem>
                  <SelectItem value="direct-air-capture">Direct Air Capture</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Brazil">Brazil</SelectItem>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="Indonesia">Indonesia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Price Range</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="All prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-20">$0 - $20</SelectItem>
                  <SelectItem value="20-40">$20 - $40</SelectItem>
                  <SelectItem value="40-60">$40 - $60</SelectItem>
                  <SelectItem value="60-">$60+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCredits.map((credit) => (
          <Card
            key={credit.id}
            className={`cursor-pointer transition-all ${selectedCredits.includes(credit.id)
                ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950'
                : 'hover:shadow-lg'
              }`}
            onClick={() => handleCreditSelection(credit.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{credit.projectName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{credit.location}</p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedCredits.includes(credit.id)}
                  onChange={() => handleCreditSelection(credit.id)}
                  className="w-4 h-4 text-green-600"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Project Type</span>
                <Badge variant="outline">{getProjectTypeLabel(credit.projectType)}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Available Credits</span>
                <span className="font-semibold">{credit.amount.toLocaleString()} tons</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price per Ton</span>
                <span className="font-semibold text-green-600">${credit.pricePerTon}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Vintage Year</span>
                <span className="font-semibold">{credit.vintageYear}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Verification</span>
                <Badge className={getVerificationBadgeColor(credit.verificationStandard)}>
                  {credit.verificationStandard}
                </Badge>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {credit.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <span className="font-bold text-lg">
                  ${(credit.amount * credit.pricePerTon).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCredits.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Leaf className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Credits Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to find available carbon credits.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {selectedCredits.length > 0 && (
        <Card className="sticky bottom-4">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {selectedCredits.length} credit(s) selected
                </p>
                <p className="text-sm text-muted-foreground">
                  Total: ${filteredCredits
                    .filter(credit => selectedCredits.includes(credit.id))
                    .reduce((sum, credit) => sum + (credit.amount * credit.pricePerTon), 0)
                    .toLocaleString()}
                </p>
              </div>
              <Button onClick={handlePurchase} disabled={isPurchasing}>
                {isPurchasing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Purchasing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Purchase Credits
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
