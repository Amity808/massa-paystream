// components/charts/compliance-gauge.tsx
"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ComplianceGaugeProps {
  progress: number // 0-100
}

export default function ComplianceGauge({ progress }: ComplianceGaugeProps) {
  const data = [
    { name: "Progress", value: progress },
    { name: "Remaining", value: 100 - progress },
  ]

  const COLORS = ["#22c55e", "#e2e8f0"] // Green for progress, light gray for remaining

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              cornerRadius={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-4xl font-bold text-green-500"
            >
              {`${progress}%`}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
