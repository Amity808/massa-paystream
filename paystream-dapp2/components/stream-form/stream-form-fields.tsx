"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface StreamFormFieldsProps {
    formData: {
        payee: string
        amount: string
        interval: string
        streamId: string
        description: string
    }
    useCustomId: boolean
    onFormDataChange: (field: string, value: string) => void
    onUseCustomIdChange: (value: boolean) => void
    errors: Record<string, string>
}

export function StreamFormFields({
    formData,
    useCustomId,
    onFormDataChange,
    onUseCustomIdChange,
    errors
}: StreamFormFieldsProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="payee">Recipient Address *</Label>
                <Input
                    id="payee"
                    placeholder="AU1234..."
                    value={formData.payee}
                    onChange={(e) => onFormDataChange("payee", e.target.value)}
                    className={errors.payee ? "border-red-500" : ""}
                />
                {errors.payee && <p className="text-sm text-red-500">{errors.payee}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="amount">Amount per Payment (MAS) *</Label>
                <Input
                    id="amount"
                    type="number"
                    step="0.0001"
                    placeholder="10.0"
                    value={formData.amount}
                    onChange={(e) => onFormDataChange("amount", e.target.value)}
                    className={errors.amount ? "border-red-500" : ""}
                />
                {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            <div className="flex items-center space-x-2">
                <Switch id="useCustomId" checked={useCustomId} onCheckedChange={onUseCustomIdChange} />
                <Label htmlFor="useCustomId">Use custom stream ID</Label>
            </div>

            {useCustomId && (
                <div className="space-y-2">
                    <Label htmlFor="streamId">Custom Stream ID *</Label>
                    <Input
                        id="streamId"
                        placeholder="my-stream-001"
                        value={formData.streamId}
                        onChange={(e) => onFormDataChange("streamId", e.target.value)}
                        className={errors.streamId ? "border-red-500" : ""}
                    />
                    {errors.streamId && <p className="text-sm text-red-500">{errors.streamId}</p>}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                    id="description"
                    placeholder="Monthly salary payment..."
                    value={formData.description}
                    onChange={(e) => onFormDataChange("description", e.target.value)}
                    rows={3}
                />
            </div>
        </div>
    )
} 