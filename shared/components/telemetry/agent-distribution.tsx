"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { AlertOctagon, Loader2 } from "lucide-react"
import { fetchSwarmLogs } from "@/shared/utils/api/telemetry/api"
import { useAPIKeyContext } from "../ui/apikey.provider"

interface ChartData {
  name: string
  value: number
  color: string
}

const COLORS = {
  worker: "#ef4444",
  supervisor: "#eab308",
  specialist: "#22c55e",
  analyst: "#3b82f6",
  other: "#a855f7",
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const total = payload[0].payload.total
    return (
      <div className="rounded border border-red-500/20 bg-black/90 p-3 shadow-lg shadow-red-500/10 backdrop-blur-sm">
        <div className="mb-2 border-b border-red-500/20 pb-1">
          <span className="font-mono text-xs" style={{ color: data.color }}>
            {data.name}
          </span>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-8">
            <span className="font-mono text-[0.70rem] uppercase text-zinc-500">Count</span>
            <span className="font-mono text-sm" style={{ color: data.color }}>
              {data.value}
            </span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="font-mono text-[0.70rem] uppercase text-zinc-500">Percentage</span>
            <span className="font-mono text-sm" style={{ color: data.color }}>
              {((data.value / total) * 100).toFixed(1)}%
            </span>
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
    <div className="mt-4 flex flex-wrap justify-center gap-4">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-sm border border-red-500/20 shadow-sm shadow-red-500/10"
            style={{ backgroundColor: entry.color }}
          />
          <span className="font-mono text-xs text-zinc-400">
            {entry.value} ({entry.payload.percentage}%)
          </span>
        </div>
      ))}
    </div>
  )
}

export function AgentDistribution() {
  const [data, setData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { apiKey } = useAPIKeyContext();

  useEffect(() => {
    if(!apiKey) return;

    setIsLoading(true)
    setError(null)

    const loadData = async () => {
      try {
        const response = await fetchSwarmLogs(apiKey)

        if (!response?.logs || !Array.isArray(response.logs)) {
          throw new Error("Invalid logs data received")
        }

        const distribution: { [key: string]: number } = {}
        let total = 0

        response.logs.forEach((log) => {
          if (log.data?.agents && Array.isArray(log.data.agents)) {
            log.data.agents.forEach((agent) => {
              if (agent.role) {
                const role = agent.role.toLowerCase()
                distribution[role] = (distribution[role] || 0) + 1
                total++
              }
            })
          }
        })

        if (total === 0) {
          distribution.worker = 0
          distribution.supervisor = 0
          distribution.specialist = 0
          distribution.analyst = 0
          distribution.other = 0
        }

        const chartData = Object.entries(distribution).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          color: COLORS[name as keyof typeof COLORS] || COLORS.other,
          percentage: total > 0 ? ((value / total) * 100).toFixed(1) : "0.0",
          total,
        }))

        setData(chartData)
      } catch (error) {
        console.error("Error loading agent distribution:", error)
        setError(error instanceof Error ? error.message : "Failed to load agent distribution")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [apiKey])

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
        <span className="font-mono text-xs text-zinc-500 dark:text-white">No agent data available</span>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full rounded-lg border border-red-500/20 bg-black/50 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            strokeWidth={2}
            stroke="rgba(239, 68, 68, 0.1)"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

