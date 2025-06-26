"use client"

import { useEffect } from "react"

export interface StorageStats {
  totalAgents: number
  totalSwarms: number
  successfulSwarms: number
  failedSwarms: number
  totalTimeSaved: number
  totalTokensUsed: number
  totalCreditsUsed: number
  lastUpdated: string
  dailyStats: {
    [date: string]: {
      swarms: number
      agents: number
      tokens: number
      credits: number
      successRate: number
    }
  }
}

export interface SwarmOutput {
  id: string
  swarmId: string
  output: string
  status: "success" | "failed"
  tokensUsed: number
  creditsUsed: number
  executionTime: number
  timestamp: string
}

export interface StoredAgent {
  id: string
  name: string
  description: string
  systemPrompt: string
  modelName: string
  role: string
  maxLoops: number
  createdAt: string
  lastUsed: string
  useCount: number
  averageExecutionTime: number
  successRate: number
}

export interface StoredSwarm {
  id: string
  name: string
  description: string
  agents: string[]
  maxLoops: number
  swarmType: "ConcurrentWorkflow" | "SequentialWorkflow"
  task: string
  createdAt: string
  lastRun: string
  runCount: number
  averageExecutionTime: number
  successRate: number
  tags: string[]
}

class StorageManager {
  private readonly STATS_KEY = "swarms_stats"
  private readonly AGENTS_KEY = "swarms_agents"
  private readonly SWARMS_KEY = "swarms_swarms"
  private readonly OUTPUTS_KEY = "swarms_outputs"
  private isInitialized = false

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeStorage()
    }
  }

  private initializeStorage() {
    if (this.isInitialized) return

    try {
      if (!localStorage.getItem(this.STATS_KEY)) {
        const initialStats: StorageStats = {
          totalAgents: 0,
          totalSwarms: 0,
          successfulSwarms: 0,
          failedSwarms: 0,
          totalTimeSaved: 0,
          totalTokensUsed: 0,
          totalCreditsUsed: 0,
          lastUpdated: new Date().toISOString(),
          dailyStats: {},
        }
        localStorage.setItem(this.STATS_KEY, JSON.stringify(initialStats))
      }

      if (!localStorage.getItem(this.AGENTS_KEY)) {
        localStorage.setItem(this.AGENTS_KEY, JSON.stringify([]))
      }

      if (!localStorage.getItem(this.SWARMS_KEY)) {
        localStorage.setItem(this.SWARMS_KEY, JSON.stringify([]))
      }

      if (!localStorage.getItem(this.OUTPUTS_KEY)) {
        localStorage.setItem(this.OUTPUTS_KEY, JSON.stringify([]))
      }

      this.isInitialized = true
    } catch (error) {
      console.error("Failed to initialize storage:", error)
    }
  }

  // Stats Management
  getStats(): StorageStats {
    try {
      return JSON.parse(localStorage.getItem(this.STATS_KEY) || "{}")
    } catch (error) {
      console.error("Failed to get stats:", error)
      return {} as StorageStats
    }
  }

  updateStats(updates: Partial<StorageStats>) {
    try {
      const currentStats = this.getStats()
      const newStats = {
        ...currentStats,
        ...updates,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem(this.STATS_KEY, JSON.stringify(newStats))
      return newStats
    } catch (error) {
      console.error("Failed to update stats:", error)
      return null
    }
  }

  // Agent Management
  getAgents(): StoredAgent[] {
    try {
      return JSON.parse(localStorage.getItem(this.AGENTS_KEY) || "[]")
    } catch (error) {
      console.error("Failed to get agents:", error)
      return []
    }
  }

  addAgent(
    agent: Omit<StoredAgent, "id" | "createdAt" | "lastUsed" | "useCount" | "averageExecutionTime" | "successRate">,
  ) {
    try {
      const agents = this.getAgents()
      const newAgent: StoredAgent = {
        ...agent,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        useCount: 0,
        averageExecutionTime: 0,
        successRate: 100,
        name: agent.name || "Unnamed Agent",
        description: agent.description || "",
        systemPrompt: agent.systemPrompt || "",
        modelName: agent.modelName || "gpt-4o",
        role: agent.role || "worker",
        maxLoops: agent.maxLoops || 1,
      }
      agents.push(newAgent)
      localStorage.setItem(this.AGENTS_KEY, JSON.stringify(agents))

      const stats = this.getStats()
      this.updateStats({
        totalAgents: stats.totalAgents + 1,
        totalTimeSaved: stats.totalTimeSaved + 30,
      })

      this.updateDailyStats({ agents: 1 })

      return newAgent
    } catch (error) {
      console.error("Failed to add agent:", error)
      return null
    }
  }

  updateAgent(id: string, updates: Partial<StoredAgent>) {
    try {
      const agents = this.getAgents()
      const index = agents.findIndex((a) => a.id === id)
      if (index !== -1) {
        agents[index] = { ...agents[index], ...updates }
        localStorage.setItem(this.AGENTS_KEY, JSON.stringify(agents))
        return agents[index]
      }
      return null
    } catch (error) {
      console.error("Failed to update agent:", error)
      return null
    }
  }

  // Swarm Management
  getSwarms(): StoredSwarm[] {
    try {
      return JSON.parse(localStorage.getItem(this.SWARMS_KEY) || "[]")
    } catch (error) {
      console.error("Failed to get swarms:", error)
      return []
    }
  }

  addSwarm(
    swarm: Omit<StoredSwarm, "id" | "createdAt" | "lastRun" | "runCount" | "averageExecutionTime" | "successRate">,
  ) {
    try {
      const swarms = this.getSwarms()

      // Validate required fields
      if (!swarm.name) {
        console.error("Cannot add swarm: missing name")
        throw new Error("Swarm name is required")
      }

      if (!swarm.task) {
        console.error("Cannot add swarm: missing task")
        throw new Error("Swarm task is required")
      }

      if (!Array.isArray(swarm.agents) || swarm.agents.length === 0) {
        console.error("Cannot add swarm: missing agents")
        throw new Error("At least one agent is required")
      }

      const newSwarm: StoredSwarm = {
        ...swarm,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        lastRun: new Date().toISOString(),
        runCount: 0,
        averageExecutionTime: 0,
        successRate: 100,
        name: swarm.name || "Unnamed Swarm",
        description: swarm.description || "",
        agents: swarm.agents || [],
        maxLoops: swarm.maxLoops || 1,
        swarmType: swarm.swarmType || "SequentialWorkflow",
        task: swarm.task || "",
        tags: swarm.tags || [],
      }

      swarms.push(newSwarm)
      localStorage.setItem(this.SWARMS_KEY, JSON.stringify(swarms))

      const stats = this.getStats()
      this.updateStats({
        totalSwarms: stats.totalSwarms + 1,
      })

      return newSwarm
    } catch (error) {
      console.error("Failed to add swarm:", error)
      throw error
    }
  }

  updateSwarm(id: string, updates: Partial<StoredSwarm>) {
    try {
      const swarms = this.getSwarms()
      const index = swarms.findIndex((s) => s.id === id)
      if (index !== -1) {
        swarms[index] = { ...swarms[index], ...updates }
        localStorage.setItem(this.SWARMS_KEY, JSON.stringify(swarms))
        return swarms[index]
      }
      return null
    } catch (error) {
      console.error("Failed to update swarm:", error)
      return null
    }
  }

  // Output Management
  getOutputs(): SwarmOutput[] {
    try {
      return JSON.parse(localStorage.getItem(this.OUTPUTS_KEY) || "[]")
    } catch (error) {
      console.error("Failed to get outputs:", error)
      return []
    }
  }

  addOutput(output: Omit<SwarmOutput, "id" | "timestamp">) {
    try {
      const outputs = this.getOutputs()
      const newOutput: SwarmOutput = {
        ...output,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      }
      outputs.push(newOutput)
      localStorage.setItem(this.OUTPUTS_KEY, JSON.stringify(outputs))

      const stats = this.getStats()
      this.updateStats({
        totalTokensUsed: stats.totalTokensUsed + output.tokensUsed,
        totalCreditsUsed: stats.totalCreditsUsed + output.creditsUsed,
        successfulSwarms: output.status === "success" ? stats.successfulSwarms + 1 : stats.successfulSwarms,
        failedSwarms: output.status === "failed" ? stats.failedSwarms + 1 : stats.failedSwarms,
      })

      return newOutput
    } catch (error) {
      console.error("Failed to add output:", error)
      return null
    }
  }

  private updateDailyStats(stats: {
    swarms?: number
    agents?: number
    tokens?: number
    credits?: number
    success?: boolean
  }) {
    try {
      const currentStats = this.getStats()
      const today = new Date().toISOString().split("T")[0]

      if (!currentStats.dailyStats) {
        currentStats.dailyStats = {}
      }

      if (!currentStats.dailyStats[today]) {
        currentStats.dailyStats[today] = {
          swarms: 0,
          agents: 0,
          tokens: 0,
          credits: 0,
          successRate: 100,
        }
      }

      const dailyStats = currentStats.dailyStats[today]

      if (stats.swarms) {
        dailyStats.swarms += stats.swarms
      }
      if (stats.agents) {
        dailyStats.agents += stats.agents
      }
      if (stats.tokens) {
        dailyStats.tokens += stats.tokens
      }
      if (stats.credits) {
        dailyStats.credits += stats.credits
      }
      if (stats.success !== undefined) {
        const totalSwarms = dailyStats.swarms
        const successfulSwarms = (dailyStats.successRate / 100) * (totalSwarms - 1) + (stats.success ? 1 : 0)
        dailyStats.successRate = (successfulSwarms / totalSwarms) * 100
      }

      currentStats.dailyStats[today] = dailyStats
      this.updateStats(currentStats)
    } catch (error) {
      console.error("Failed to update daily stats:", error)
    }
  }

  addSwarmExecution(data: {
    swarmId: string
    tokensUsed: number
    creditsUsed: number
    success: boolean
    executionTime: number
  }) {
    try {
      // Update daily stats
      this.updateDailyStats({
        swarms: 1,
        tokens: data.tokensUsed,
        credits: data.creditsUsed,
        success: data.success,
      })

      // Update swarm-specific stats
      const swarm = this.getSwarms().find((s) => s.id === data.swarmId)
      if (swarm) {
        this.updateSwarm(data.swarmId, {
          runCount: swarm.runCount + 1,
          lastRun: new Date().toISOString(),
          averageExecutionTime:
            (swarm.averageExecutionTime * swarm.runCount + data.executionTime) / (swarm.runCount + 1),
          successRate: (swarm.successRate * swarm.runCount + (data.success ? 100 : 0)) / (swarm.runCount + 1),
        })
      }

      return data
    } catch (error) {
      console.error("Failed to add swarm execution:", error)
      return null
    }
  }

  getRealtimeStats() {
    try {
      const stats = this.getStats()
      const now = new Date()
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))

      const dailyData = Object.entries(stats.dailyStats || {})
        .filter(([date]) => new Date(date) >= thirtyDaysAgo)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))

      return {
        totals: {
          agents: stats.totalAgents,
          swarms: stats.totalSwarms,
          successfulSwarms: stats.successfulSwarms,
          failedSwarms: stats.failedSwarms,
          timeSaved: stats.totalTimeSaved,
          tokensUsed: stats.totalTokensUsed,
          creditsUsed: stats.totalCreditsUsed,
        },
        daily: dailyData.map(([date, data]) => ({
          date,
          ...data,
        })),
        recentActivity: this.getOutputs()
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10),
      }
    } catch (error) {
      console.error("Failed to get realtime stats:", error)
      return null
    }
  }

  // Analytics
  getAnalytics() {
    try {
      const stats = this.getStats()
      const agents = this.getAgents()
      const swarms = this.getSwarms()
      const outputs = this.getOutputs()

      const totalExecutionTime = outputs.reduce((acc, output) => acc + output.executionTime, 0)
      const averageExecutionTime = outputs.length ? totalExecutionTime / outputs.length : 0
      const successRate = outputs.length
        ? (outputs.filter((o) => o.status === "success").length / outputs.length) * 100
        : 0

      return {
        timeSaved: {
          total: stats.totalTimeSaved, // in minutes
          perAgent: stats.totalTimeSaved / (agents.length || 1),
        },
        efficiency: {
          averageExecutionTime,
          successRate,
          tokensPerSwarm: stats.totalTokensUsed / (swarms.length || 1),
        },
        costs: {
          totalCredits: stats.totalCreditsUsed,
          creditsPerSwarm: stats.totalCreditsUsed / (swarms.length || 1),
        },
        usage: {
          activeAgents: agents.filter((a) => a.lastUsed > new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .length,
          activeSwarms: swarms.filter((s) => s.lastRun > new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .length,
        },
      }
    } catch (error) {
      console.error("Failed to get analytics:", error)
      return null
    }
  }

  // Utility Methods
  clearStorage() {
    try {
      localStorage.removeItem(this.STATS_KEY)
      localStorage.removeItem(this.AGENTS_KEY)
      localStorage.removeItem(this.SWARMS_KEY)
      localStorage.removeItem(this.OUTPUTS_KEY)
      this.initializeStorage()
    } catch (error) {
      console.error("Failed to clear storage:", error)
    }
  }
}

let storageManagerInstance: StorageManager | null = null

export function useStorageManager() {
  useEffect(() => {
    if (!storageManagerInstance && typeof window !== "undefined") {
      storageManagerInstance = new StorageManager()
    }
  }, [])

  return storageManagerInstance || new StorageManager()
}

