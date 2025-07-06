"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface IntervalSelectorProps {
    interval: string
    customInterval: string
    onIntervalChange: (value: string) => void
    onCustomIntervalChange: (value: string) => void
    error?: string
}

const INTERVAL_OPTIONS = [
    { label: "Daily", value: 86400, description: "24 hours" },
    { label: "Weekly", value: 604800, description: "7 days" },
    { label: "Monthly", value: 2592000, description: "30 days" },
    { label: "Custom", value: 0, description: "Set custom interval" },
]

export function IntervalSelector({
    interval,
    customInterval,
    onIntervalChange,
    onCustomIntervalChange,
    error
}: IntervalSelectorProps) {
    const getIntervalLabel = (seconds: number) => {
        if (seconds < 3600) return `${seconds / 60} minutes`
        if (seconds < 86400) return `${seconds / 3600} hours`
        if (seconds < 604800) return `${seconds / 86400} days`
        return `${seconds / 604800} weeks`
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="interval">Payment Interval *</Label>
                <Select value={interval} onValueChange={onIntervalChange}>
                    <SelectTrigger className={error ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select payment frequency" />
                    </SelectTrigger>
                    <SelectContent>
                        {INTERVAL_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                                <div className="flex flex-col">
                                    <span>{option.label}</span>
                                    <span className="text-xs text-muted-foreground">{option.description}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            {interval === "0" && (
                <div className="space-y-2">
                    <Label htmlFor="customInterval">Custom Interval (seconds) *</Label>
                    <Input
                        id="customInterval"
                        type="number"
                        placeholder="3600"
                        value={customInterval}
                        onChange={(e) => onCustomIntervalChange(e.target.value)}
                    />
                    {customInterval && (
                        <p className="text-xs text-muted-foreground">
                            This equals {getIntervalLabel(Number.parseInt(customInterval))}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
} 