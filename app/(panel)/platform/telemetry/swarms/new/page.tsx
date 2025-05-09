"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { PlayCircle, Plus, Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Textarea } from "@/shared/components/ui/textarea"
import { useStorageManager } from "@/shared/utils/api/telemetry/storage"
import { SwarmOutputViewer } from "@/shared/components/telemetry/swarm-output-viewer"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Switch } from "@/shared/components/ui/switch"
import { AgentSearch } from "@/shared/components/telemetry/agent-search"
import { Badge } from "@/shared/components/ui/badge" 
import { useAPIKeyContext } from "@/shared/components/ui/apikey.provider"
import { swarmTemplates } from "./const"

interface Agent {
  agent_name: string
  description: string
  system_prompt: string
  model_name: string
  role: "worker"
  max_loops: number
}

interface SwarmRequest {
  name: string
  description: string
  agents: Agent[]
  max_loops: number
  swarm_type:
    | "ConcurrentWorkflow"
    | "SequentialWorkflow"
    | "AgentRearrange"
    | "MixtureOfAgents"
    | "SpreadSheetSwarm"
    | "GroupChat"
    | "MultiAgentRouter"
    | "AutoSwarmBuilder"
    | "HiearchicalSwarm"
    | "auto"
    | "MajorityVoting"
  task: string
}

export default function CreateSwarm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentSwarmId, setCurrentSwarmId] = useState<string | null>(null)
  const [request, setRequest] = useState<SwarmRequest>({
    name: "",
    description: "",
    agents: [],
    max_loops: 1,
    swarm_type: "SequentialWorkflow",
    task: "",
  })
  const [autoSave, setAutoSave] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [creationMode, setCreationMode] = useState<"form" | "templates">("form")
  const [apiError, setApiError] = useState<string | null>(null)
  const [debugLog, setDebugLog] = useState<string[]>([])
  const { apiKey } = useAPIKeyContext();

  // Use a ref to track if component is mounted to prevent state updates during SSR
  const isMounted = useRef(false)

  const storageManager = useStorageManager()

  // Add debug logging function
  const logDebug = useCallback((message: string, data?: any) => {
    if (typeof window === "undefined") return // Skip during SSR

    console.log(`[DEBUG] ${message}`, data)
    if (isMounted.current) {
      setDebugLog((prev) => [...prev, `${new Date().toISOString()} - ${message}`])
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    logDebug("Component mounted, storageManager available:", !!storageManager)

    return () => {
      isMounted.current = false
    }
  }, [logDebug, storageManager])

  // Auto-save effect
  useEffect(() => {
    if (!isMounted.current || !autoSave || !request.name || typeof storageManager !== "object") {
      return
    }

    const saveTimeout = setTimeout(() => {
      try {
        logDebug("Attempting autosave")
        if (request.name && request.task && request.agents && request.agents.length > 0) {
          const savedAgentIds = request.agents
            .map((a) => {
              if (!a) return ""

              try {
                const savedAgent = storageManager?.addAgent({
                  name: a.agent_name || "Unnamed Agent",
                  description: a.description || "",
                  systemPrompt: a.system_prompt || "",
                  modelName: a.model_name || "gpt-4o",
                  role: a.role || "worker",
                  maxLoops: a.max_loops || 1,
                })
                return savedAgent?.id || ""
              } catch (agentError) {
                console.error("Error saving agent:", agentError)
                return ""
              }
            })
            .filter((id) => id !== "")

          const savedSwarm = storageManager?.addSwarm({
            name: request.name,
            description: request.description || "",
            agents: savedAgentIds,
            maxLoops: request.max_loops || 1,
            swarmType: request.swarm_type as any || "SequentialWorkflow",
            task: request.task,
            tags: [],
          })

          if (savedSwarm) {
            setLastSaved(new Date())
            setCurrentSwarmId(savedSwarm.id)
            toast.success("Swarm autosaved")
          }
        }
      } catch (error) {
        console.error("Error autosaving swarm:", error)
        toast.error("Failed to autosave swarm")
      }
    }, 5000)

    return () => clearTimeout(saveTimeout)
  }, [request, autoSave, storageManager, logDebug])

  const addAgent = () => {
    setRequest({
      ...request,
      agents: [
        ...(request.agents || []),
        {
          agent_name: "",
          description: "",
          system_prompt: "",
          model_name: "gpt-4o",
          role: "worker",
          max_loops: 1,
        },
      ],
    })
  }

  const removeAgent = (index: number) => {
    if (!request.agents) return

    const newAgents = [...request.agents]
    newAgents.splice(index, 1)
    setRequest({ ...request, agents: newAgents })
  }

  const updateAgent = (index: number, field: keyof Agent, value: string | number) => {
    if (!request.agents) return

    const newAgents = [...request.agents]
    if (!newAgents[index]) return

    newAgents[index] = { ...newAgents[index], [field]: value }
    setRequest({ ...request, agents: newAgents })
  }

  const generatePythonCode = () => {
    const safeRequest = {
      name: request.name || "",
      description: request.description || "",
      agents: (request.agents || []).map((agent) => ({
        agent_name: agent.agent_name || "",
        description: agent.description || "",
        system_prompt: agent.system_prompt || "",
        model_name: agent.model_name || "gpt-4o",
        role: agent.role || "worker",
        max_loops: agent.max_loops || 1,
      })),
      max_loops: request.max_loops || 1,
      swarm_type: request.swarm_type || "SequentialWorkflow",
      task: request.task || "",
    }

    return `import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://swarms-api-285321057562.us-east1.run.app"

headers = {
  "x-api-key": API_KEY,
  "Content-Type": "application/json"
}

payload = ${JSON.stringify(safeRequest, null, 4)}

response = requests.post(
  f"{BASE_URL}/v1/swarm/completions",
  headers=headers,
  json=payload
)

print(response.json())`
  }

  const generateNodeCode = () => {
    const safeRequest = {
      name: request.name || "",
      description: request.description || "",
      agents: (request.agents || []).map((agent) => ({
        agent_name: agent.agent_name || "",
        description: agent.description || "",
        system_prompt: agent.system_prompt || "",
        model_name: agent.model_name || "gpt-4o",
        role: agent.role || "worker",
        max_loops: agent.max_loops || 1,
      })),
      max_loops: request.max_loops || 1,
      swarm_type: request.swarm_type || "SequentialWorkflow",
      task: request.task || "",
    }

    return `const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://swarms-api-285321057562.us-east1.run.app';

const headers = {
'x-api-key': API_KEY,
'Content-Type': 'application/json'
};

const payload = ${JSON.stringify(safeRequest, null, 2)};

async function runSwarm() {
try {
  const response = await fetch(\`\${BASE_URL}/v1/swarm/completions\`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || \`Error: \${response.status} \${response.statusText}\`);
  }
  
  return await response.json();
} catch (error) {
  console.error('Error:', error);
  throw error;
}
}`
  }

  const generateRustCode = () => {
    const safeRequest = {
      name: request.name || "",
      description: request.description || "",
      agents: (request.agents || []).map((agent) => ({
        agent_name: agent.agent_name || "",
        description: agent.description || "",
        system_prompt: agent.system_prompt || "",
        model_name: agent.model_name || "gpt-4o",
        role: agent.role || "worker",
        max_loops: agent.max_loops || 1,
      })),
      max_loops: request.max_loops || 1,
      swarm_type: request.swarm_type || "SequentialWorkflow",
      task: request.task || "",
    }

    return `use reqwest::{Client, header};
use serde_json::json;

const BASE_URL: &str = "https://swarms-api-285321057562.us-east1.run.app";
const API_KEY: &str = "your_api_key_here";

async fn run_swarm() -> Result<String, Box<dyn std::error::Error>> {
  let client = Client::new();
  
  let payload = json!(${JSON.stringify(safeRequest, null, 4)});

  let response = client
      .post(format!("{}/v1/swarm/completions", BASE_URL))
      .header("x-api-key", API_KEY)
      .header("Content-Type", "application/json")
      .json(&payload)
      .send()
      .await?;
      
  if !response.status().is_success() {
    return Err(format!("API Error: {}", response.status()).into());
  }

  let result = response.text().await?;
  Ok(result)
}`
  }

  const validateRequest = () => {
    if (!request.name) return "Swarm name is required"
    if (!request.task) return "Task description is required"
    if (!request.agents || request.agents.length === 0) return "At least one agent is required"

    // Check if any agent is missing required fields
    for (let i = 0; i < request.agents.length; i++) {
      const agent = request.agents[i]
      if (!agent) return `Agent at position ${i} is invalid`
      if (!agent.agent_name) return `Agent ${i + 1} is missing a name`
      if (!agent.system_prompt) return `Agent ${i + 1} is missing a system prompt`
    }

    return null
  }

  const runSwarm = async () => {
    // Clear previous errors
    setApiError(null)

    // Validate request
    const validationError = validateRequest()
    if (validationError) {
      toast.error(validationError)
      return
    }

    if (typeof window !== "undefined") {
      if (!apiKey) {
        toast.error("Please configure your API key first")
        setApiError("API key not configured. Please set your API key in the dashboard.")
        return
      }
    }

    setIsLoading(true)
    const startTime = Date.now()
    let savedSwarm

    try {
      // Save the swarm first
      savedSwarm = storageManager?.addSwarm({
        name: request.name,
        description: request.description || "",
        agents: (request.agents || [])
          .map((a) => {
            if (!a) return ""
            const savedAgent = storageManager?.addAgent({
              name: a.agent_name || "Unnamed Agent",
              description: a.description || "",
              systemPrompt: a.system_prompt || "",
              modelName: a.model_name || "gpt-4o",
              role: a.role || "worker",
              maxLoops: a.max_loops || 1,
            })
            return savedAgent?.id || ""
          })
          .filter((id) => id !== ""),
        maxLoops: request.max_loops || 1,
        swarmType: request.swarm_type as any || "SequentialWorkflow",
        task: request.task,
        tags: [],
      })

      if (!savedSwarm) {
        throw new Error("Failed to save swarm locally")
      }

      // Prepare payload with defensive coding
      const payload = {
        name: request.name,
        description: request.description || "",
        agents: (request.agents || []).map((agent) => ({
          agent_name: agent.agent_name || "Unnamed Agent",
          description: agent.description || "",
          system_prompt: agent.system_prompt || "",
          model_name: agent.model_name || "gpt-4o",
          role: agent.role || "worker",
          max_loops: agent.max_loops || 1,
        })),
        max_loops: request.max_loops || 1,
        swarm_type: request.swarm_type || "SequentialWorkflow",
        task: request.task,
      }

      // Make the API call - only in client-side
      if (typeof window !== "undefined" && apiKey) {
        const response = await fetch("https://swarms-api-285321057562.us-east1.run.app/v1/swarm/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify(payload),
        })

        const data = await response.json()
        const executionTime = (Date.now() - startTime) / 1000 // Convert to seconds

        if (!response.ok) {
          console.error("API Error Response:", data)
          throw new Error(data.error || `API request failed: ${response.status} ${response.statusText}`)
        }

        // Calculate tokens and credits
        const tokensUsed = data.usage?.total_tokens || 0
        const creditsUsed = tokensUsed * 0.000001 // Example credit calculation

        // Track execution
        storageManager?.addSwarmExecution({
          swarmId: savedSwarm.id,
          tokensUsed,
          creditsUsed,
          success: true,
          executionTime,
        })

        // Save the output
        storageManager?.addOutput({
          swarmId: savedSwarm.id,
          output: JSON.stringify(data, null, 2),
          status: "success",
          tokensUsed,
          creditsUsed,
          executionTime,
        })
      }

      setCurrentSwarmId(savedSwarm.id)
      toast.success("Swarm executed successfully")
    } catch (error) {
      console.error("Error running swarm:", error)

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setApiError(errorMessage)

      // Track failed execution
      if (savedSwarm?.id) {
        storageManager?.addSwarmExecution({
          swarmId: savedSwarm.id,
          tokensUsed: 0,
          creditsUsed: 0,
          success: false,
          executionTime: (Date.now() - startTime) / 1000,
        })

        // Save the error output
        storageManager?.addOutput({
          swarmId: savedSwarm.id,
          output: errorMessage,
          status: "failed",
          tokensUsed: 0,
          creditsUsed: 0,
          executionTime: (Date.now() - startTime) / 1000,
        })
      }

      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSwarm = () => {
    const validationError = validateRequest()
    if (validationError) {
      toast.error(validationError)
      return
    }

    try {
      const savedSwarm = storageManager?.addSwarm({
        name: request.name,
        description: request.description || "",
        agents: (request.agents || [])
          .map((a) => {
            if (!a) return ""
            const savedAgent = storageManager?.addAgent({
              name: a.agent_name || "Unnamed Agent",
              description: a.description || "",
              systemPrompt: a.system_prompt || "",
              modelName: a.model_name || "gpt-4o",
              role: a.role || "worker",
              maxLoops: a.max_loops || 1,
            })
            return savedAgent?.id || ""
          })
          .filter((id) => id !== ""),
        maxLoops: request.max_loops || 1,
        swarmType: request.swarm_type as any || "SequentialWorkflow",
        task: request.task,
        tags: [],
      })

      if (!savedSwarm) {
        throw new Error("Failed to save swarm")
      }

      toast.success("Swarm saved successfully")
      router.push("/swarms")
    } catch (error) {
      console.error("Error saving swarm:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save swarm")
    }
  }

  // Function to load a template into the form
  const loadTemplate = (template: any) => {
    setRequest({
      name: template.name,
      description: template.description,
      agents: template.agents,
      max_loops: template.max_loops,
      swarm_type: template.swarm_type,
      task: template.task,
    })

    setCreationMode("form")
    toast.success(`"${template.name}" template loaded successfully`)
  }

  // Helper function to generate code for a template
  const generateTemplateCode = (template: any) => {
    const payload = {
      name: template.name,
      description: template.description,
      agents: template.agents,
      max_loops: template.max_loops,
      swarm_type: template.swarm_type,
      task: template.task,
    }

    return `import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://swarms-api-285321057562.us-east1.run.app"

headers = {
  "x-api-key": API_KEY,
  "Content-Type": "application/json"
}

payload = ${JSON.stringify(payload, null, 2)}

response = requests.post(
  f"{BASE_URL}/v1/swarm/completions",
  headers=headers,
  json=payload
)

print(response.json())`
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Swarm</h1>
            <p className="text-zinc-400">Configure your swarm and test it</p>
          </div>
          <div className="space-x-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch checked={autoSave} onCheckedChange={setAutoSave} className="data-[state=checked]:bg-red-600" />
                <span className="text-sm text-zinc-400">
                  Autosave {lastSaved && `(Last saved: ${lastSaved.toLocaleTimeString()})`}
                </span>
              </div>
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-400"
                onClick={() => router.push("/swarms")}
              >
                Cancel
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={saveSwarm}>
                Save Swarm
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={runSwarm} disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4" />
                    Running...
                  </span>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Run Swarm
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {apiError && (
          <Card className="bg-red-900/10 border-red-500">
            <CardContent className="p-4 flex gap-3 items-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <h4 className="font-semibold text-red-500">API Error</h4>
                <p className="text-sm text-zinc-300">{apiError}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs
          defaultValue={creationMode}
          onValueChange={(value) => setCreationMode(value as "form" | "templates")}
        >
          <TabsList>
            <TabsTrigger value="form">Form Builder</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle>Swarm Configuration</CardTitle>
                <CardDescription>Define the parameters for your swarm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">
                      Swarm Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={request.name || ""}
                      onChange={(e) => setRequest({ ...request, name: e.target.value })}
                      className="dark:border-zinc-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="swarm_type">
                      Swarm Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={request.swarm_type}
                      onValueChange={(value) =>
                        setRequest({
                          ...request,
                          swarm_type: value as
                            | "ConcurrentWorkflow"
                            | "SequentialWorkflow"
                            | "AgentRearrange"
                            | "MixtureOfAgents"
                            | "SpreadSheetSwarm"
                            | "GroupChat"
                            | "MultiAgentRouter"
                            | "AutoSwarmBuilder"
                            | "HiearchicalSwarm"
                            | "auto"
                            | "MajorityVoting",
                        })
                      }
                    >
                      <SelectTrigger id="swarm_type" className="w-full dark:border-zinc-700">
                        <SelectValue placeholder="Select swarm type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SequentialWorkflow">Sequential Workflow</SelectItem>
                        <SelectItem value="ConcurrentWorkflow">Concurrent Workflow</SelectItem>
                        <SelectItem value="AgentRearrange">Agent Rearrange</SelectItem>
                        <SelectItem value="MixtureOfAgents">Mixture Of Agents</SelectItem>
                        <SelectItem value="SpreadSheetSwarm">SpreadSheet Swarm</SelectItem>
                        <SelectItem value="GroupChat">Group Chat</SelectItem>
                        <SelectItem value="MultiAgentRouter">Multi-Agent Router</SelectItem>
                        <SelectItem value="AutoSwarmBuilder">Auto Swarm Builder</SelectItem>
                        <SelectItem value="HiearchicalSwarm">Hiearchical Swarm</SelectItem>
                        <SelectItem value="auto">Auto (Recommended)</SelectItem>
                        <SelectItem value="MajorityVoting">Majority Voting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={request.description || ""}
                    onChange={(e) => setRequest({ ...request, description: e.target.value })}
                    className="dark:border-zinc-700"
                  />
                </div>
                <div>
                  <Label htmlFor="task">
                    Task <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="task"
                    value={request.task || ""}
                    onChange={(e) => setRequest({ ...request, task: e.target.value })}
                    className="dark:border-zinc-700"
                  />
                </div>
                <div>
                  <Label htmlFor="max_loops">Max Loops</Label>
                  <Input
                    type="number"
                    id="max_loops"
                    min={1}
                    value={String(request.max_loops || 1)}
                    onChange={(e) => setRequest({ ...request, max_loops: Number.parseInt(e.target.value) || 1 })}
                    className="dark:border-zinc-700"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle>
                    Agents Configuration <span className="text-red-500">*</span>
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={addAgent} className="border-zinc-700 text-zinc-400">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Agent
                  </Button>
                </div>
                <CardDescription>Configure the agents for your swarm (at least one agent is required)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="mb-4">
                  <Label>Search Pre-built Agents</Label>
                  <AgentSearch
                    onSelect={(agent) => {
                      if (!agent) return

                      setRequest({
                        ...request,
                        agents: [
                          ...(request.agents || []),
                          {
                            agent_name: agent.name || "Unnamed Agent",
                            description: agent.description || "",
                            system_prompt: agent.systemPrompt || "",
                            model_name: agent.modelName || "gpt-4o",
                            role: "worker",
                            max_loops: agent.maxLoops || 1,
                          },
                        ],
                      })
                      toast.success(`Added agent: ${agent.name || "Unnamed Agent"}`)
                    }}
                  />
                </div>
                {(request.agents || []).map((agent, index) => (
                  <div key={index} className="border border-zinc-700 rounded-md p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Agent {index + 1}</h3>
                      <Button variant="destructive" size="sm" onClick={() => removeAgent(index)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`agent_name_${index}`}>
                          Agent Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`agent_name_${index}`}
                          value={agent?.agent_name || ""}
                          onChange={(e) => updateAgent(index, "agent_name", e.target.value)}
                          className="dark:border-zinc-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`model_name_${index}`}>Model Name</Label>
                        <Select
                          value={agent?.model_name || "gpt-4o"}
                          onValueChange={(value) => updateAgent(index, "model_name", value)}
                        >
                          <SelectTrigger id={`model_name_${index}`} className="w-full dark:border-zinc-700">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                            <SelectItem value="gpt-4">gpt-4</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`description_${index}`}>Description</Label>
                      <Textarea
                        id={`description_${index}`}
                        value={agent?.description || ""}
                        onChange={(e) => updateAgent(index, "description", e.target.value)}
                        className="dark:border-zinc-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`system_prompt_${index}`}>
                        System Prompt <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id={`system_prompt_${index}`}
                        value={agent?.system_prompt || ""}
                        onChange={(e) => updateAgent(index, "system_prompt", e.target.value)}
                        className="dark:border-zinc-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`max_loops_${index}`}>Max Loops</Label>
                      <Input
                        type="number"
                        id={`max_loops_${index}`}
                        min={1}
                        value={String(agent?.max_loops || 1)}
                        onChange={(e) => updateAgent(index, "max_loops", Number.parseInt(e.target.value) || 1)}
                        className="dark:border-zinc-700"
                      />
                    </div>
                  </div>
                ))}

                {(request.agents || []).length === 0 && (
                  <div className="text-center py-8 border border-dashed border-zinc-700 rounded-md">
                    <p className="text-zinc-500">No agents added yet. Add at least one agent to your swarm.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addAgent}
                      className="mt-4 border-zinc-700 text-zinc-400"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Agent
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {swarmTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="border border-red-500/50 hover:border-red-600 hover:shadow-lg transition-all duration-200 h-full flex flex-col"
                >
                  <CardHeader>
                    <CardTitle className="text-red-600">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-400">Workflow Type</span>
                        <Badge variant="outline" className="border-red-500/50 text-red-500">
                          {template.swarm_type}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-400">Agents</span>
                        <span className="text-sm">{template.agents.length}</span>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-zinc-400 line-clamp-3">{template.use_case}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-zinc-800 pt-4 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-700 text-zinc-400"
                      onClick={() => {
                        const generatedCode = generateTemplateCode(template)
                        navigator.clipboard.writeText(generatedCode)
                        toast.success("Code copied to clipboard!")
                      }}
                    >
                      Copy Code
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                      onClick={() => loadTemplate(template)}
                    >
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Code Generation</CardTitle>
            <CardDescription>Generate code snippets to run this swarm</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="python" className="w-full">
              <TabsList>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="node">Node.js</TabsTrigger>
                <TabsTrigger value="rust">Rust</TabsTrigger>
              </TabsList>
              <TabsContent value="python">
                <div className="relative w-full">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 border-zinc-700 text-zinc-400"
                    onClick={() => {
                      navigator.clipboard.writeText(generatePythonCode())
                      toast.success("Copied to clipboard!")
                    }}
                  >
                    Copy code
                  </Button>
                  <pre className="rounded-md bg-zinc-900 p-4 mt-2">
                    <code className="text-sm text-zinc-200">{generatePythonCode()}</code>
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="node">
                <div className="relative w-full">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 border-zinc-700 text-zinc-400"
                    onClick={() => {
                      navigator.clipboard.writeText(generateNodeCode())
                      toast.success("Copied to clipboard!")
                    }}
                  >
                    Copy code
                  </Button>
                  <pre className="rounded-md bg-zinc-900 p-4 mt-2">
                    <code className="text-sm text-zinc-200">{generateNodeCode()}</code>
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="rust">
                <div className="relative w-full">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 border-zinc-700 text-zinc-400"
                    onClick={() => {
                      navigator.clipboard.writeText(generateRustCode())
                      toast.success("Copied to clipboard!")
                    }}
                  >
                    Copy code
                  </Button>
                  <pre className="rounded-md bg-zinc-900 p-4 mt-2">
                    <code className="text-sm text-zinc-200">{generateRustCode()}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {currentSwarmId && (
          <Card>
            <CardHeader>
              <CardTitle>Swarm Output</CardTitle>
              <CardDescription>View the output of the swarm execution</CardDescription>
            </CardHeader>
            <CardContent>
              <SwarmOutputViewer swarmId={currentSwarmId} />
            </CardContent>
          </Card>
        )}

        {/* Debug log section - only visible in development */}
        {typeof window !== "undefined" && process.env.NODE_ENV === "development" && debugLog.length > 0 && (
          <Card className="mt-6 border-yellow-500/50">
            <CardHeader>
              <CardTitle>Debug Log</CardTitle>
              <CardDescription>Detailed logging for debugging purposes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black/50 p-4 rounded-md h-[200px] overflow-auto">
                {debugLog.map((log, i) => (
                  <div key={i} className="text-xs font-mono text-yellow-500 mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

