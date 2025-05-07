"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { AlertOctagon, Loader2 } from "lucide-react"
import { fetchSwarmLogs } from "@/shared/utils/api/telemetry/api"

interface ChartData {
  date: string
  tokens: number
  credits: number
  swarms: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded border border-red-500/20 bg-black/90 p-3 shadow-lg shadow-red-500/10 backdrop-blur-sm">
        <div className="mb-2 border-b border-red-500/20 pb-1">
          <span className="font-mono text-xs text-red-500">{new Date(label).toLocaleDateString()}</span>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-8">
            <span className="font-mono text-[0.70rem] uppercase text-zinc-500">Tokens</span>
            <span className="font-mono text-sm text-red-500">{payload[0].value?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="font-mono text-[0.70rem] uppercase text-zinc-500">Credits</span>
            <span className="font-mono text-sm text-yellow-500">${payload[1].value?.toFixed(4)}</span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="font-mono text-[0.70rem] uppercase text-zinc-500">Swarms</span>
            <span className="font-mono text-sm text-blue-500">{payload[2].value}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

const CustomLegend = ({ payload }: any) => {
  if (!payload) return null
  return (
    <div className="mt-4 flex justify-center gap-6">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-sm border border-red-500/20 shadow-sm shadow-red-500/10"
            style={{ backgroundColor: entry.color }}
          />
          <span className="font-mono text-xs text-zinc-400">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function UsageOverview() {
  const [data, setData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch real data from the logs endpoint
        const response = await fetchSwarmLogs()

        if (!response?.logs || !Array.isArray(response.logs)) {
          throw new Error("Invalid logs data received")
        }

        // Process logs into daily data
        const dailyDataMap = new Map()

        response.logs.forEach((log) => {
          const date = new Date(log.created_at).toISOString().split("T")[0]
          if (!dailyDataMap.has(date)) {
            dailyDataMap.set(date, {
              date,
              tokens: 0,
              credits: 0,
              swarms: 0,
            })
          }

          const dayData = dailyDataMap.get(date)
          dayData.swarms++

          // Add token and cost data if available
          if (log.data?.metadata?.billing_info) {
            const billingInfo = log.data.metadata.billing_info
            dayData.tokens += billingInfo.cost_breakdown?.token_counts?.total_tokens || 0
            dayData.credits += billingInfo.total_cost || 0
          }
        })

        // Convert to array and sort by date
        const chartData = Array.from(dailyDataMap.values()).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )

        setData(chartData)
      } catch (error) {
        console.error("Error loading usage data:", error)
        setError(error instanceof Error ? error.message : "Failed to load usage data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg border border-red-500/20 bg-black/50">
        <div className="flex items-center gap-2 text-red-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-mono text-xs">Loading data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg border border-red-500/20 bg-black/50">
        <div className="flex items-center gap-2 text-red-500">
          <AlertOctagon className="h-4 w-4" />
          <span className="font-mono text-xs">{error}</span>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg border border-dashed border-red-500/20 bg-black/50">
        <span className="font-mono text-xs text-zinc-500 dark:text-white">No usage data available</span>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full rounded-lg border border-red-500/20 bg-black/50 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(239, 68, 68, 0.1)" />
          <XAxis
            dataKey="date"
            stroke="#525252"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
            tick={{ fontFamily: "monospace" }}
          />
          <YAxis
            yAxisId="left"
            stroke="#525252"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value.toLocaleString()}`}
            tick={{ fontFamily: "monospace" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#525252"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            tick={{ fontFamily: "monospace" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="tokens"
            name="Tokens"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, fill: "#ef4444", stroke: "#ef4444" }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="credits"
            name="Credits"
            stroke="#eab308"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, fill: "#eab308", stroke: "#eab308" }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="swarms"
            name="Swarms"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, fill: "#3b82f6", stroke: "#3b82f6" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

