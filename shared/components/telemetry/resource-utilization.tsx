"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Download, Filter } from "lucide-react"
import type { SwarmLog } from "@/shared/utils/api/telemetry/api"

interface ResourceUtilizationProps {
  logs: SwarmLog[]
  className?: string
}

export function ResourceUtilization({ logs, className }: ResourceUtilizationProps) {
  // Process logs into time series data
  const processData = () => {
    const timeSeriesMap = new Map<string, any>()

    logs.forEach((log) => {
      const date = new Date(log.created_at).toISOString().split("T")[0]
      if (!timeSeriesMap.has(date)) {
        timeSeriesMap.set(date, {
          date,
          totalTokens: 0,
          totalCost: 0,
          totalExecutionTime: 0,
          swarmCount: 0,
          successCount: 0,
        })
      }

      const dayData = timeSeriesMap.get(date)
      dayData.totalTokens += log.data.metadata.billing_info.cost_breakdown.token_counts.total_tokens
      dayData.totalCost += log.data.metadata.billing_info.total_cost
      dayData.totalExecutionTime += log.data.metadata.execution_time_seconds
      dayData.swarmCount++
      if (log.data.status === "success") dayData.successCount++
    })

    return Array.from(timeSeriesMap.values())
      .map((day) => ({
        ...day,
        avgTokensPerSwarm: day.totalTokens / day.swarmCount,
        avgCostPerSwarm: day.totalCost / day.swarmCount,
        avgExecutionTime: day.totalExecutionTime / day.swarmCount,
        successRate: (day.successCount / day.swarmCount) * 100,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const data = processData()

  const exportData = () => {
    const csvContent = [
      [
        "Date",
        "Total Tokens",
        "Total Cost ($)",
        "Total Execution Time (s)",
        "Swarm Count",
        "Success Rate (%)",
        "Avg Tokens/Swarm",
        "Avg Cost/Swarm ($)",
        "Avg Execution Time (s)",
      ].join(","),
      ...data.map((item) =>
        [
          item.date,
          item.totalTokens,
          item.totalCost.toFixed(4),
          item.totalExecutionTime.toFixed(2),
          item.swarmCount,
          item.successRate.toFixed(1),
          Math.round(item.avgTokensPerSwarm),
          item.avgCostPerSwarm.toFixed(4),
          item.avgExecutionTime.toFixed(2),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `resource-utilization-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Resource Utilization</CardTitle>
            <CardDescription>Track resource usage and efficiency over time</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={exportData}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                stroke="#525252"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#a1a1aa" }}
              />
              <YAxis
                yAxisId="left"
                stroke="#525252"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#a1a1aa" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#525252"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#a1a1aa" }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border border-zinc-800 bg-black/90 p-3 shadow-xl">
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between gap-8">
                            <span className="font-mono text-[0.70rem] uppercase text-zinc-400">Date</span>
                            <span className="font-mono text-sm text-zinc-200">{data.date}</span>
                          </div>
                          <div className="flex items-center justify-between gap-8">
                            <span className="font-mono text-[0.70rem] uppercase text-zinc-400">Tokens/Swarm</span>
                            <span className="font-mono text-sm text-red-500">
                              {Math.round(data.avgTokensPerSwarm).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-8">
                            <span className="font-mono text-[0.70rem] uppercase text-zinc-400">Cost/Swarm</span>
                            <span className="font-mono text-sm text-yellow-500">
                              ${data.avgCostPerSwarm.toFixed(4)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-8">
                            <span className="font-mono text-[0.70rem] uppercase text-zinc-400">Success Rate</span>
                            <span className="font-mono text-sm text-green-500">{data.successRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="avgTokensPerSwarm"
                name="Tokens per Swarm"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgCostPerSwarm"
                name="Cost per Swarm ($)"
                stroke="#eab308"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="successRate"
                name="Success Rate (%)"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

