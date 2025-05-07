"use client"

import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"
import { Badge } from "@/shared/components/ui/badge"
import { AlertCircle, Loader2, MoreVertical, Plus, Search, User } from "lucide-react"
import Link from "next/link"
import { useStorageManager } from "@/shared/utils/api/telemetry/storage"
import type { StoredAgent } from "@/shared/utils/api/telemetry/storage"

export default function AgentsPage() {
  const [search, setSearch] = useState("")
  const [agents, setAgents] = useState<StoredAgent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const storageManager = useStorageManager()

  useEffect(() => {
    if (storageManager) {
      const loadAgents = () => {
        try {
          const storedAgents = storageManager.getAgents()
          const validAgents = storedAgents.filter((agent) => {
            return (
              agent &&
              typeof agent.id === "string" &&
              typeof agent.name === "string" &&
              typeof agent.description === "string" &&
              typeof agent.modelName === "string" &&
              typeof agent.role === "string" &&
              typeof agent.lastUsed === "string" &&
              typeof agent.successRate === "number"
            )
          })
          setAgents(validAgents)
        } catch (error) {
          console.error("Error loading agents:", error)
          setAgents([])
        }
        setIsLoading(false)
      }

      loadAgents()
      const interval = setInterval(loadAgents, 1000)
      return () => clearInterval(interval)
    }
  }, [storageManager])

  const filteredAgents = agents.filter((agent) => {
    if (!search) return true
    if (!agent) return false

    const searchLower = search.toLowerCase()
    return (
      (agent.name || "").toLowerCase().includes(searchLower) ||
      (agent.description || "").toLowerCase().includes(searchLower) ||
      (agent.modelName || "").toLowerCase().includes(searchLower) ||
      (agent.role || "").toLowerCase().includes(searchLower)
    )
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
        <h1 className="text-2xl font-bold text-red-600">Agents</h1>
        <div className="mt-1 space-y-2 text-zinc-900 dark:text-white">
          <p>Create and manage reusable AI agents that can be used across multiple swarms.</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Agents are specialized AI assistants that can be configured for specific tasks. Build a library of agents
            with different capabilities, then combine them into swarms to tackle complex problems. Each agent can be
            reused across multiple swarms to maximize efficiency.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Link href="/agents/new">
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Create New Agent
          </Button>
        </Link>
      </div>

      <Card className="border-red-500/50">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search agents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
              />
            </div>
            <Button variant="outline" className="border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-400">
              Filter
            </Button>
          </div>
        </div>
        {filteredAgents.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-8 w-8 text-zinc-500 mb-4" />
            <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-300 mb-2">No agents found</h3>
            <p className="text-zinc-600 dark:text-zinc-500 mb-4 max-w-md">
              {agents.length === 0
                ? "Create your first agent to get started. Agents can be specialized for different tasks and reused across swarms."
                : "No agents match your search criteria"}
            </p>
            {agents.length === 0 && (
              <Link href="/agents/new">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Agent
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableHead className="text-red-500/70">Name</TableHead>
                <TableHead className="text-red-500/70">Model</TableHead>
                <TableHead className="text-red-500/70">Role</TableHead>
                <TableHead className="text-red-500/70">Status</TableHead>
                <TableHead className="text-red-500/70">Success Rate</TableHead>
                <TableHead className="text-red-500/70">Last Used</TableHead>
                <TableHead className="text-red-500/70 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="font-medium text-zinc-900 dark:text-white">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-red-500" />
                      <span>{agent.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-900 dark:text-white">{agent.modelName}</TableCell>
                  <TableCell className="capitalize text-zinc-900 dark:text-white">{agent.role}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        new Date(agent.lastUsed) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                          ? "border-green-500 text-green-500"
                          : "border-zinc-500 text-zinc-500"
                      }
                    >
                      {new Date(agent.lastUsed) > new Date(Date.now() - 24 * 60 * 60 * 1000) ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        agent.successRate > 90
                          ? "border-green-500 text-green-500"
                          : agent.successRate > 70
                            ? "border-yellow-500 text-yellow-500"
                            : "border-red-500 text-red-500"
                      }
                    >
                      {agent.successRate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-900 dark:text-white">
                    {new Date(agent.lastUsed).toLocaleString()}
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
    </div>
  )
}

