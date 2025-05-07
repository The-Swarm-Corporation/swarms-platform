import { MonitoringStats } from "@/shared/components/telemetry/monitoring-stats"
import { ApiKeyForm } from "@/shared/components/telemetry/api-key-form"
import { Button } from "@/shared/components/ui/button"
import { SwarmComparison } from "@/shared/components/telemetry/swarm-comparison-chart"
import { UsageOverview } from "@/shared/components/telemetry/usage-overview"
import Link from "next/link"
import { Box, User, History } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-600">Dashboard</h1>
          <p className="text-zinc-900 dark:text-white">
            Monitor your swarm executions, agent usage, and cost analytics
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
            <Link href="/swarms/new">
              <Box className="mr-2 h-4 w-4" />
              Create Swarm
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-red-600"
          >
            <Link href="/agents/new">
              <User className="mr-2 h-4 w-4" />
              Create Agent
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-red-600"
          >
            <Link href="/history">
              <History className="mr-2 h-4 w-4" />
              View History
            </Link>
          </Button>
        </div>
      </div>

      <ApiKeyForm />

      <MonitoringStats />

      <UsageOverview />

      <SwarmComparison
        limit={5}
        className="border-red-500/50 hover:border-red-600 hover:shadow-lg transition-all duration-200"
      />
    </div>
  )
}

