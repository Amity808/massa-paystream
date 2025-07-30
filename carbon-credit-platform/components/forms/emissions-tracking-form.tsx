"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"
import { Loader2, Leaf } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface EmissionsFormData {
  emissionAmount: string
  scope: string
  emissionSource: string
  reportingPeriod: string
  description: string
}

export default function EmissionsTrackingForm() {
  const { currentAddress } = useUser()
  const { contract, isLoading } = useContract()
  const [formData, setFormData] = useState<EmissionsFormData>({
    emissionAmount: "",
    scope: "",
    emissionSource: "",
    reportingPeriod: "",
    description: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.emissionAmount || Number.parseFloat(formData.emissionAmount) <= 0) {
      newErrors.emissionAmount = "Valid emission amount is required"
    }

    if (!formData.scope) {
      newErrors.scope = "Scope selection is required"
    }

    if (!formData.emissionSource) {
      newErrors.emissionSource = "Emission source is required"
    }

    if (!formData.reportingPeriod) {
      newErrors.reportingPeriod = "Reporting period is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (!contract) {
      toast({
        title: "Error",
        description: "Contract not initialized. Please ensure your wallet is connected.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const args = new (await import("@massalabs/massa-web3")).Args()
        .addU64(BigInt(Math.floor(Number.parseFloat(formData.emissionAmount) * 1000))) // Convert to appropriate units
        .addString(formData.scope)
        .addString(formData.emissionSource)
        .addU64(BigInt(parseInt(formData.reportingPeriod)))

      const result = await contract.call('recordEmissions', args, { coins: BigInt(100000000) })

      if (result.success) {
        toast({
          title: "Emissions Recorded",
          description: `${formData.emissionAmount} tons of CO2e emissions have been recorded successfully.`,
        })

        // Reset form
        setFormData({
          emissionAmount: "",
          scope: "",
          emissionSource: "",
          reportingPeriod: "",
          description: "",
        })
      } else {
        toast({
          title: "Recording Failed",
          description: result.error || "Failed to record emissions",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error recording emissions:", error)
      toast({
        title: "Recording Failed",
        description: "An error occurred while recording emissions",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const scopeOptions = [
    { value: "scope1", label: "Scope 1 - Direct Emissions" },
    { value: "scope2", label: "Scope 2 - Indirect Emissions (Electricity)" },
    { value: "scope3", label: "Scope 3 - Other Indirect Emissions" },
  ]

  const sourceOptions = [
    { value: "electricity", label: "Electricity Consumption" },
    { value: "natural_gas", label: "Natural Gas" },
    { value: "fuel", label: "Fuel Combustion" },
    { value: "refrigerants", label: "Refrigerants" },
    { value: "waste", label: "Waste Management" },
    { value: "transportation", label: "Business Travel" },
    { value: "supply_chain", label: "Supply Chain" },
    { value: "other", label: "Other" },
  ]

  const reportingPeriods = [
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" },
    { value: "2022", label: "2022" },
  ]

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-500" />
          Record Emissions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emissionAmount">Emission Amount (tons CO2e)</Label>
              <Input
                id="emissionAmount"
                type="number"
                step="0.01"
                value={formData.emissionAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, emissionAmount: e.target.value }))}
                placeholder="Enter emission amount"
                className={errors.emissionAmount ? "border-red-500" : ""}
              />
              {errors.emissionAmount && (
                <p className="text-sm text-red-500 mt-1">{errors.emissionAmount}</p>
              )}
            </div>

            <div>
              <Label htmlFor="scope">Scope</Label>
              <Select
                value={formData.scope}
                onValueChange={(value) => setFormData(prev => ({ ...prev, scope: value }))}
              >
                <SelectTrigger className={errors.scope ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  {scopeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.scope && (
                <p className="text-sm text-red-500 mt-1">{errors.scope}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emissionSource">Emission Source</Label>
              <Select
                value={formData.emissionSource}
                onValueChange={(value) => setFormData(prev => ({ ...prev, emissionSource: value }))}
              >
                <SelectTrigger className={errors.emissionSource ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.emissionSource && (
                <p className="text-sm text-red-500 mt-1">{errors.emissionSource}</p>
              )}
            </div>

            <div>
              <Label htmlFor="reportingPeriod">Reporting Period</Label>
              <Select
                value={formData.reportingPeriod}
                onValueChange={(value) => setFormData(prev => ({ ...prev, reportingPeriod: value }))}
              >
                <SelectTrigger className={errors.reportingPeriod ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {reportingPeriods.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.reportingPeriod && (
                <p className="text-sm text-red-500 mt-1">{errors.reportingPeriod}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide additional details about the emissions..."
              rows={3}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Recording Information</h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p><strong>Company:</strong> {currentAddress}</p>
              <p><strong>Amount:</strong> {formData.emissionAmount} tons CO2e</p>
              <p><strong>Scope:</strong> {scopeOptions.find(s => s.value === formData.scope)?.label || 'Not selected'}</p>
              <p><strong>Source:</strong> {sourceOptions.find(s => s.value === formData.emissionSource)?.label || 'Not selected'}</p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Recording Emissions...
              </>
            ) : (
              "Record Emissions"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
