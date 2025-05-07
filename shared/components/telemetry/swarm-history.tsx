"use client"

import { useEffect, useState } from "react"
import { Clock, RefreshCcw } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { fetchSwarmLogs, type SwarmLog } from "@/shared/utils/api/telemetry/api"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import Link from "next/link"

interface SwarmHistoryProps {
  limit?: number
}

export function SwarmHistory({ limit }: SwarmHistoryProps) {
  const [logs, setLogs] = useState<SwarmLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log("Fetching logs...")

        const response = await fetchSwarmLogs()
        console.log("Received logs:", response)

        if (!response.logs || !Array.isArray(response.logs)) {
          throw new Error("Invalid logs data received")
        }

        const sortedLogs = response.logs
          .filter((log) => {
            // Validate required nested properties
            if (!log.data?.metadata?.billing_info?.total_cost || !log.data?.metadata?.execution_time_seconds) {
              console.warn("Skipping invalid log entry:", log)
              return false
            }
            return true
          })
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        setLogs(limit ? sortedLogs.slice(0, limit) : sortedLogs)
        setError(null)
      } catch (error) {
        console.error("Error loading logs:", error)
        const errorMessage = error instanceof Error ? error.message : "Failed to load logs"
        setError(errorMessage)
        setLogs([])

        // Special handling for API key related errors
        if (errorMessage.includes("API key")) {
          setError(
            "Please configure your API key in the dashboard to view execution history. " +
              "Click here to configure your API key.",
          )
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadLogs()
  }, [limit])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(limit || 5)].map((_, i) => (
          <div key={i} className="h-16 bg-zinc-800 rounded-md" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-950/10 border-red-900">
        <div className="text-red-500">
          <h3 className="font-semibold mb-2">Error Loading History</h3>
          {error.includes("API key") ? (
            <p className="mb-4">
              <Link href="/dashboard" className="underline hover:text-red-400">
                {error}
              </Link>
            </p>
          ) : (
            <p className="mb-4">{error}</p>
          )}
          <Button
            onClick={handleRetry}
            variant="outline"
            className="border-red-900 text-red-500 hover:bg-red-950/50"
            size="sm"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  if (logs.length === 0) {
    return (
      <Card className="p-4 bg-white dark:bg-zinc-900 border-red-500/50">
        <p className="text-zinc-600 dark:text-white text-center">No swarm history found</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Clock className="h-4 w-4 text-zinc-500" />
            <div>
              <p className="text-sm font-medium text-white">{log.data.swarm_name || "Unnamed Swarm"}</p>
              <p className="text-xs text-zinc-500">
                {new Date(log.created_at).toLocaleString()} • {log.data.metadata.execution_time_seconds.toFixed(2)}s • $
                {log.data.metadata.billing_info.total_cost.toFixed(4)}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              log.data.status === "success" ? "border-green-500 text-green-500" : "border-red-500 text-red-500"
            }
          >
            {log.data.status}
          </Badge>
        </div>
      ))}
    </div>
  )
}

