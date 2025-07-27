// app/dashboard/project/minting/page.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import type { Project, Transaction } from "@/lib/types"
import TransactionTable from "@/components/dashboard/transaction-table"

const formSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  pricePerTon: z.coerce.number().min(0.01, "Price must be at least 0.01"),
  vintageYear: z.coerce
    .number()
    .min(2000, "Invalid vintage year")
    .max(new Date().getFullYear(), "Vintage year cannot be in the future"),
})

type MintCreditsFormValues = z.infer<typeof formSchema>

export default function CreditMintingPage() {
  const { mintCarbonCredits, getMockData, loading, error } = useContract()
  const { currentAddress } = useUser()
  const [myProjects, setMyProjects] = useState<Project[]>([])
  const [mintingHistory, setMintingHistory] = useState<Transaction[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<MintCreditsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 100,
      pricePerTon: 25.0,
      vintageYear: new Date().getFullYear(),
    },
  })

  const fetchProjectsAndHistory = () => {
    if (currentAddress) {
      const allProjects = getMockData.projects()
      const ownerProjects = allProjects.filter(
        (p) => p.ownerId === currentAddress && (p.status === "verified" || p.status === "active"),
      )
      setMyProjects(ownerProjects)

      const allCredits = getMockData.carbonCredits()
      const projectCreditIds = ownerProjects.map((p) => p.id)
      const relevantCredits = allCredits.filter((c) => projectCreditIds.includes(c.projectId))

      const history: Transaction[] = relevantCredits.map((c) => ({
        id: c.id,
        type: "mint",
        date: new Date().toISOString().split("T")[0], // Mock date
        amount: c.amount,
        unit: "credits",
        from: c.projectId,
        to: "Marketplace",
        status: "completed", // Minted credits are immediately available
        details: `Price: $${c.pricePerTon}/ton, Vintage: ${c.vintageYear}`,
      }))
      setMintingHistory(history)
    }
  }

  useEffect(() => {
    fetchProjectsAndHistory()
  }, [currentAddress, getMockData])

  const onSubmit = async (values: MintCreditsFormValues) => {
    if (!currentAddress) {
      alert("Wallet not connected. Please connect your wallet.")
      return
    }

    setSuccessMessage(null)
    const result = await mintCarbonCredits(values.projectId, values.amount, values.pricePerTon, values.vintageYear)

    if (result?.success) {
      setSuccessMessage("Carbon credits minted successfully!")
      form.reset({
        projectId: values.projectId, // Keep selected project
        amount: 100,
        pricePerTon: 25.0,
        vintageYear: new Date().getFullYear(),
      })
      fetchProjectsAndHistory() // Re-fetch history
    } else {
      alert(result?.message || "Failed to mint carbon credits.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading minting interface...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-error text-center py-8">Error: {error}</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Mint New Carbon Credits</CardTitle>
          <CardDescription>Generate new carbon credits for your verified projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="projectId">Select Project</Label>
              <Select onValueChange={(value) => form.setValue("projectId", value)} value={form.watch("projectId")}>
                <SelectTrigger id="projectId">
                  <SelectValue placeholder="Select a verified project" />
                </SelectTrigger>
                <SelectContent>
                  {myProjects.length === 0 ? (
                    <SelectItem value="" disabled>
                      No verified projects available
                    </SelectItem>
                  ) : (
                    myProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.projectId && (
                <p className="text-error text-sm">{form.formState.errors.projectId.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (Tons CO2e)</Label>
              <Input id="amount" type="number" step="1" {...form.register("amount")} />
              {form.formState.errors.amount && (
                <p className="text-error text-sm">{form.formState.errors.amount.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pricePerTon">Price Per Ton (USD)</Label>
              <Input id="pricePerTon" type="number" step="0.01" {...form.register("pricePerTon")} />
              {form.formState.errors.pricePerTon && (
                <p className="text-error text-sm">{form.formState.errors.pricePerTon.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vintageYear">Vintage Year</Label>
              <Input id="vintageYear" type="number" step="1" {...form.register("vintageYear")} />
              {form.formState.errors.vintageYear && (
                <p className="text-error text-sm">{form.formState.errors.vintageYear.message}</p>
              )}
            </div>
            {successMessage && <p className="text-success text-sm">{successMessage}</p>}
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              disabled={loading || myProjects.length === 0}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Mint Credits"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credit Minting History</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTable transactions={mintingHistory} />
        </CardContent>
      </Card>
    </div>
  )
}
