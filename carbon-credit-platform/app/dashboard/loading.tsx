// app/dashboard/loading.tsx
import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] bg-gray-50 dark:bg-gray-950">
      <Loader2 className="h-12 w-12 animate-spin text-green-500" />
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</p>
    </div>
  )
}
