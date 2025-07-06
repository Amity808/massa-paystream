"use client"

import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus } from "lucide-react"

export function StreamFormHeader() {
    return (
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Payment Stream
            </CardTitle>
            <CardDescription>
                Set up a recurring payment stream to automatically send MAS tokens at regular intervals
            </CardDescription>
        </CardHeader>
    )
} 