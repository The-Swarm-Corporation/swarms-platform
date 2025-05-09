"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Switch } from "@/shared/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { useStorageManager } from "@/shared/utils/api/telemetry/storage"
import { toast } from "sonner"
import { Brain, HelpCircle, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip"

interface AgentForm {
  agent_name: string
  description: string
  system_prompt: string
  model_name: string
  auto_generate_prompt: boolean
  max_tokens: number
  temperature: number
  role: string
  max_loops: number
}

const initialForm: AgentForm = {
  agent_name: "",
  description: "",
  system_prompt: "",
  model_name: "gpt-4o",
  auto_generate_prompt: false,
  max_tokens: 2000,
  temperature: 0.5,
  role: "worker",
  max_loops: 1,
}

const roles = ["worker", "supervisor", "specialist", "analyst"]
const models = ["gpt-4o", "gpt-4", "gpt-3.5-turbo"]

export default function CreateAgentPage() {
  const [form, setForm] = useState<AgentForm>(initialForm)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const storageManager = useStorageManager()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!form.agent_name || !form.description) {
        throw new Error("Agent name and description are required")
      }

      // If auto-generate is enabled but no description, throw error
      if (form.auto_generate_prompt && !form.description) {
        throw new Error("Description is required for auto-generating system prompt")
      }

      // If not auto-generating and no system prompt, throw error
      if (!form.auto_generate_prompt && !form.system_prompt) {
        throw new Error("System prompt is required when not auto-generating")
      }

      // Add agent to storage
      const agent = storageManager?.addAgent({
        name: form.agent_name,
        description: form.description,
        systemPrompt: form.auto_generate_prompt
          ? `You are an AI agent specialized in: ${form.description}. Approach tasks methodically and provide clear, detailed responses.`
          : form.system_prompt,
        modelName: form.model_name,
        role: form.role,
        maxLoops: form.max_loops,
      })

      if (!agent) {
        throw new Error("Failed to create agent")
      }

      toast.success("Agent created successfully")
      router.push("/agents")
    } catch (error) {
      console.error("Error creating agent:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create agent")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create New Agent</h1>
        <p className="text-zinc-400">Configure your AI agent</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Agent Configuration</CardTitle>
          <CardDescription>Define your agent&apos;s capabilities and behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="agent_name">Agent Name</Label>
                <Input
                  id="agent_name"
                  value={form.agent_name}
                  onChange={(e) => setForm({ ...form, agent_name: e.target.value })}
                  placeholder="Enter agent name"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model_name">Model</Label>
                <Select value={form.model_name} onValueChange={(value) => setForm({ ...form, model_name: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your agent's purpose and capabilities"
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto_generate_prompt">Auto-generate System Prompt</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5">
                        <HelpCircle className="h-4 w-4 text-zinc-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Automatically generate a system prompt based on the description</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch
                checked={form.auto_generate_prompt}
                onCheckedChange={(checked) => setForm({ ...form, auto_generate_prompt: checked })}
                className="data-[state=checked]:bg-red-600"
              />
            </div>

            {!form.auto_generate_prompt && (
              <div className="space-y-2">
                <Label htmlFor="system_prompt">System Prompt</Label>
                <Textarea
                  id="system_prompt"
                  value={form.system_prompt}
                  onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                  placeholder="Define the agent's behavior and instructions"
                  maxLength={500}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_loops">Max Loops</Label>
                <Input
                  id="max_loops"
                  type="number"
                  min={1}
                  value={form.max_loops}
                  onChange={(e) => setForm({ ...form, max_loops: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="max_tokens">Max Tokens</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <HelpCircle className="h-4 w-4 text-zinc-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Maximum number of tokens to generate in the response</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="max_tokens"
                  type="number"
                  min={1}
                  value={form.max_tokens}
                  onChange={(e) => setForm({ ...form, max_tokens: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="temperature">Temperature</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <HelpCircle className="h-4 w-4 text-zinc-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Controls randomness: 0 is focused, 1 is creative</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="temperature"
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={form.temperature}
                  onChange={(e) => setForm({ ...form, temperature: Number.parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-zinc-700 text-zinc-400"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Create Agent
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

