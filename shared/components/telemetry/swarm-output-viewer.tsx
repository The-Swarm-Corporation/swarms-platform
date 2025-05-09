"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import type { SwarmOutput } from "@/shared/utils/api/telemetry/storage"
import { useStorageManager } from "@/shared/utils/api/telemetry/storage"
import { Badge } from "@/shared/components/ui/badge"

interface SwarmOutputViewerProps {
  swarmId: string
}

export function SwarmOutputViewer({ swarmId }: SwarmOutputViewerProps) {
  const [outputs, setOutputs] = useState<SwarmOutput[]>([])
  const storageManager = useStorageManager()

  useEffect(() => {
    const allOutputs = storageManager?.getOutputs() || []
    const swarmOutputs = allOutputs.filter((o) => o.swarmId === swarmId)
    setOutputs(swarmOutputs)
  }, [swarmId, storageManager])

  return (
    <div className="space-y-4">
      {outputs.map((output) => (
        <Card key={output.id} className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Output {new Date(output.timestamp).toLocaleString()}</CardTitle>
            <Badge
              variant="outline"
              className={
                output.status === "success" ? "border-green-500 text-green-500" : "border-red-500 text-red-500"
              }
            >
              {output.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <pre className="bg-zinc-950 p-4 rounded-lg overflow-auto max-h-[400px] text-sm">{output.output}</pre>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-zinc-400">Execution Time</p>
                <p className="font-medium">{output.executionTime}s</p>
              </div>
              <div>
                <p className="text-zinc-400">Tokens Used</p>
                <p className="font-medium">{output.tokensUsed.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-zinc-400">Credits Used</p>
                <p className="font-medium">{output.creditsUsed.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

