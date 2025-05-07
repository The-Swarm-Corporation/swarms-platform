"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { useStorageManager } from "@/shared/utils/api/telemetry/storage"
import { Clock, DollarSign, Gauge, Zap } from "lucide-react"

interface Analytics {
  timeSaved: {
    total: number
    perAgent: number
  }
  efficiency: {
    averageExecutionTime: number
    successRate: number
    tokensPerSwarm: number
  }
  costs: {
    totalCredits: number
    creditsPerSwarm: number
  }
  usage: {
    activeAgents: number
    activeSwarms: number
  }
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const storageManager = useStorageManager()

  useEffect(() => {
    if (storageManager) {
      const data = storageManager.getAnalytics()
      setAnalytics(data)
    }
  }, [storageManager])

  if (!analytics) return null

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">Time Saved</CardTitle>
          <Clock className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTime(analytics.timeSaved.total)}</div>
          <p className="text-xs text-zinc-500">{formatTime(analytics.timeSaved.perAgent)} per agent</p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">Efficiency</CardTitle>
          <Gauge className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.efficiency.successRate.toFixed(1)}%</div>
          <p className="text-xs text-zinc-500">{analytics.efficiency.averageExecutionTime.toFixed(1)}s avg execution</p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">Credits Used</CardTitle>
          <DollarSign className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.costs.totalCredits.toLocaleString()}</div>
          <p className="text-xs text-zinc-500">{analytics.costs.creditsPerSwarm.toFixed(1)} per swarm</p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">Token Usage</CardTitle>
          <Zap className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.efficiency.tokensPerSwarm.toLocaleString()}</div>
          <p className="text-xs text-zinc-500">tokens per swarm</p>
        </CardContent>
      </Card>
    </div>
  )
}

