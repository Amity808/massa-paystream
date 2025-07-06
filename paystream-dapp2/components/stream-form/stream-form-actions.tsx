"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, AlertCircle } from "lucide-react"

interface StreamFormActionsProps {
    isLoading: boolean
    isConnected: boolean
    onSubmit: (e: React.FormEvent) => void
}

export function StreamFormActions({
    isLoading,
    isConnected,
    onSubmit
}: StreamFormActionsProps) {
    return (
        <div className="space-y-4">
            {!isConnected && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Please connect your wallet to create a payment stream.</AlertDescription>
                </Alert>
            )}

            <Button type="submit" disabled={isLoading || !isConnected} className="w-full" size="lg" onClick={onSubmit}>
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Stream...
                    </>
                ) : (
                    <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Payment Stream
                    </>
                )}
            </Button>
        </div>
    )
} 