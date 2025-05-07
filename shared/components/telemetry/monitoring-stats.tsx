"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { fetchSwarmLogs } from "@/shared/utils/api/telemetry/api"
import { Activity, DollarSign, Timer, Zap, Users, Box, Brain, Award } from "lucide-react"
import Link from "next/link"

interface MonitoringStats {
  totalSwarms: number
  totalCost: number
  averageExecutionTime: number
  totalTokens: number
  successRate: number
  totalAgentsBuilt: number
  totalSwarmsBuilt: number
  mostUsedModel: string
}

const initialStats: MonitoringStats = {
  totalSwarms: 0,
  totalCost: 0,
  averageExecutionTime: 0,
  totalTokens: 0,
  successRate: 0,
  totalAgentsBuilt: 0,
  totalSwarmsBuilt: 0,
  mostUsedModel: "N/A",
}

export function MonitoringStats() {
  const [stats, setStats] = useState<MonitoringStats>(initialStats)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      if (typeof window === "undefined") return

      try {
        // Fetch API stats
        const response = await fetchSwarmLogs()

        if (!response?.logs || !Array.isArray(response.logs)) {
          throw new Error("Invalid API response format")
        }

        const logs = response.logs
        const totalSwarms = logs.length

        let totalCost = 0
        let totalExecutionTime = 0
        let totalTokens = 0
        let successfulSwarms = 0
        const modelUsage: Record<string, number> = {}
        const agentCount: Record<string, number> = {}
        const swarmCount: Record<string, number> = {}

        for (const log of logs) {
          try {
            const metadata = log?.data?.metadata
            const billingInfo = metadata?.billing_info

            if (!metadata || !billingInfo) continue

            totalCost += Number(billingInfo.total_cost || 0)
            totalExecutionTime += Number(metadata.execution_time_seconds || 0)
            totalTokens += Number(billingInfo.cost_breakdown?.token_counts?.total_tokens || 0)

            if (log?.data?.status === "success") {
              successfulSwarms++
            }

            // Track model usage if available
            if (log?.data?.agents && Array.isArray(log.data.agents)) {
              for (const agent of log.data.agents) {
                if (agent.model_name) {
                  modelUsage[agent.model_name] = (modelUsage[agent.model_name] || 0) + 1
                }

                // Count unique agents
                const agentId = agent.model_name || "unknown"
                agentCount[agentId] = (agentCount[agentId] || 0) + 1
              }
            }

            // Count unique swarms
            if (log.data?.swarm_name) {
              swarmCount[log.data.swarm_name] = (swarmCount[log.data.swarm_name] || 0) + 1
            }
          } catch (err) {
            console.warn("Error processing log entry:", err)
          }
        }

        // Find most used model
        let mostUsedModel = "N/A"
        let maxUsage = 0
        for (const [model, count] of Object.entries(modelUsage)) {
          if (count > maxUsage) {
            maxUsage = count
            mostUsedModel = model
          }
        }

        setStats({
          totalSwarms,
          totalCost,
          averageExecutionTime: totalSwarms ? totalExecutionTime / totalSwarms : 0,
          totalTokens,
          successRate: totalSwarms ? (successfulSwarms / totalSwarms) * 100 : 0,
          totalAgentsBuilt: Object.keys(agentCount).length,
          totalSwarmsBuilt: Object.keys(swarmCount).length,
          mostUsedModel,
        })
        setError(null)
      } catch (error) {
        console.error("Failed to load monitoring stats:", error)
        setError(error instanceof Error ? error.message : "Failed to load stats")
        setStats(initialStats)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-zinc-800 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-900/10 border-red-900">
        <CardContent className="p-4">
          <div className="text-red-500">
            <h3 className="font-semibold mb-2">Error Loading Stats</h3>
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-white dark:bg-zinc-900 border-zinc-800 hover:border-red-900/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-red-600 dark:text-red-600">Total Swarms Run</CardTitle>
          <Activity className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">{stats.totalSwarms}</div>
          <p className="text-xs text-zinc-700 dark:text-white font-mono">
            {stats.successRate.toFixed(1)}% success rate
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-zinc-900 border-zinc-800 hover:border-red-900/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-red-500/70 dark:text-red-600">Total Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-red-600">${stats.totalCost.toFixed(2)}</div>
          <p className="text-xs text-zinc-500 dark:text-white font-mono">
            ${(stats.totalSwarms ? stats.totalCost / stats.totalSwarms : 0).toFixed(4)} per swarm
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-zinc-900 border-zinc-800 hover:border-red-900/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-red-500/70 dark:text-red-600">Avg. Execution Time</CardTitle>
          <Timer className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-red-600">{stats.averageExecutionTime.toFixed(2)}s</div>
          <p className="text-xs text-zinc-500 dark:text-white font-mono">Average per swarm</p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-zinc-900 border-zinc-800 hover:border-red-900/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-red-500/70 dark:text-red-600">Total Tokens</CardTitle>
          <Zap className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-red-600">{stats.totalTokens.toLocaleString()}</div>
          <p className="text-xs text-zinc-500 dark:text-white font-mono">
            {Math.round(stats.totalSwarms ? stats.totalTokens / stats.totalSwarms : 0).toLocaleString()} per swarm
          </p>
        </CardContent>
      </Card>

      {/* New metrics */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-800 hover:border-red-900/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-red-500/70 dark:text-red-600">Total Agents Built</CardTitle>
          <Users className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-red-600">{stats.totalAgentsBuilt}</div>
          <Link href="/agents" className="text-xs text-red-500 hover:text-red-400 font-mono">
            View all agents →
          </Link>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-zinc-900 border-zinc-800 hover:border-red-900/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-red-500/70 dark:text-red-600">Total Swarms Built</CardTitle>
          <Box className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-red-600">{stats.totalSwarmsBuilt}</div>
          <Link href="/swarms" className="text-xs text-red-500 hover:text-red-400 font-mono">
            View all swarms →
          </Link>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-zinc-900 border-zinc-800 hover:border-red-900/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-red-500/70 dark:text-red-600">Success Rate</CardTitle>
          <Award className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-red-600">{stats.successRate.toFixed(1)}%</div>
          <p className="text-xs text-zinc-500 dark:text-white font-mono">Overall success rate</p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-zinc-900 border-zinc-800 hover:border-red-900/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-red-500/70 dark:text-red-600">Most Used Model</CardTitle>
          <Brain className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-red-600">{stats.mostUsedModel}</div>
          <p className="text-xs text-zinc-500 dark:text-white font-mono">Preferred model for agents</p>
        </CardContent>
      </Card>
    </div>
  )
}

