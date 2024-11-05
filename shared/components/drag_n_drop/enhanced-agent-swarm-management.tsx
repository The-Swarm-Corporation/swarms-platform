"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
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
import { Button } from "../spread_sheet_swarm/ui/button"
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
import { trpc as api } from '@/shared/utils/trpc/trpc';
import debounce from 'lodash/debounce';
import { useRouter, useSearchParams } from 'next/navigation';


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



// Define types that exactly match your Zod schema
type NodeData = {
  id: string;
  name: string;
  type: string;
  model: string;
  systemPrompt: string;
  clusterId?: string;
  isProcessing?: boolean;
  lastResult?: string;
  dataSource?: string;
  dataSourceInput?: string;
  [key: string]: unknown; // Add index signature to match passthrough behavior
};

type SaveFlowNode = {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: NodeData;
  [key: string]: unknown; // Add index signature to match passthrough behavior
};

type SaveFlowEdge = {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: {
    stroke: string;
  };
  markerEnd?: {
    type: string;
    color: string;
  };
  data?: {
    label: string;
  };
  [key: string]: unknown; // Add index signature to match passthrough behavior
};


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

const AgentNode: React.FC<NodeProps<AgentData>> = ({ data, id }) => {
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
}

const nodeTypes = {
  agent: AgentNode
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

// Add this type to better handle flow data
interface FlowData {
  nodes: any;
  edges: Edge[];
  architecture: SwarmArchitecture;
  results: { [key: string]: string };
}

// Add this utility function at the top level
const isEqual = (prev: any, next: any) => JSON.stringify(prev) === JSON.stringify(next);

export function EnhancedAgentSwarmManagementComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Make sure your useNodesState is properly typed
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  // const [nodes, setNodes, onNodesChange] = useNodesState<AgentData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [task, setTask] = useState("")
  const [swarmJson, setSwarmJson] = useState("")
  const [versions, setVersions] = useState<SwarmVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [taskResults, setTaskResults] = useState<{ [key: string]: string }>({})
  const [swarmArchitecture, setSwarmArchitecture] = useState<SwarmArchitecture>("Concurrent")
  const [popup, setPopup] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Add TRPC mutations and queries
  const saveFlowMutation = api.dnd.saveFlow.useMutation();
  const getCurrentFlowQuery = api.dnd.getCurrentFlow.useQuery(
    { 
      flowId: searchParams?.get('flowId') || undefined 
    },
    {
      enabled: !!searchParams?.get('flowId'),
    }
  );

  useEffect(() => {
    if (getCurrentFlowQuery.data) {
      const swarmData = {
        nodes: getCurrentFlowQuery.data.nodes,
        edges: getCurrentFlowQuery.data.edges,
        architecture: getCurrentFlowQuery.data.architecture,
        results: getCurrentFlowQuery.data.results,
      };
      setSwarmJson(JSON.stringify(swarmData, null, 2));
    }
  }, [getCurrentFlowQuery.data]);
  
  const getAllFlowsQuery = api.dnd.getAllFlows.useQuery();
  const setCurrentFlowMutation = api.dnd.setCurrentFlow.useMutation();

  // Add new state for tracking current flow ID
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);

  // Add a ref to track initial load
  const initialLoadRef = useRef(false);

  // Update the stateRef type and assignment
  const stateRef = useRef<{
    nodes: ReactFlowNode[];
    edges: Edge[];
    taskResults: { [key: string]: string };
  }>({
    nodes: [],
    edges: [],
    taskResults: {}
  });

  // Update the assignment
  stateRef.current = {
    nodes: nodes as any,
    edges,
    taskResults
  };

  // Inside the component, add these state tracking refs
  const previousStateRef = useRef({
    nodes: [] as ReactFlowNode[],
    edges: [] as Edge[],
  });

  const saveInProgressRef = useRef(false);

  // Add new function to handle new flow creation
  const createNewFlow = useCallback(async () => {
    try {
      // Clear all states
      setNodes([]);
      setEdges([]);
      setTaskResults({});
      setSwarmArchitecture("Concurrent");
      setSwarmJson("");
      setTask("");
      setCurrentFlowId(null);
      
      // Reset refs
      previousStateRef.current = {
        nodes: [],
        edges: []
      };
      initialLoadRef.current = false;

      // Save new empty flow to get an ID
      const result = await saveFlowMutation.mutateAsync({
        nodes: [],
        edges: [], 
        architecture: "Concurrent",
        results: {}
      });

      if (result) {
        // Update URL with new flow ID
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('flowId', result.id);
        router.replace(newUrl.pathname + newUrl.search);
        
        // Refresh flows list
        await getAllFlowsQuery.refetch();
        
        setPopup({ message: 'New flow created', type: 'success' });
      }

    } catch (error) {
      console.error('Error creating new flow:', error);
      setPopup({ message: 'Error creating new flow', type: 'error' });
    }
  }, [router, setNodes, setEdges, saveFlowMutation, getAllFlowsQuery]);

  // Update state ref whenever state changes
  useEffect(() => {
    stateRef.current = {
      nodes: nodes as any[],
      edges,
      taskResults
    };
  }, [nodes, edges, taskResults]);

  // Modify the useEffect for loading initial flow data
  useEffect(() => {
    const flowId = searchParams?.get('flowId');
    
    if (flowId && getCurrentFlowQuery.data && !initialLoadRef.current) {
      // Set the flag to prevent multiple loads
      initialLoadRef.current = true;
      
      try {
        const flowData = getCurrentFlowQuery.data;
        
        // Update all relevant state with the loaded flow data
        setNodes(flowData.nodes || []);
        setEdges(flowData.edges || []);
        setSwarmArchitecture(flowData.architecture || "Concurrent");
        setTaskResults(flowData.results || {});
        setCurrentFlowId(flowId);
        
        // Initialize previous state
        previousStateRef.current = {
          nodes: flowData.nodes || [],
          edges: flowData.edges || []
        };
        
        // Update the JSON representation
        const swarmData = {
          nodes: flowData.nodes,
          edges: flowData.edges,
          architecture: flowData.architecture,
          results: flowData.results,
        };
        setSwarmJson(JSON.stringify(swarmData, null, 2));
        
        setPopup({ message: 'Flow loaded successfully', type: 'success' });
      } catch (error) {
        console.error('Error loading flow data:', error);
        setPopup({ message: 'Error loading flow data', type: 'error' });
      }
    }
  }, [searchParams, getCurrentFlowQuery.data]);



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


  const addAgent = useCallback((agent: AgentData) => {
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
    //saveVersion();
  }, [nodes, setNodes]);

  const updateNodeData = (id: string, updatedData: AgentData) => {
    setNodes((nds: Node<ReactFlowNode[], string | undefined>[]) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...updatedData } } : node
      )
    );
    //saveVersion();
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
   //   updateCSV(newResults);
  
      console.log("Task results:", results)
    } catch (error) {
      console.error("Error running task:", error)
      // Reset processing states on error
      setNodes((nds) => nds.map(node => ({ ...node, data: { ...node.data, isProcessing: false } })))
      setEdges((eds) => eds.map(edge => ({ ...edge, animated: false, style: { ...edge.style, stroke: "#8E8E93" } })))
    }
  
    setTask("")
    updateSwarmJson()
    //saveVersion()
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
      // if (worker.data.dataSource) {
      //   context = await fetchDataFromSource(worker.data.dataSource, worker.data.dataSourceInput)
      // }

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
          //saveVersion()
          setPopup({ message: 'Swarm configuration loaded successfully', type: 'success' });
        } catch (error) {
          console.error('Error parsing JSON:', error)
          setPopup({ message: 'Invalid JSON file', type: 'error' });
        }
      }
      reader.readAsText(file)
    }
  }

  const saveVersionStable = useCallback(async () => {
    try {
      // Transform nodes to match the expected schema
      const validNodes: SaveFlowNode[] = nodes.map((node) => {
        const { id, type, position, data, ...rest } = node;
        return {
          id,
          type: type || 'default',
          position: {
            x: position.x,
            y: position.y,
          },
          data: {
            id: data?.id || id,
            name: data?.name || '',
            type: data?.type || 'default',
            model: data?.model || '',
            systemPrompt: data?.systemPrompt || '',
            clusterId: data?.clusterId,
            isProcessing: data?.isProcessing || false,
            lastResult: data?.lastResult || '',
            dataSource: data?.dataSource,
            dataSourceInput: data?.dataSourceInput,
            ...data
          },
          ...rest
        };
      });
  
      // Transform edges to match the expected schema
      const validEdges: any[] = edges.map((edge) => {
        const { id, source, target, ...rest } = edge;
        return {
          id,
          source,
          target,
          type: rest.type,
          animated: rest.animated,
          style: rest.style ? {
            stroke: rest.style.stroke || '#000000',
          } : undefined,
          markerEnd: rest.markerEnd ? {
            type: typeof rest.markerEnd === 'string' ? rest.markerEnd : (rest.markerEnd as any)?.type || 'arrow',
            color: (rest.markerEnd as any)?.color || '#000000',
          } : undefined,
          data: rest.data || { label: 'Connection' },
        };
      });
  
      // Create the flow data object
      const flowData = {
        flow_id: currentFlowId || undefined,
        nodes: validNodes,
        edges: validEdges,
        architecture: swarmArchitecture,
        results: taskResults || {},
      } as const; // Use const assertion to preserve literal types
  
      // Save the flow
      const result = await saveFlowMutation.mutateAsync(flowData);
      
      if (!currentFlowId && result.id) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('flowId', result.id);
        router.replace(newUrl.pathname + newUrl.search);
        setCurrentFlowId(result.id);
      }
  
      setPopup({ message: 'Flow saved successfully', type: 'success' });
      await getAllFlowsQuery.refetch();
      
    } catch (error) {
      console.error('Error saving flow:', error);
      setPopup({ message: 'Failed to save flow', type: 'error' });
    }
  }, [
    nodes,
    edges,
    swarmArchitecture,
    taskResults,
    saveFlowMutation,
    router,
    currentFlowId,
    getAllFlowsQuery,
  ]);
  
  // Type guard if needed
  const isValidSaveFlowNode = (node: unknown): node is SaveFlowNode => {
    return (
      typeof node === 'object' &&
      node !== null &&
      'id' in node &&
      'type' in node &&
      'position' in node &&
      'data' in node &&
      typeof (node as any).data.id === 'string' &&
      typeof (node as any).data.name === 'string' &&
      typeof (node as any).data.type === 'string' &&
      typeof (node as any).data.model === 'string' &&
      typeof (node as any).data.systemPrompt === 'string'
    );
  };
  // Replace the existing save-related code with this implementation
  const debouncedSave = useMemo(
    () =>
      debounce(async () => {
        // Prevent concurrent saves
        if (saveInProgressRef.current) {
          return;
        }

        const currentNodes = stateRef.current.nodes;
        const currentEdges = stateRef.current.edges;
        
        // Check if there are actual changes
        const hasChanges = !isEqual(previousStateRef.current.nodes, currentNodes) ||
                          !isEqual(previousStateRef.current.edges, currentEdges);

        if (!hasChanges || !currentFlowId) {
          return;
        }

        try {
          saveInProgressRef.current = true;
          
          // Update previous state before saving
          previousStateRef.current = {
            nodes: JSON.parse(JSON.stringify(currentNodes)),
            edges: JSON.parse(JSON.stringify(currentEdges))
          };

          await saveVersionStable();
        } finally {
          saveInProgressRef.current = false;
        }
      }, 2000),
    [currentFlowId, saveVersionStable]
  );

  // Update the effect that triggers saves
  useEffect(() => {
    if (!currentFlowId || (nodes.length === 0 && edges.length === 0)) {
      return;
    }

    // Update current state ref
    stateRef.current = {
      nodes: nodes,
      edges,
      taskResults
    };

    // Only trigger save if not the initial load
    if (previousStateRef.current.nodes.length > 0) {
      debouncedSave();
    } else {
      // Initialize previous state on first load
      previousStateRef.current = {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges))
      };
    }

    return () => {
      debouncedSave.cancel();
    };
  }, [nodes, edges, currentFlowId, debouncedSave, taskResults]);

  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => {
        setPopup(null);
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [popup]);
  

  // Add share link functionality
  const shareFlowLink = () => {
    if (currentFlowId) {
      const shareUrl = new URL(window.location.href);
      shareUrl.searchParams.set('flowId', currentFlowId);
      navigator.clipboard.writeText(shareUrl.toString());
      setPopup({ message: 'Flow link copied to clipboard', type: 'success' });
    }
  };

  // Add to dropdown menu options
  const dropdownMenuItems = (
    // ... existing dropdown items ...
    <DropdownMenuItem onClick={shareFlowLink}>
      <Share className="w-4 h-4 mr-2" />
      Share Link
    </DropdownMenuItem>
  );

  
  // Add error state handling
  if (getCurrentFlowQuery.isError) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-red-500 text-xl">Error loading flow</div>
          <Button onClick={() => router.push('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  // Add this function inside the component
  const loadVersion = async (flowId: string) => {
    try {
      // Prevent loading if a save is in progress
      if (saveInProgressRef.current) {
        setPopup({ message: 'Please wait for current save to complete', type: 'error' });
        return;
      }

      // Set current flow as active
      await setCurrentFlowMutation.mutateAsync({ flow_id: flowId });
      
      // Update URL with new flow ID
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('flowId', flowId);
      router.replace(newUrl.pathname + newUrl.search);
      
      // Fetch the specific flow data directly with the flowId
      const { data: flowData } = await getCurrentFlowQuery.refetch({
    //    queryKey: ['dnd.getCurrentFlow', { flowId }]
      });
      
      if (flowData) {
        // Update all state
        setNodes(flowData.nodes || []);
        setEdges(flowData.edges || []);
        setSwarmArchitecture(flowData.architecture || "Concurrent");
        setTaskResults(flowData.results || {});
        setCurrentFlowId(flowId);
        
        // Update previous state to prevent immediate save
        previousStateRef.current = {
          nodes: flowData.nodes || [],
          edges: flowData.edges || []
        };
        
        // Update JSON representation
        const swarmData = {
          nodes: flowData.nodes,
          edges: flowData.edges,
          architecture: flowData.architecture,
          results: flowData.results,
        };
        setSwarmJson(JSON.stringify(swarmData, null, 2));
        
        // Reset save in progress flag
        saveInProgressRef.current = false;
        
        setPopup({ message: 'Flow version loaded successfully', type: 'success' });
      } else {
        throw new Error('No flow data found');
      }
    } catch (error) {
      console.error('Error loading flow version:', error);
      setPopup({ message: 'Error loading flow version', type: 'error' });
      // Reset save in progress flag on error
      saveInProgressRef.current = false;
    }
  };

  // Update the VersionsTabContent to use the new loadVersion function
  const VersionsTabContent = () => (
    <TabsContent value="versions">
      <h2 className="text-lg font-semibold mb-4">Versions</h2>
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getAllFlowsQuery.data?.map((flow) => (
              <TableRow key={flow.id}>
                <TableCell>{flow.id}</TableCell>
                <TableCell>{new Date(flow.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    onClick={() => loadVersion(flow.id)}
                    disabled={saveFlowMutation.status === 'pending' || setCurrentFlowMutation.status === 'pending'}
                  >
                    Load
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  );

  // Replace the existing Versions TabsContent with the new component
  return (
    <div className="w-full h-screen flex flex-col bg-white text-gray-900">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">LLM Agent Swarm</h1>
        <div className="flex space-x-2">
          {/* Add New Flow button */}
          <Button
            variant="outline"
            className="bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
            onClick={createNewFlow}
            disabled={saveFlowMutation.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Flow
          </Button>

          {/* Existing Add Agent Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
              >
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
              <DropdownMenuItem onClick={shareFlowLink}>
                <Share className="w-4 h-4 mr-2" />
                Share Link
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
              <VersionsTabContent />
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