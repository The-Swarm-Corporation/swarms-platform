"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { Badge } from "@/shared/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { AlertCircle, Box, Loader2, MessageSquare, MoreVertical, Plus, Search } from "lucide-react"
import { useStorageManager } from "@/shared/utils/api/telemetry/storage"
import type { StoredSwarm } from "@/shared/utils/api/telemetry/storage"
import { SwarmChat } from "@/shared/components/telemetry/swarm-chat"

export default function SwarmsPage() {
  const [search, setSearch] = useState("")
  const [swarms, setSwarms] = useState<StoredSwarm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"list" | "chat">("list")
  const storageManager = useStorageManager()

  useEffect(() => {
    if (storageManager) {
      const loadSwarms = () => {
        const storedSwarms = storageManager.getSwarms()
        setSwarms(storedSwarms)
        setIsLoading(false)
      }

      loadSwarms()
      const interval = setInterval(loadSwarms, 1000)
      return () => clearInterval(interval)
    }
  }, [storageManager])

  const filteredSwarms = swarms.filter((swarm) => {
    if (!search) return true
    if (!swarm) {
      console.log("Warning: Encountered undefined swarm in filter")
      return false
    }

    try {
      const searchLower = search.toLowerCase()

      return (
        (swarm.name ? swarm.name.toLowerCase().includes(searchLower) : false) ||
        (swarm.description ? swarm.description.toLowerCase().includes(searchLower) : false) ||
        (swarm.swarmType ? swarm.swarmType.toLowerCase().includes(searchLower) : false) ||
        String(swarm.agents?.length || 0).includes(searchLower) ||
        (swarm.tags || []).some((tag) => tag && tag.toLowerCase().includes(searchLower))
      )
    } catch (error) {
      console.error("Error filtering swarm:", error, swarm)
      return false
    }
  })

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-red-500" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-red-600">Swarms</h1>
        <div className="mt-1 space-y-2 text-zinc-900 dark:text-white">
          <p>
            Create and manage your swarms - coordinated groups of AI agents working together to accomplish complex
            tasks.
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            A swarm is a collection of specialized agents that can work either sequentially or concurrently. Start by
            creating a new swarm and adding pre-built agents or creating custom agents to handle specific parts of your
            task.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "list" | "chat")}>
          <TabsList>
            <TabsTrigger value="list">Swarm List</TabsTrigger>
            <TabsTrigger value="chat">Chat Interface</TabsTrigger>
          </TabsList>
        </Tabs>

        <Link href="/telemetry/swarms/new">
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            {activeTab === "chat" ? (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Create with Chat
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create New Swarm
              </>
            )}
          </Button>
        </Link>
      </div>

      {activeTab === "list" ? (
        <Card className="border-red-500/50">
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search swarms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                />
              </div>
              <Button
                variant="outline"
                className="border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-400"
              >
                Filter
              </Button>
            </div>
          </div>
          {filteredSwarms.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-8 w-8 text-zinc-500 mb-4" />
              <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-300 mb-2">No swarms found</h3>
              <p className="text-zinc-600 dark:text-zinc-500 mb-4 max-w-md">
                {swarms.length === 0
                  ? "Get started by creating your first swarm. Add agents to work together on complex tasks."
                  : "No swarms match your search criteria"}
              </p>
              {swarms.length === 0 && (
                <Link href="/telemetry/swarms/new">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Swarm
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableHead className="text-red-500/70">Name</TableHead>
                  <TableHead className="text-red-500/70">Type</TableHead>
                  <TableHead className="text-red-500/70">Agents</TableHead>
                  <TableHead className="text-red-500/70">Status</TableHead>
                  <TableHead className="text-red-500/70">Last Run</TableHead>
                  <TableHead className="text-red-500/70">Success Rate</TableHead>
                  <TableHead className="text-red-500/70 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSwarms.map((swarm) => (
                  <TableRow key={swarm.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="font-medium text-zinc-900 dark:text-white">
                      <div className="flex items-center space-x-3">
                        <Box className="h-4 w-4 text-red-500" />
                        <span>{swarm.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-900 dark:text-white">{swarm.swarmType}</TableCell>
                    <TableCell className="text-zinc-900 dark:text-white">{swarm.agents.length}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          new Date(swarm.lastRun) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                            ? "border-green-500 text-green-500"
                            : "border-blue-500 text-blue-500"
                        }
                      >
                        {new Date(swarm.lastRun) > new Date(Date.now() - 24 * 60 * 60 * 1000) ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-900 dark:text-white">
                      {new Date(swarm.lastRun).toLocaleString()}
                    </TableCell>
                    <TableCell>
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
                        {swarm.successRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      ) : (
        <SwarmChat />
      )}
    </div>
  )
}

