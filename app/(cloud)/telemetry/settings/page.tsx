"use client"

import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { fetchAvailableModels, fetchAvailableSwarmTypes } from "@/shared/utils/api/telemetry/api"
import { AlertCircle, Database, Loader2, RefreshCcw, Search, Settings2, Zap } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { useTheme } from "next-themes"
import { Input } from "@/shared/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/shared/components/ui/table"

export default function SettingsPage() {
  const [models, setModels] = useState<string[]>([])
  const [swarmTypes, setSwarmTypes] = useState<string[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [isLoadingSwarmTypes, setIsLoadingSwarmTypes] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)
  const [swarmTypesError, setSwarmTypesError] = useState<string | null>(null)
  const [hasApiKey, setHasApiKey] = useState(false)
  const { theme, setTheme } = useTheme()
  const [modelSearchQuery, setModelSearchQuery] = useState("")
  const [swarmTypeSearchQuery, setSwarmTypeSearchQuery] = useState("")

  // Check if API key exists on component mount
  useEffect(() => {
    const apiKey = localStorage.getItem("swarms_api_key")
    setHasApiKey(!!apiKey)
  }, [])

  const fetchModels = async () => {
    setIsLoadingModels(true)
    setModelsError(null)
    try {
      const data = await fetchAvailableModels()
      setModels(data)
    } catch (error) {
      console.error("Error in fetchModels:", error)
      setModelsError(error instanceof Error ? error.message : "Failed to fetch available models")
      // Don't set models here - the API function will return fallback data
    } finally {
      setIsLoadingModels(false)
    }
  }

  const fetchSwarmTypes = async () => {
    setIsLoadingSwarmTypes(true)
    setSwarmTypesError(null)
    try {
      const data = await fetchAvailableSwarmTypes()
      setSwarmTypes(data)
    } catch (error) {
      console.error("Error in fetchSwarmTypes:", error)
      setSwarmTypesError(error instanceof Error ? error.message : "Failed to fetch available swarm types")
      // Don't set swarm types here - the API function will return fallback data
    } finally {
      setIsLoadingSwarmTypes(false)
    }
  }

  // Filter models based on search query
  const filteredModels = models.filter((model) => model.toLowerCase().includes(modelSearchQuery.toLowerCase()))

  // Filter swarm types based on search query
  const filteredSwarmTypes = swarmTypes.filter((type) =>
    type.toLowerCase().includes(swarmTypeSearchQuery.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-red-600">Settings</h1>
        <p className="text-zinc-900 dark:text-white">
          Configure your Swarms platform settings and view API information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-red-500/50 hover:border-red-600 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-red-500" />
              Available Models
            </CardTitle>
            <CardDescription>View all available language models for your swarms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <Button
                onClick={fetchModels}
                disabled={isLoadingModels || !hasApiKey}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoadingModels ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Models...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Fetch Available Models
                  </>
                )}
              </Button>

              {models.length > 0 && (
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search models..."
                    value={modelSearchQuery}
                    onChange={(e) => setModelSearchQuery(e.target.value)}
                    className="pl-8 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                  />
                </div>
              )}
            </div>

            {!hasApiKey && (
              <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">Please configure your API key first</p>
              </div>
            )}

            {modelsError && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{modelsError}</p>
              </div>
            )}

            {models.length > 0 ? (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <TableHead className="text-red-500/70">Model Name</TableHead>
                      <TableHead className="text-red-500/70 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModels.length > 0 ? (
                      filteredModels.map((model, index) => (
                        <TableRow
                          key={index}
                          className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        >
                          <TableCell className="font-medium">{model}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="border-green-500 text-green-500">
                              Available
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4 text-zinc-500">
                          No models match your search query
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : !isLoadingModels && !modelsError ? (
              <p className="text-center text-zinc-500 dark:text-zinc-400 py-4">
                Click the button above to fetch available models
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-red-500/50 hover:border-red-600 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-500" />
              Available Swarm Types
            </CardTitle>
            <CardDescription>View all available swarm types for your workflows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <Button
                onClick={fetchSwarmTypes}
                disabled={isLoadingSwarmTypes || !hasApiKey}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoadingSwarmTypes ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Swarm Types...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Fetch Available Swarm Types
                  </>
                )}
              </Button>

              {swarmTypes.length > 0 && (
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search swarm types..."
                    value={swarmTypeSearchQuery}
                    onChange={(e) => setSwarmTypeSearchQuery(e.target.value)}
                    className="pl-8 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                  />
                </div>
              )}
            </div>

            {!hasApiKey && (
              <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">Please configure your API key first</p>
              </div>
            )}

            {swarmTypesError && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{swarmTypesError}</p>
              </div>
            )}

            {swarmTypes.length > 0 ? (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <TableHead className="text-red-500/70">Swarm Type</TableHead>
                      <TableHead className="text-red-500/70 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSwarmTypes.length > 0 ? (
                      filteredSwarmTypes.map((type, index) => (
                        <TableRow
                          key={index}
                          className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        >
                          <TableCell className="font-medium">{type}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="border-green-500 text-green-500">
                              Available
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4 text-zinc-500">
                          No swarm types match your search query
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : !isLoadingSwarmTypes && !swarmTypesError ? (
              <p className="text-center text-zinc-500 dark:text-zinc-400 py-4">
                Click the button above to fetch available swarm types
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="border-red-500/50 hover:border-red-600 hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-red-500" />
            Platform Settings
          </CardTitle>
          <CardDescription>Configure your Swarms platform settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Theme</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Choose your preferred theme</p>
              </div>
              <Tabs defaultValue={theme} onValueChange={setTheme}>
                <TabsList>
                  <TabsTrigger value="light">Light</TabsTrigger>
                  <TabsTrigger value="dark">Dark</TabsTrigger>
                  <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

