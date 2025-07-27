// components/forms/emissions-tracking-form.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { setError } from "@/utils/error-utils" // Import setError from error-utils

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  scope1: z.coerce.number().min(0, "Scope 1 emissions must be non-negative"),
  scope2: z.coerce.number().min(0, "Scope 2 emissions must be non-negative"),
  scope3: z.coerce.number().min(0, "Scope 3 emissions must be non-negative"),
})

type EmissionFormValues = z.infer<typeof formSchema>

export default function EmissionsTrackingForm() {
  const { recordEmissions, loading, error } = useContract()
  const { currentAddress } = useUser()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<EmissionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0], // Default to today's date
      scope1: 0,
      scope2: 0,
      scope3: 0,
    },
  })

  const onSubmit = async (values: EmissionFormValues) => {
    if (!currentAddress) {
      setError("Wallet not connected. Please connect your wallet.")
      return
    }

    setSuccessMessage(null)
    const total = values.scope1 + values.scope2 + values.scope3
    const result = await recordEmissions({
      companyId: currentAddress,
      date: values.date,
      scope1: values.scope1,
      scope2: values.scope2,
      scope3: values.scope3,
      total: total,
    })

    if (result?.success) {
      setSuccessMessage("Emissions recorded successfully! Awaiting verification.")
      form.reset({
        date: new Date().toISOString().split("T")[0],
        scope1: 0,
        scope2: 0,
        scope3: 0,
      })
    } else {
      setError(result?.message || "Failed to record emissions.")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Record New Emissions</CardTitle>
        <CardDescription>Enter your company's carbon emissions for a specific period.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...form.register("date")} />
            {form.formState.errors.date && <p className="text-error text-sm">{form.formState.errors.date.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="scope1">Scope 1 Emissions (Tons CO2e)</Label>
            <Input id="scope1" type="number" step="0.01" {...form.register("scope1")} />
            {form.formState.errors.scope1 && (
              <p className="text-error text-sm">{form.formState.errors.scope1.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="scope2">Scope 2 Emissions (Tons CO2e)</Label>
            <Input id="scope2" type="number" step="0.01" {...form.register("scope2")} />
            {form.formState.errors.scope2 && (
              <p className="text-error text-sm">{form.formState.errors.scope2.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="scope3">Scope 3 Emissions (Tons CO2e)</Label>
            <Input id="scope3" type="number" step="0.01" {...form.register("scope3")} />
            {form.formState.errors.scope3 && (
              <p className="text-error text-sm">{form.formState.errors.scope3.message}</p>
            )}
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
          {successMessage && <p className="text-success text-sm">{successMessage}</p>}
          <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Record Emissions"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
