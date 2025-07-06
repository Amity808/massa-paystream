"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { useWallet } from "@/contexts/wallet-context"
import { PAYSTREAM_CONTRACT_ADDRESS } from "@/contract"
import { bytesToStr, SmartContract, Args } from "@massalabs/massa-web3"

import { StreamFormHeader } from "./stream-form-header"
import { StreamFormFields } from "./stream-form-fields"
import { StreamFormActions } from "./stream-form-actions"
import { IntervalSelector } from "./interval-selector"

interface CreateStreamFormProps {
    onSuccess?: () => void
}

export function CreateStreamForm({ onSuccess }: CreateStreamFormProps) {
    const { isConnected, address, provider } = useWallet()
    const [isLoading, setIsLoading] = useState(false)
    const [useCustomId, setUseCustomId] = useState(false)
    const [customInterval, setCustomInterval] = useState("")
    const [formData, setFormData] = useState({
        payee: "",
        amount: "",
        interval: "",
        streamId: "",
        description: "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.payee) {
            newErrors.payee = "Payee address is required"
        } else if (!/^AU[0-9A-Za-z]{48,50}$/.test(formData.payee)) {
            newErrors.payee = "Invalid Massa address format"
        } else if (formData.payee === address) {
            newErrors.payee = "Cannot create stream to yourself"
        }

        if (!formData.amount) {
            newErrors.amount = "Amount is required"
        } else if (Number.parseFloat(formData.amount) <= 0) {
            newErrors.amount = "Amount must be greater than 0"
        }

        if (!formData.interval) {
            newErrors.interval = "Interval is required"
        } else if (formData.interval === "0" && !customInterval) {
            newErrors.interval = "Custom interval is required"
        } else if (formData.interval === "0" && Number.parseInt(customInterval) <= 0) {
            newErrors.interval = "Custom interval must be greater than 0"
        }

        if (useCustomId && !formData.streamId) {
            newErrors.streamId = "Stream ID is required when using custom ID"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet first",
                variant: "destructive",
            })
            return
        }

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            const intervalValue =
                formData.interval === "0" ? Number.parseInt(customInterval) : Number.parseInt(formData.interval)
            const amountInNanoMAS = (Number.parseFloat(formData.amount) * 1e9).toString()

            // Create smart contract instance
            const payStreamContract = new SmartContract(provider, PAYSTREAM_CONTRACT_ADDRESS)

            const streamLengthResult = await payStreamContract.read('getStreamLength')
            const streamLengthStr = bytesToStr(streamLengthResult.value)
            const streamId = parseInt(streamLengthStr)

            // Prepare arguments for createStream function
            const args = new Args()
                .addString(formData.payee)
                .addU64(BigInt(amountInNanoMAS))
                .addU64(BigInt(intervalValue))

            console.log("Creating stream with params:", {
                payee: formData.payee,
                amount: amountInNanoMAS,
                interval: intervalValue,
            })

            // Call the smart contract
            const result = await payStreamContract.call('createStream', args, { coins: BigInt(amountInNanoMAS) })

            console.log("Contract call result:", result)

            toast({
                title: "Stream Created Successfully",
                description: `Stream ID: ${streamId}`,
            })

            // Reset form
            setFormData({
                payee: "",
                amount: "",
                interval: "",
                streamId: "",
                description: "",
            })
            setUseCustomId(false)
            setCustomInterval("")

            onSuccess?.()
        } catch (error) {
            console.error("Error creating stream:", error)
            toast({
                title: "Failed to Create Stream",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleFormDataChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <StreamFormHeader />
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <StreamFormFields
                        formData={formData}
                        useCustomId={useCustomId}
                        onFormDataChange={handleFormDataChange}
                        onUseCustomIdChange={setUseCustomId}
                        errors={errors}
                    />

                    <IntervalSelector
                        interval={formData.interval}
                        customInterval={customInterval}
                        onIntervalChange={(value) => handleFormDataChange("interval", value)}
                        onCustomIntervalChange={setCustomInterval}
                        error={errors.interval}
                    />

                    <StreamFormActions
                        isLoading={isLoading}
                        isConnected={isConnected}
                        onSubmit={handleSubmit}
                    />
                </form>
            </CardContent>
        </Card>
    )
} 