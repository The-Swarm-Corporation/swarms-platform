'use client';

// React core
import { useState, useEffect } from 'react';

// Third-party libraries
import { generateText } from 'ai';
import { v4 as uuidv4 } from 'uuid';

// UI Components
import { Button } from '../ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../spread_sheet_swarm/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../spread_sheet_swarm/ui/dropdown-menu';
import Input from '../ui/Input';
import { Label } from '../spread_sheet_swarm/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../spread_sheet_swarm/ui/table';
import { Textarea } from '../ui/textarea';
import { registry } from '@/shared/utils/registry';

// Icons
import {
  Plus,
  Download,
  Share2,
  Play,
  Trash2,
  Save,
  Upload,
  RefreshCw,
  MoreHorizontal,
  Copy,
  Sparkles,
  Loader2,
  FileText,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

// Add new interfaces
interface SpreadsheetData {
  id: string;
  name: string;
  data: any[][];
  created: number;
  updated: number;
}

interface DraggedFile {
  name: string;
  content: string;
  type: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  llm: string;
  status: 'idle' | 'running' | 'completed';
  output: string;
  attachments?: DraggedFile[];
}

interface Session {
  id: string;
  timestamp: number;
  agents: Agent[];
  task: string;
  tasksExecuted: number;
  timeSaved: number;
}

interface SwarmState {
  currentSession: Session;
  sessions: Session[];
  spreadsheets: SpreadsheetData[];
}

const initialSession: Session = {
  id: uuidv4(),
  timestamp: Date.now(),
  agents: [],
  task: '',
  tasksExecuted: 0,
  timeSaved: 0,
};

export function SwarmManagement() {
  const [swarmState, setSwarmState] = useState<SwarmState>({
    currentSession: initialSession,
    sessions: [],
    spreadsheets: [],
  });
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [newAgent, setNewAgent] = useState<Partial<Agent>>({});
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState<DraggedFile[]>([]);
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedState = localStorage.getItem('swarmState');
    if (savedState) {
      setSwarmState(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('swarmState', JSON.stringify(swarmState));
  }, [swarmState]);

  const addAgent = () => {
    if (
      newAgent.name &&
      newAgent.description &&
      newAgent.systemPrompt &&
      newAgent.llm
    ) {
      setSwarmState((prevState) => ({
        ...prevState,
        currentSession: {
          ...prevState.currentSession,
          agents: [
            ...prevState.currentSession.agents,
            {
              ...newAgent,
              id: uuidv4(),
              status: 'idle',
              output: '',
            } as Agent,
          ],
        },
      }));
      setNewAgent({});
      setIsAddAgentOpen(false);
    }
  };

  const deleteAgent = (id: string) => {
    setSwarmState((prevState) => ({
      ...prevState,
      currentSession: {
        ...prevState.currentSession,
        agents: prevState.currentSession.agents.filter(
          (agent) => agent.id !== id,
        ),
      },
    }));
  };

  // Function to duplicate agent
  const duplicateAgent = (agent: Agent) => {
    const duplicatedAgent = {
      ...agent,
      id: uuidv4(),
      name: `${agent.name} (Copy)`,
      status: 'idle' as const,
      output: '',
    };

    setSwarmState((prevState) => ({
      ...prevState,
      currentSession: {
        ...prevState.currentSession,
        agents: [...prevState.currentSession.agents, duplicatedAgent],
      },
    }));
  };

  // Function to optimize prompt
  const optimizePrompt = async () => {
    setIsOptimizing(true);
    try {
      const { text } = await generateText({
        model: registry.languageModel('openai:gpt-4-turbo'),
        prompt: `Optimize this prompt for better results: ${newAgent.systemPrompt}`,
      });
      setNewAgent((prev) => ({ ...prev, systemPrompt: text }));
    } catch (error) {
      console.error('Failed to optimize prompt:', error);
    }
    setIsOptimizing(false);
  };

  // File handling functions
  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    const newFiles = await Promise.all(
      files.map(async (file) => {
        const content = await file.text();
        return {
          name: file.name,
          content,
          type: file.type,
        };
      }),
    );

    setDraggedFiles((prev) => [...prev, ...newFiles]);
  };

  const runAgents = async () => {
    if (!swarmState.currentSession.task) {
      console.error('No task specified');
      return;
    }

    const startTime = Date.now();
    setSwarmState((prevState) => ({
      ...prevState,
      currentSession: {
        ...prevState.currentSession,
        agents: prevState.currentSession.agents.map((agent) => ({
          ...agent,
          status: 'running',
          output: '',
        })),
      },
    }));

    for (const agent of swarmState.currentSession.agents) {
      try {
        const { text } = await generateText({
          model: registry.languageModel(agent.llm),
          prompt: `${agent.systemPrompt}\n\nTask: ${swarmState.currentSession.task}\n\nAgent Name: ${agent.name}\nAgent Description: ${agent.description}\n\nResponse:`,
        });

        setSwarmState((prevState) => ({
          ...prevState,
          currentSession: {
            ...prevState.currentSession,
            agents: prevState.currentSession.agents.map((a) =>
              a.id === agent.id
                ? { ...a, status: 'completed', output: text }
                : a,
            ),
          },
        }));
      } catch (error: any) {
        console.error(`Error running agent ${agent.name}:`, error);
        setSwarmState((prevState) => ({
          ...prevState,
          currentSession: {
            ...prevState.currentSession,
            agents: prevState.currentSession.agents.map((a) =>
              a.id === agent.id
                ? {
                    ...a,
                    status: 'completed',
                    output: `Error: Failed to execute task - ${error.message || 'Unknown error'}`,
                  }
                : a,
            ),
          },
        }));
      }
    }

    const endTime = Date.now();
    const timeSaved = Math.round((endTime - startTime) / 1000);

    setSwarmState((prevState) => ({
      ...prevState,
      currentSession: {
        ...prevState.currentSession,
        tasksExecuted: prevState.currentSession.tasksExecuted + 1,
        timeSaved: prevState.currentSession.timeSaved + timeSaved,
      },
    }));
  };

  const downloadJSON = () => {
    const jsonString = JSON.stringify(swarmState, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `swarm_data_${swarmState.currentSession.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uploadJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          try {
            const parsedState = JSON.parse(content);
            setSwarmState(parsedState);
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadCSV = () => {
    const headers = [
      'Session ID',
      'Timestamp',
      'Task',
      'Agent ID',
      'Name',
      'Description',
      'System Prompt',
      'LLM',
      'Status',
      'Output',
    ];
    const csvContent = [
      headers.join(','),
      ...swarmState.currentSession.agents.map((agent) =>
        [
          swarmState.currentSession.id,
          new Date(swarmState.currentSession.timestamp).toISOString(),
          swarmState.currentSession.task,
          agent.id,
          agent.name,
          agent.description,
          `"${agent.systemPrompt.replace(/"/g, '""')}"`,
          agent.llm,
          agent.status,
          `"${agent.output.replace(/"/g, '""')}"`,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `swarm_data_${swarmState.currentSession.id}.csv`,
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareSwarm = () => {
    // Implement sharing functionality here
    console.log('Sharing swarm...');
  };
  const startNewSession = () => {
    setSwarmState((prevState) => ({
      ...prevState,
      sessions: [...prevState.sessions, prevState.currentSession],
      currentSession: {
        ...initialSession,
        id: uuidv4(),
        timestamp: Date.now(),
      },
      spreadsheets: prevState.spreadsheets,
    }));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Spreadsheet Swarm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Session ID</h3>
                  <p className="text-sm font-mono">
                    {swarmState.currentSession.id}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Number of Agents</h3>
                  <p className="text-2xl font-bold">
                    {swarmState.currentSession.agents.length}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Tasks Executed</h3>
                  <p className="text-2xl font-bold">
                    {swarmState.currentSession.tasksExecuted}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Time Saved</h3>
                  <p className="text-2xl font-bold">
                    {swarmState.currentSession.timeSaved}s
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Input and Actions */}
          <div className="flex space-x-4">
            <div className="grow">
              <Input
                placeholder="Enter task for agents..."
                value={swarmState.currentSession.task}
                onChange={(e) =>
                  setSwarmState((prevState) => ({
                    ...prevState,
                    currentSession: {
                      ...prevState.currentSession,
                      task: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <Button
              onClick={runAgents}
              disabled={runningAgents.size > 0}
              className="min-w-[120px]"
            >
              {runningAgents.size > 0 ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Running ({runningAgents.size})
                </>
              ) : (
                <>
                  <Play className="size-4 mr-2" />
                  Run Agents
                </>
              )}
            </Button>

            {/* Add Agent Dialog */}
            <Dialog open={isAddAgentOpen} onOpenChange={setIsAddAgentOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4 mr-2" /> Add Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Agent</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newAgent.name || ''}
                      onChange={(e) =>
                        setNewAgent({ ...newAgent, name: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={newAgent.description || ''}
                      onChange={(e) =>
                        setNewAgent({
                          ...newAgent,
                          description: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="systemPrompt" className="text-right">
                      System Prompt
                    </Label>
                    <div className="col-span-3 relative">
                      <Textarea
                        id="systemPrompt"
                        value={newAgent.systemPrompt || ''}
                        onChange={(e) =>
                          setNewAgent({
                            ...newAgent,
                            systemPrompt: e.target.value,
                          })
                        }
                        className="pr-10"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-2 top-2"
                        onClick={optimizePrompt}
                        disabled={isOptimizing}
                      >
                        {isOptimizing ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Sparkles className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="llm" className="text-right">
                      LLM
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setNewAgent({ ...newAgent, llm: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select LLM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai:gpt-4-turbo">
                          GPT-4 Turbo
                        </SelectItem>
                        <SelectItem value="anthropic:claude-3-opus-20240229">
                          Claude 3 Opus
                        </SelectItem>
                        <SelectItem value="anthropic:claude-3-sonnet-20240229">
                          Claude 3 Sonnet
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* File Drop Zone */}
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center col-span-4 cursor-pointer hover:border-primary/50 transition-colors"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                  >
                    <FileText className="mx-auto size-8 mb-2" />
                    <p className="text-lg font-medium mb-1">
                      Drag and drop files here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports PDF, TXT, CSV
                    </p>
                  </div>
                  {/* File List */}
                  {draggedFiles.length > 0 && (
                    <div className="col-span-4 space-y-2">
                      {draggedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-secondary rounded"
                        >
                          <span className="flex items-center">
                            <FileText className="size-4 mr-2" />
                            {file.name}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setDraggedFiles((files) =>
                                files.filter((_, i) => i !== index),
                              )
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={addAgent}>Add Agent</Button>
              </DialogContent>
            </Dialog>

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="size-4 mr-2" /> Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Swarm Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={downloadJSON}>
                  <Save className="size-4 mr-2" /> Save JSON
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    document.getElementById('file-upload')?.click()
                  }
                >
                  <Upload className="size-4 mr-2" /> Load JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadCSV}>
                  <Download className="size-4 mr-2" /> Download CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareSwarm}>
                  <Share2 className="size-4 mr-2" /> Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={startNewSession}>
                  <RefreshCw className="size-4 mr-2" /> New Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Hidden file input */}
          <input
            id="file-upload"
            type="file"
            accept=".json"
            className="hidden"
            onChange={uploadJSON}
          />

          {/* Tabs */}
          <Tabs defaultValue="current">
            <TabsList>
              <TabsTrigger value="current">Current Session</TabsTrigger>
              <TabsTrigger value="history">Session History</TabsTrigger>
            </TabsList>
            <TabsContent value="current">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>System Prompt</TableHead>
                    <TableHead>LLM</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Output</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {swarmState.currentSession.agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>{agent.name}</TableCell>
                      <TableCell>{agent.description}</TableCell>
                      <TableCell>{agent.systemPrompt}</TableCell>
                      <TableCell>{agent.llm}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {agent.status === 'running' ? (
                            <Loader2 className="size-4 mr-2 animate-spin" />
                          ) : null}
                          {agent.status}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {agent.output}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => duplicateAgent(agent)}
                          >
                            <Copy className="size-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteAgent(agent.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="history">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Agents</TableHead>
                    <TableHead>Tasks Executed</TableHead>
                    <TableHead>Time Saved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {swarmState.sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{session.id}</TableCell>
                      <TableCell>
                        {new Date(session.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{session.agents.length}</TableCell>
                      <TableCell>{session.tasksExecuted}</TableCell>
                      <TableCell>{session.timeSaved}s</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
