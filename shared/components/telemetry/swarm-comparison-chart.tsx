"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { fetchSwarmLogs, type SwarmLog } from "@/shared/utils/api/telemetry/api"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts"
import { AlertOctagon, Loader2, RefreshCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { useAPIKeyContext } from "../ui/apikey.provider"

interface ProcessedSwarmData {
  id: string
  name: string
  executionTime: number
  tokenCount: number
  cost: number
  successRate: number
  agentCount: number
  swarmType: string
  lastRun: string
  color: string
}

interface SwarmComparisonProps {
  limit?: number
  className?: string
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
]

export function SwarmComparison({ limit, className }: SwarmComparisonProps) {
  const [logs, setLogs] = useState<SwarmLog[]>([])
  const [processedData, setProcessedData] = useState<ProcessedSwarmData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metric, setMetric] = useState<"executionTime" | "tokenCount" | "cost" | "successRate" | "agentCount">(
    "executionTime",
  )
  const [chartType, setChartType] = useState<"bar" | "comparison">("bar")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const { apiKey } = useAPIKeyContext();

  useEffect(() => {
    fetchData()
  }, [apiKey])

  useEffect(() => {
    if (logs.length > 0) {
      const data = processData(logs)
      setProcessedData(data)
    }
  }, [logs, metric, sortOrder])

  const fetchData = async () => {
    if(!apiKey) return;

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetchSwarmLogs(apiKey)

      if (!response.logs || !Array.isArray(response.logs)) {
        throw new Error("Invalid logs data received")
      }

      const validLogs = response.logs.filter((log) => {
        return (
          log &&
          log.data?.metadata?.billing_info?.total_cost &&
          log.data?.metadata?.execution_time_seconds &&
          log.data?.status &&
          log.created_at &&
          log.data?.swarm_name
        )
      })

      setLogs(validLogs)
      setError(null)
    } catch (error) {
      console.error("Error loading logs:", error)
      setError(error instanceof Error ? error.message : "Failed to load logs")
      setLogs([])
    } finally {
      setIsLoading(false)
    }
  }

  const processData = (logs: SwarmLog[]): ProcessedSwarmData[] => {
    if (!logs || logs.length === 0) return []

    const swarmMap = new Map<string, SwarmLog[]>()

    logs.forEach((log) => {
      const swarmName = log.data.swarm_name || "Unnamed Swarm"
      if (!swarmMap.has(swarmName)) {
        swarmMap.set(swarmName, [])
      }
      swarmMap.get(swarmName)?.push(log)
    })

    let processedData: ProcessedSwarmData[] = []
    let colorIndex = 0

    swarmMap.forEach((swarmLogs, swarmName) => {
      const totalRuns = swarmLogs.length
      const successfulRuns = swarmLogs.filter((log) => log.data.status === "success").length
      const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0

      let totalExecutionTime = 0
      let totalTokens = 0
      let totalCost = 0
      let totalAgents = 0
      let swarmType = ""
      let lastRun = new Date(0).toISOString()

      swarmLogs.forEach((log) => {
        totalExecutionTime += log.data.metadata.execution_time_seconds || 0
        totalTokens += log.data.metadata.billing_info.cost_breakdown?.token_counts?.total_tokens || 0
        totalCost += log.data.metadata.billing_info.total_cost || 0
        totalAgents += log.data.metadata.num_agents || 0

        if (new Date(log.created_at) > new Date(lastRun)) {
          lastRun = log.created_at
          swarmType = log.data.swarm_type || "Unknown"
        }
      })

      processedData.push({
        id: swarmName.replace(/\s+/g, "-").toLowerCase(),
        name: swarmName,
        executionTime: totalRuns > 0 ? totalExecutionTime / totalRuns : 0,
        tokenCount: totalRuns > 0 ? totalTokens / totalRuns : 0,
        cost: totalRuns > 0 ? totalCost / totalRuns : 0,
        successRate,
        agentCount: totalRuns > 0 ? totalAgents / totalRuns : 0,
        swarmType,
        lastRun,
        color: COLORS[colorIndex % COLORS.length],
      })

      colorIndex++
    })

    processedData.sort((a, b) => {
      return sortOrder === "asc" ? a[metric] - b[metric] : b[metric] - a[metric]
    })

    if (limit && processedData.length > limit) {
      processedData = processedData.slice(0, limit)
    }

    return processedData
  }

  const getMetricLabel = (metric: string): string => {
    switch (metric) {
      case "executionTime":
        return "Execution Time (s)"
      case "tokenCount":
        return "Token Usage"
      case "cost":
        return "Cost ($)"
      case "successRate":
        return "Success Rate (%)"
      case "agentCount":
        return "Agent Count"
      default:
        return metric
    }
  }

  const formatValue = (value: number, metric: string): string => {
    switch (metric) {
      case "executionTime":
        return value.toFixed(2) + "s"
      case "tokenCount":
        return value.toLocaleString()
      case "cost":
        return "$" + value.toFixed(4)
      case "successRate":
        return value.toFixed(1) + "%"
      case "agentCount":
        return value.toFixed(1)
      default:
        return value.toString()
    }
  }

  const getTooltipFormatter = (value: number, name: string) => {
    return formatValue(value, metric)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Swarm Comparison</CardTitle>
          <CardDescription>Loading swarm performance data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            <p className="text-sm text-zinc-500">Loading swarm data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Swarm Comparison</CardTitle>
          <CardDescription>Error loading swarm data</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2 text-center">
            <AlertOctagon className="h-8 w-8 text-red-500" />
            <p className="text-sm text-zinc-500">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchData} className="mt-2">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!processedData || processedData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Swarm Comparison</CardTitle>
          <CardDescription>No swarm data available</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-zinc-500">
              No swarm execution data found. Run some swarms to see comparison data.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Swarm Comparison</CardTitle>
            <CardDescription>Compare performance metrics across different swarms</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2">
              <Select
                value={metric}
                onValueChange={(value) => {
                  setMetric(value as any)
                  const data = processData(logs)
                  setProcessedData(data)
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executionTime">Execution Time</SelectItem>
                  <SelectItem value="tokenCount">Token Usage</SelectItem>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="successRate">Success Rate</SelectItem>
                  <SelectItem value="agentCount">Agent Count</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  const data = processData(logs)
                  setProcessedData(data)
                }}
                title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>
            <Tabs value={chartType} onValueChange={(value) => setChartType(value as "bar" | "comparison")}>
              <TabsList className="h-9">
                <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="icon" onClick={fetchData} title="Refresh Data">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartType === "bar" ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedData} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                <YAxis
                  label={{
                    value: getMetricLabel(metric),
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip
                  formatter={getTooltipFormatter}
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid #333",
                    borderRadius: "4px",
                  }}
                />
                <Legend />
                <Bar dataKey={metric} name={getMetricLabel(metric)} radius={[4, 4, 0, 0]}>
                  {processedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey={metric}
                    position="top"
                    formatter={(value: number) => formatValue(value, metric)}
                    style={{ fontSize: "10px" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-2">Swarm Name</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-right p-2">Execution Time</th>
                  <th className="text-right p-2">Token Usage</th>
                  <th className="text-right p-2">Cost</th>
                  <th className="text-right p-2">Success Rate</th>
                  <th className="text-right p-2">Agents</th>
                </tr>
              </thead>
              <tbody>
                {processedData.map((swarm, index) => (
                  <tr key={swarm.id} className="border-b border-zinc-800 hover:bg-zinc-900/50">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: swarm.color }}></div>
                        {swarm.name}
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline" className="border-zinc-700">
                        {swarm.swarmType}
                      </Badge>
                    </td>
                    <td className="text-right p-2">{formatValue(swarm.executionTime, "executionTime")}</td>
                    <td className="text-right p-2">{formatValue(swarm.tokenCount, "tokenCount")}</td>
                    <td className="text-right p-2">{formatValue(swarm.cost, "cost")}</td>
                    <td className="text-right p-2">
                      <Badge
                        variant="outline"
                        className={
                          swarm.successRate > 90
                            ? "border-green-500 text-green-500"
                            : swarm.successRate > 70
                              ? "border-yellow-500 text-yellow-500"
                              : "border-red-500 text-red-500"
                        }
                      >
                        {formatValue(swarm.successRate, "successRate")}
                      </Badge>
                    </td>
                    <td className="text-right p-2">{formatValue(swarm.agentCount, "agentCount")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

