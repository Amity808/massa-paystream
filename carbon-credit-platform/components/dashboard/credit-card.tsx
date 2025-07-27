"use client"

// components/dashboard/credit-card.tsx
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { CarbonCredit } from "@/lib/types"
import { Leaf, DollarSign, CalendarDays } from "lucide-react"

interface CreditCardProps {
  credit: CarbonCredit
  onPurchase?: (creditId: string) => void
  onRetire?: (creditId: string) => void
  onTransfer?: (creditId: string) => void
  showActions?: boolean
}

export default function CreditCard({ credit, onPurchase, onRetire, onTransfer, showActions = true }: CreditCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <Image
          src={credit.imageUrl || "/placeholder.svg?height=200&width=300&query=carbon credit project"}
          alt={credit.description}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-500" />
          {credit.projectId}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {credit.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <DollarSign className="h-4 w-4" />
            Price: ${credit.pricePerTon.toFixed(2)}/ton
          </span>
          <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <CalendarDays className="h-4 w-4" />
            Vintage: {credit.vintageYear}
          </span>
        </div>
        <div className="text-xl font-bold text-green-600">{credit.amount} Tons CO2e</div>
        <div
          className={`text-sm font-medium mt-2 ${
            credit.status === "available"
              ? "text-green-500"
              : credit.status === "sold"
                ? "text-blue-500"
                : "text-gray-500"
          }`}
        >
          Status: {credit.status.charAt(0).toUpperCase() + credit.status.slice(1)}
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2">
          {credit.status === "available" && onPurchase && (
            <Button
              onClick={() => onPurchase(credit.id)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              Purchase
            </Button>
          )}
          {credit.status === "sold" && onRetire && (
            <Button onClick={() => onRetire(credit.id)} className="w-full bg-green-500 hover:bg-green-600 text-white">
              Retire
            </Button>
          )}
          {credit.status === "sold" && onTransfer && (
            <Button onClick={() => onTransfer(credit.id)} className="w-full" variant="outline">
              Transfer
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
