"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useStorageManager } from "@/shared/utils/api/telemetry/storage"

export function UsageChart() {
  const [data, setData] = useState<any[]>([])
  const storageManager = useStorageManager()
  useEffect(() => {
    const stats = storageManager?.getRealtimeStats() || { daily: [] }
    setData(stats.daily)
  }, [storageManager])

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#525252"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-zinc-400">Swarms</span>
                        <span className="font-bold text-zinc-50">{payload[0].value}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-zinc-400">Success Rate</span>
                        <span className="font-bold text-zinc-50">{payload[1].value}%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-zinc-400">Tokens</span>
                        <span className="font-bold text-zinc-50">{payload[2]?.value?.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-zinc-400">Credits</span>
                        <span className="font-bold text-zinc-50">{payload[3]?.value?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Line type="monotone" dataKey="swarms" stroke="#ef4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="successRate" stroke="#22c55e" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="tokens" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="credits" stroke="#eab308" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

