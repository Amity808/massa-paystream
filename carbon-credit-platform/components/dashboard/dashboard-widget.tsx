// components/dashboard/dashboard-widget.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface DashboardWidgetProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  iconColor?: string
}

export default function DashboardWidget({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-green-500",
}: DashboardWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
