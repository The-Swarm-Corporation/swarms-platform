"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeProps,
  MarkerType,
  EdgeTypes,
  EdgeProps,
  getBezierPath,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "../ui/Button"
import { Textarea } from "../ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../spread_sheet_swarm/ui/dropdown-menu"
import { Plus, Crown, Send, Save, Share, Upload, MoreHorizontal, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { anthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { experimental_createProviderRegistry as createProviderRegistry, generateText } from 'ai'
import { Card } from "../spread_sheet_swarm/ui/card"
import { Input } from "../spread_sheet_swarm/ui/input"


// Create provider registry
const registry = createProviderRegistry({
  anthropic,
  openai: createOpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  }),
})

type AgentType = "Worker" | "Boss"
type AgentModel = "gpt-3.5-turbo" | "gpt-4" | "claude-2" | "gpt-4-turbo"
type DataSource = "Wikipedia" | "ArXiv" | "News API" | "Custom API"
type SwarmArchitecture = "Concurrent" | "Sequential" | "Hierarchical"
type ReactFlowNode = Node<AgentData>;


interface AgentData {
  id: string;
  name: string;
  type: AgentType;
  model: AgentModel;
  systemPrompt: string;
  clusterId?: any;  // Made optional but explicit in the type
  isProcessing?: boolean;
  lastResult?: string;
  dataSource?: DataSource;
  dataSourceInput?: string;
}

interface SwarmVersion {
  id: string
  timestamp: number
  nodes: Node<AgentData>[]
  edges: Edge[]
  architecture: SwarmArchitecture
  results: { [key: string]: string }
}

declare global {
  interface Window {
    updateNodeData: (id: string, updatedData: AgentData) => void;
  }
}

interface EdgeParams {
  source: string | null;
  target: string | null;
  sourceHandle: string | null;
  targetHandle: string | null;
  animated?: boolean;
  label?: string;
}

const AnimatedHexagon = motion.polygon

const nodeTypes = {
  agent: ({ data, id }: NodeProps<AgentData>) => {
    const [isEditing, setIsEditing] = useState(false)

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="relative" onClick={() => setIsEditing(true)}>
              <svg width="80" height="80" viewBox="0 0 100 100">
                <AnimatedHexagon
                  points="50 1 95 25 95 75 50 99 5 75 5 25"
                  fill={data.type === "Boss" ? "#1E1E1E" : "#3A3A3A"}
                  stroke="#8E8E93"
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: 1, 
                    rotate: data.isProcessing ? 360 : 0,
                  }}
                  transition={{ 
                    duration: 0.5, 
                    repeat: data.isProcessing ? Infinity : 0,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-xs">
                <div className="font-bold text-white">{data.name}</div>
                <div className="text-white">{data.type}</div>
                {data.lastResult && (
                  <div className="text-white text-[8px] mt-1 max-w-[70px] h-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                    {data.lastResult}
                  </div>
                )}
              </div>
              {data.lastResult && (
                <motion.div 
                  className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  ✓
                </motion.div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p><strong>Name:</strong> {data.name}</p>
              <p><strong>Type:</strong> {data.type}</p>
              <p><strong>Model:</strong> {data.model}</p>
              <p><strong>System Prompt:</strong> {data.systemPrompt}</p>
              <p><strong>Data Source:</strong> {data.dataSource || "None"}</p>
              {data.lastResult && (
                <p><strong>Last Result:</strong> {data.lastResult}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            >
              <Card className="w-96 bg-white p-6 rounded-lg shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Edit Agent</h3>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData: any = new FormData(e.target as HTMLFormElement)
                  const updatedAgent: AgentData = {
                    ...data,
                    name: formData.get("name") as string,
                    type: formData.get("type") as AgentType,
                    model: formData.get("model") as AgentModel,
                    systemPrompt: formData.get("systemPrompt") as string,
                    dataSource: formData.get("dataSource") as DataSource | undefined,
                    dataSourceInput: formData.get("dataSourceInput") as string | undefined,
                  }
                  // Update the node data
                  // You'll need to implement this function in the main component
                  window.updateNodeData(id, updatedAgent)
                  setIsEditing(false)
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" defaultValue={data.name} />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select name="type" defaultValue={data.type}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Worker">Worker</SelectItem>
                          <SelectItem value="Boss">Boss</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="model">Model</Label>
                      <Select name="model" defaultValue={data.model}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                          <SelectItem value="claude-2">Claude 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="systemPrompt">System Prompt</Label>
                      <Textarea id="systemPrompt" name="systemPrompt" defaultValue={data.systemPrompt} />
                    </div>
                    <div>
                      <Label htmlFor="dataSource">Data Source</Label>
                      <Select name="dataSource" defaultValue={data.dataSource}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Wikipedia">Wikipedia</SelectItem>
                          <SelectItem value="ArXiv">ArXiv</SelectItem>
                          <SelectItem value="News API">News API</SelectItem>
                          <SelectItem value="Custom API">Custom API</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dataSourceInput">Data Source Input</Label>
                      <Input id="dataSourceInput" name="dataSourceInput" defaultValue={data.dataSourceInput} />
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </TooltipProvider>
    )
  },
}

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <text>
        <textPath
          href={`#${id}`}
          style={{ fontSize: '12px' }}
          startOffset="50%"
          textAnchor="middle"
        >
          {data?.label}
        </textPath>
      </text>
    </>
  );
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

export function EnhancedAgentSwarmManagementComponent() {
// Make sure your useNodesState is properly typed
  const [nodes, setNodes, onNodesChange] = useNodesState<ReactFlowNode[]>([]);
  // const [nodes, setNodes, onNodesChange] = useNodesState<AgentData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [task, setTask] = useState("")
  const [swarmJson, setSwarmJson] = useState("")
  const [versions, setVersions] = useState<SwarmVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [taskResults, setTaskResults] = useState<{ [key: string]: string }>({})
  const [swarmArchitecture, setSwarmArchitecture] = useState<SwarmArchitecture>("Concurrent")
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' } | null>(null);


  const onConnect = useCallback(
    (params: Connection) => {
      // Early return if required fields are missing
      if (!params.source || !params.target) {
        return;
      }
  
      // Create a properly typed edge object
      const newEdge: Edge = {
        id: `e${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle ?? undefined,
        targetHandle: params.targetHandle ?? undefined,
        type: 'custom',
        animated: true,
        style: { stroke: "#8E8E93" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#8E8E93",
        },
        data: { label: 'Connection' },
      };
  
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );


  const addAgent = (agent: AgentData) => {
    const newNode: ReactFlowNode = {
      id: `${nodes.length + 1}`,
      type: "agent",
      position: { x: Math.random() * 500, y: Math.random() * 300 },
      data: agent,
    };
  
    if (agent.type === "Boss") {
      const clusterId = `cluster-${nodes.length + 1}`;
      newNode.data = { ...newNode.data, clusterId };
    } else if (agent.type === "Worker") {
      const availableBosses = (nodes as unknown as ReactFlowNode[]).filter(
        (node: any) => {
          if (node.data.type !== "Boss") return false;
          const workerCount = (nodes as unknown as ReactFlowNode[]).filter(
            (n) => n.data?.clusterId === node.data?.clusterId
          ).length;
          return workerCount < 3;
        }
      );
  
      if (availableBosses.length > 0) {
        const closestBoss = availableBosses.reduce((prev, curr) => {
          const prevDistance = Math.abs(prev.position.x - newNode.position.x) + 
                             Math.abs(prev.position.y - newNode.position.y);
          const currDistance = Math.abs(curr.position.x - newNode.position.x) + 
                             Math.abs(curr.position.y - newNode.position.y);
          return currDistance < prevDistance ? curr : prev;
        });
  
        if (closestBoss.data.clusterId) {
          newNode.data = { ...newNode.data, clusterId: closestBoss.data.clusterId };
          
          const newEdge: Edge = {
            id: `e${closestBoss.id}-${newNode.id}`,
            source: closestBoss.id,
            target: newNode.id,
            type: 'custom',
            animated: true,
            style: { stroke: "#8E8E93" },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#8E8E93",
            },
            data: { label: 'Hierarchy' },
          };
  
          setEdges((eds) => [...eds, newEdge]);
        }
      }
    }
    // @ts-ignore
    setNodes((nds: Node<ReactFlowNode[], string | undefined>[]) => [...nds, newNode]);
    saveVersion();
  };

  const updateNodeData = (id: string, updatedData: AgentData) => {
    setNodes((nds: Node<ReactFlowNode[], string | undefined>[]) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...updatedData } } : node
      )
    );
    saveVersion();
  };

  // Expose the updateNodeData function to the window object
  useEffect(() => {
    (window as any).updateNodeData = updateNodeData;
  }, []);

  const runTask = async () => {
    console.log("Running task:", task)
    // Reset states and show processing indicators
    setNodes((nds) => nds.map(node => ({ ...node, data: { ...node.data, isProcessing: true, lastResult: null } })))
    setEdges((eds) => eds.map(edge => ({ ...edge, animated: true, style: { ...edge.style, stroke: "#32D74B" } })))
    setTaskResults({})
  
    try {
      let results: { id: string, result: string }[] = [];
  
      // Run the appropriate swarm architecture
      switch (swarmArchitecture) {
        case "Concurrent":
          results = await runConcurrentSwarm();
          break;
        case "Sequential":
          results = await runSequentialSwarm();
          break;
        case "Hierarchical":
          results = await runHierarchicalSwarm();
          break;
      }
  
      // Update results in real-time as they come in
      const newResults: { [key: string]: string } = {}
      for (const result of results) {
        if (result) {
          newResults[result.id] = result.result
          setNodes((nds) => nds.map(node => 
            node.id === result.id 
              ? { ...node, data: { ...node.data, isProcessing: false, lastResult: result.result } }
              : node
          ))
          setTaskResults(prevResults => ({ ...prevResults, [result.id]: result.result }))
        }
      }
  
      // Reset edge animations
      setEdges((eds) => eds.map(edge => ({ ...edge, animated: false, style: { ...edge.style, stroke: "#8E8E93" } })))
      updateCSV(newResults);
  
      console.log("Task results:", results)
    } catch (error) {
      console.error("Error running task:", error)
      // Reset processing states on error
      setNodes((nds) => nds.map(node => ({ ...node, data: { ...node.data, isProcessing: false } })))
      setEdges((eds) => eds.map(edge => ({ ...edge, animated: false, style: { ...edge.style, stroke: "#8E8E93" } })))
    }
  
    setTask("")
    updateSwarmJson()
    saveVersion()
  }

  const runConcurrentSwarm = async () => {
    return await Promise.all((nodes as any[]).map(async (node) => {
      const { text } = await generateText({
        model: registry.languageModel(`openai:${node?.data?.model}`),
        prompt: `${node?.data?.systemPrompt || ''}
        
        Task: ${task}
        
        Response:`,
      })
      return { id: node.id, result: text }
    }))
  }

  const runSequentialSwarm = async () => {
    const results: { id: string, result: string }[] = [];
    let context: string = "";
  
    for (const node of nodes as any[]) {
      const { text } = await generateText({
        model: registry.languageModel(`openai:${node.data.model}`),
        prompt: `${node.data.systemPrompt || ''}...`,
      });
      results.push({ id: node.id, result: text });
      context += `\n${node.data.name}: ${text}`;
    }
  
    return results;
  }

  const runHierarchicalSwarm = async () => {

    const bosses: any = nodes.filter((node: any) => node.data.type === "Boss")
    const workers: any = nodes.filter((node: any) => node.data.type === "Worker")

    // Bosses receive their subtasks
    const bossPrompts = await Promise.all(bosses.map(async (boss: any) => {
      const { text } = await generateText({
        model: registry.languageModel(`openai:${boss.data.model}`),
        prompt: `${boss.data.systemPrompt}
        
        You are a Boss agent. Create a subtask based on the following main task:
        
        Task: ${task}
        
        Subtask for your team:`,
      })
      return { bossId: boss.id, subtask: text }
    }))

    // Bosses delegate to Workers
    const workerPrompts = await Promise.all(workers.map(async (worker: any) => {
      const boss = bosses.find((b: any) => b.data.clusterId === worker.data.clusterId)
      if (!boss) return null

      const bossPrompt = bossPrompts.find(bp => bp.bossId === boss.id)
      if (!bossPrompt) return null

      const { text } = await generateText({
        model: registry.languageModel(`openai:${boss.data.model}`),
        prompt: `${boss.data.systemPrompt}
        
        You are a Boss agent. Delegate a specific task to the Worker agent named ${worker.data.name} based on the following subtask:
        
        Subtask:  ${bossPrompt.subtask}
        
        Specific task for ${worker.data.name}:`,
      })
      return { workerId: worker.id, task: text }
    }))

    // Workers perform their tasks
    const results = await Promise.all(workers.map(async (worker: any) => {
      const workerPrompt = workerPrompts.find((wp: any) => wp?.workerId === worker.id)
      if (!workerPrompt) return null

      let context = ""
      if (worker.data.dataSource) {
        context = await fetchDataFromSource(worker.data.dataSource, worker.data.dataSourceInput)
      }

      const { text } = await generateText({
        model: registry.languageModel(`openai:${worker.data.model}`),
        prompt: `${worker.data.systemPrompt}
        
        Context: ${context}
        
        Task: ${workerPrompt.task}
        
        Response:`,
      })
      return { id: worker.id, result: text }
    }))

    return results.filter((result): result is { id: string; result: string } => result !== null);
  }

  const updateSwarmJson = () => {
    const swarmData = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        data: node.data,
        position: node.position,
      })),
      edges: edges,
      architecture: swarmArchitecture,
      results: taskResults,
    }
    setSwarmJson(JSON.stringify(swarmData, null, 2))
  }

  const saveSwarmConfiguration = () => {
    updateSwarmJson()
    const blob = new Blob([swarmJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'swarm-configuration.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const shareSwarmConfiguration = () => {
    updateSwarmJson()
    navigator.clipboard.writeText(swarmJson).then(() => {
      setPopup({ message: 'Swarm configuration copied to clipboard', type: 'success' });
    }, (err) => {
      console.error('Could not copy text: ', err)
      setPopup({ message: 'Failed to copy configuration', type: 'error' });
    })
  }

  const loadSwarmConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const swarmData = JSON.parse(content)
          setNodes(swarmData.nodes)
          setEdges(swarmData.edges)
          setSwarmArchitecture(swarmData.architecture || "Concurrent")
          setTaskResults(swarmData.results || {})
          updateSwarmJson()
          saveVersion()
          setPopup({ message: 'Swarm configuration loaded successfully', type: 'success' });
        } catch (error) {
          console.error('Error parsing JSON:', error)
          setPopup({ message: 'Invalid JSON file', type: 'error' });
        }
      }
      reader.readAsText(file)
    }
  }

  const saveVersion = () => {
    const newVersion: SwarmVersion = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      nodes: nodes as any[],
      edges: edges,
      architecture: swarmArchitecture,
      results: taskResults,
    }
    setVersions(prevVersions => [...prevVersions, newVersion])
    setSelectedVersion(newVersion.id)
  }

  const loadVersion = (versionId: string) => {
    const version: any = versions.find(v => v.id === versionId)
    if (version) {
      setNodes(version.nodes)
      setEdges(version.edges)
      setSwarmArchitecture(version.architecture)
      setTaskResults(version.results)
      updateSwarmJson()
    }
  }

  const fetchDataFromSource = async (source: DataSource, input?: string): Promise<string> => {
    // This is a mock function. In a real application, you would implement actual API calls here.
    switch (source) {
      case "Wikipedia":
        return "Mock data from Wikipedia API"
      case "ArXiv":
        return "Mock data from ArXiv API"
      case "News API":
        return "Mock data from News API"
      case "Custom API":
        return `Mock data from Custom API: ${input}`
      default:
        return "No data source specified"
    }
  }

  const updateCSV = (results: { [key: string]: string }) => {
    const csvContent = Object.entries(results)
      .map(([agentId, result]) => {
        const agent: any = nodes.find(node => node.id === agentId);
        return `${agent?.data.name || 'Unknown'},${result.replace(/,/g, ';')}`;
      })
      .join('\n');
    
    const blob = new Blob([`Agent,Result\n${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'task_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  useEffect(() => {
    const layout = () => {
      setNodes((nds) => {
        const centerX = 400
        const centerY = 300
        const radius = 200

        // Position agents based on swarm architecture
        switch (swarmArchitecture) {
          case "Concurrent":
            // Position all agents in a circle
            nds.forEach((node, index) => {
              const angle = (index / nds.length) * 2 * Math.PI
              node.position = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
              }
            })
            break;
          case "Sequential":
            // Position agents in a line
            nds.forEach((node, index) => {
              node.position = {
                x: 100 + index * 150,
                y: centerY,
              }
            })
            break;
          case "Hierarchical":
            const bosses = nds.filter((n: any) => n.data.type === "Boss")
            const workers = nds.filter((n: any) => n.data.type === "Worker")
            
            // Position bosses in a circle around the queen
            bosses.forEach((boss, index) => {
              const angle = (index / bosses.length) * 2 * Math.PI
              boss.position = {
                x: centerX + radius * 0.6 * Math.cos(angle),
                y: centerY + radius * 0.6 * Math.sin(angle),
              }
            })
            
            // Position workers near their bosses
            workers.forEach((worker: any) => {
              const boss = bosses.find((b: any) => b.data.clusterId === worker.data.clusterId)
              if (boss) {
                worker.position = {
                  x: boss.position.x + (Math.random() - 0.5) * 100,
                  y: boss.position.y + (Math.random() - 0.5) * 100,
                }
              }
            })
            break;
        }

        return nds
      })
    }

    layout()
    updateSwarmJson()
  }, [setNodes, nodes, edges, swarmArchitecture])

  return (
    <div className="w-full h-screen flex flex-col bg-white text-gray-900">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">LLM Agent Swarm</h1>
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100">
                <Plus className="w-4 h-4 mr-2" />
                Add Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Agent</DialogTitle>
                <DialogDescription>Create a new LLM agent to add to your swarm.</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                addAgent({
                  id: `${nodes.length + 1}`,
                  name: formData.get("name") as string,
                  type: formData.get("type") as AgentType,
                  model: formData.get("model") as AgentModel,
                  systemPrompt: formData.get("systemPrompt") as string,
                  dataSource: formData.get("dataSource") as DataSource | undefined,
                  dataSourceInput: formData.get("dataSourceInput") as string | undefined,
                })
              }}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" name="name" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Type</Label>
                    <Select name="type">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select agent type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Worker">Worker</SelectItem>
                        <SelectItem value="Boss">Boss</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="model" className="text-right">Model</Label>
                    <Select name="model">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="claude-2">Claude 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="systemPrompt" className="text-right">System Prompt</Label>
                    <Textarea id="systemPrompt" name="systemPrompt" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dataSource" className="text-right">Data Source</Label>
                    <Select name="dataSource">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select data source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Wikipedia">Wikipedia</SelectItem>
                        <SelectItem value="ArXiv">ArXiv</SelectItem>
                        <SelectItem value="News API">News API</SelectItem>
                        <SelectItem value="Custom API">Custom API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dataSourceInput" className="text-right">Data Source Input</Label>
                    <Input id="dataSourceInput" name="dataSourceInput" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Agent</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100">
                <MoreHorizontal className="w-4 h-4 mr-2" />
                Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Swarm Configuration</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={saveSwarmConfiguration}>
                <Save className="w-4 h-4 mr-2" />
                Save JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareSwarmConfiguration}>
                <Share className="w-4 h-4 mr-2" />
                Share JSON
              </DropdownMenuItem>
              <DropdownMenuItem>
                <label htmlFor="load-json" className="flex items-center cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Load JSON
                </label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            id="load-json"
            type="file"
            accept=".json"
            className="hidden"
            onChange={loadSwarmConfiguration}
          />
          <Select value={swarmArchitecture} onValueChange={(value: SwarmArchitecture) => setSwarmArchitecture(value)}>
            <SelectTrigger className="w-[180px] bg-gray-50 text-gray-900 border-gray-200">
              <SelectValue placeholder="Select architecture" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Concurrent">Concurrent</SelectItem>
              <SelectItem value="Sequential">Sequential</SelectItem>
              <SelectItem value="Hierarchical">Hierarchical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex-grow flex overflow-hidden">
        <div className="w-96 border-r border-gray-200 p-4 overflow-y-auto">
          <Tabs defaultValue="results" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
            </TabsList>
            <TabsContent value="results">
              <h2 className="text-lg font-semibold mb-4">Task Results</h2>
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(taskResults).map(([agentId, result]) => {
                      const agent: any = nodes.find(node => node.id === agentId)
                      return (
                        <TableRow key={agentId}>
                          <TableCell className="font-medium">{agent?.data.name || 'Unknown Agent'}</TableCell>
                          <TableCell>{result}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="versions">
              <h2 className="text-lg font-semibold mb-4">Versions</h2>
              <Select value={selectedVersion || undefined} onValueChange={loadVersion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {new Date(version.timestamp).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>
          </Tabs>
        </div>
        <div className="flex-grow relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          >
            <Background color="#f1f5f9" gap={16} />
            <Controls />
          </ReactFlow>
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 flex justify-center items-center">
        <Input
          type="text"
          placeholder="Enter a task for the swarm..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="w-1/2 mr-2"
        />
        <Button onClick={runTask} className="bg-blue-500 hover:bg-blue-600 text-white">
          <Send className="w-4 h-4 mr-2" />
          Run Task
        </Button>
      </div>
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 p-4 rounded-md shadow-md ${
              popup.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            {popup.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}