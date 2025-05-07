"use client"

import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { KeyRound } from "lucide-react"
import { toast } from "sonner"

export function ApiKeyForm() {
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("swarms_api_key") || ""
    }
    return ""
  })

  const [isValidating, setIsValidating] = useState(false)

  const validateAndSaveKey = async () => {
    if (!apiKey) {
      toast.error("Please enter an API key")
      return
    }

    setIsValidating(true)
    try {
      const response = await fetch("https://swarms-api-285321057562.us-east1.run.app/health", {
        headers: {
          "x-api-key": apiKey,
        },
      })

      if (response.ok) {
        localStorage.setItem("swarms_api_key", apiKey)
        toast.success("API key validated and saved successfully")
      } else {
        toast.error("Invalid API key")
      }
    } catch (error) {
      toast.error("Failed to validate API key")
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Card className="bg-zinc-100 dark:bg-zinc-900 border-red-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
          <KeyRound className="h-5 w-5 text-red-500" />
          API Key Configuration
        </CardTitle>
        <CardDescription>
          Enter your Swarms API key to get started. You can find your API key in the Swarms Cloud dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <Input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
          />
        </div>
        <Button onClick={validateAndSaveKey} className="bg-red-600 hover:bg-red-700 text-white" disabled={isValidating}>
          {isValidating ? "Validating..." : "Save API Key"}
        </Button>
      </CardContent>
    </Card>
  )
}

