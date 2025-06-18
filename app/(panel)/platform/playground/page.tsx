'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { Code2, Play, Save, Copy, Download, Key, Plus, Trash2, User, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';

const SWARMS_API_URL = 'https://swarms-api-285321057562.us-east1.run.app';

export default function Playground() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('single');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [codeLanguage, setCodeLanguage] = useState('python');

  // Single agent state
  const [singleAgentConfig, setSingleAgentConfig] = useState({
    agent_name: '',
    description: '',
    system_prompt: '',
    model_name: 'gpt-4o-mini',
    auto_generate_prompt: false,
    max_tokens: 8192,
    temperature: 0.5,
    role: 'worker',
    max_loops: 1,
    tools_list_dictionary: null,
    mcp_url: null as string | null,
  });

  const [singleAgentTask, setSingleAgentTask] = useState('');

  // Multi-agent state
  const [swarmConfig, setSwarmConfig] = useState({
    name: '',
    description: '',
    agents: [] as any[],
    max_loops: 1,
    swarm_type: 'SequentialWorkflow',
    rearrange_flow: '',
    task: '',
    img: '',
    return_history: true,
    rules: '',
    tasks: [] as string[],
    messages: [] as any[],
    stream: false,
    service_tier: 'standard',
  });

  const [newAgent, setNewAgent] = useState({
    agent_name: '',
    description: '',
    system_prompt: '',
    model_name: 'gpt-4o-mini',
    auto_generate_prompt: false,
    max_tokens: 8192,
    temperature: 0.5,
    role: 'worker',
    max_loops: 1,
    tools_list_dictionary: [],
    mcp_url: '',
    task: '',
  });

  const [showAddAgent, setShowAddAgent] = useState(false);

  const handleSingleAgentSubmit = async () => {
    if (!apiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please enter your API key to continue',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${SWARMS_API_URL}/v1/agent/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          agent_config: singleAgentConfig,
          task: singleAgentTask,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to run agent');
      }

      const data = await response.json();
      setResponse(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to run agent',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwarmSubmit = async () => {
    if (!apiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please enter your API key to continue',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${SWARMS_API_URL}/v1/swarm/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          ...swarmConfig,
          output_type: "dict-all-except-first"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to run swarm');
      }

      const data = await response.json();
      setResponse(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to run swarm',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const codeTemplates = {
      python: `import requests

url = "${SWARMS_API_URL}/v1/${activeTab === 'single' ? 'agent' : 'swarm'}/completions"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "${apiKey}"
}

payload = ${JSON.stringify(activeTab === 'single' ? {
        agent_config: singleAgentConfig,
        task: singleAgentTask,
      } : swarmConfig, null, 2)}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
      typescript: `const url = "${SWARMS_API_URL}/v1/${activeTab === 'single' ? 'agent' : 'swarm'}/completions";
const headers = {
    "Content-Type": "application/json",
    "x-api-key": "${apiKey}"
};

const payload = ${JSON.stringify(activeTab === 'single' ? {
        agent_config: singleAgentConfig,
        task: singleAgentTask,
      } : swarmConfig, null, 2)};

const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
});

const data = await response.json();
console.log(data);`,
      rust: `use reqwest;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let url = "${SWARMS_API_URL}/v1/${activeTab === 'single' ? 'agent' : 'swarm'}/completions";
    
    let payload = ${JSON.stringify(activeTab === 'single' ? {
        agent_config: singleAgentConfig,
        task: singleAgentTask,
      } : swarmConfig, null, 2)};
    
    let response = client
        .post(url)
        .header("Content-Type", "application/json")
        .header("x-api-key", "${apiKey}")
        .json(&payload)
        .send()
        .await?;
    
    let body = response.json::<serde_json::Value>().await?;
    println!("{:?}", body);
    Ok(())
}`,
      go: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    url := "${SWARMS_API_URL}/v1/${activeTab === 'single' ? 'agent' : 'swarm'}/completions"
    payload := ${JSON.stringify(activeTab === 'single' ? {
        agent_config: singleAgentConfig,
        task: singleAgentTask,
      } : swarmConfig, null, 2)}
    
    jsonData, _ := json.Marshal(payload)
    
    req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("x-api-key", "${apiKey}")
    
    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()
    
    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
    fmt.Printf("%+v\n", result)
}`,
    };

    return codeTemplates[codeLanguage as keyof typeof codeTemplates];
  };

  const addAgentToSwarm = () => {
    setSwarmConfig(prev => ({
      ...prev,
      agents: [...prev.agents, { ...newAgent }]
    }));
    setNewAgent({
      agent_name: '',
      description: '',
      system_prompt: '',
      model_name: 'gpt-4o-mini',
      auto_generate_prompt: false,
      max_tokens: 8192,
      temperature: 0.5,
      role: 'worker',
      max_loops: 1,
      tools_list_dictionary: [],
      mcp_url: '',
      task: '',
    });
  };

  const removeAgentFromSwarm = (index: number) => {
    setSwarmConfig(prev => ({
      ...prev,
      agents: prev.agents.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Swarms Playground</h1>
            <p className="text-zinc-400 mt-1">Test and experiment with Swarms API in real-time</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="bg-zinc-900 border-zinc-800 pr-10"
              />
              <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={16} />
            </div>
            <Select value={codeLanguage} onValueChange={setCodeLanguage}>
              <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
                <SelectItem value="go">Go</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Configuration */}
          <div className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <Tabs defaultValue="single" className="w-full">
                <TabsList className="w-full bg-zinc-800 p-1">
                  <TabsTrigger value="single" className="flex-1">
                    <User className="w-4 h-4 mr-2" />
                    Single Agent
                  </TabsTrigger>
                  <TabsTrigger value="multi" className="flex-1">
                    <Users className="w-4 h-4 mr-2" />
                    Multi-Agent
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="single" className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="agent-name" className="text-sm font-medium text-zinc-300">Agent Name</Label>
                        <Input
                          id="agent-name"
                          value={singleAgentConfig.agent_name}
                          onChange={(e) => setSingleAgentConfig({ ...singleAgentConfig, agent_name: e.target.value })}
                          placeholder="Enter agent name"
                          className="mt-1 bg-zinc-800 border-zinc-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="model-name" className="text-sm font-medium text-zinc-300">Model Name</Label>
                        <Input
                          id="model-name"
                          value={singleAgentConfig.model_name}
                          onChange={(e) => setSingleAgentConfig({ ...singleAgentConfig, model_name: e.target.value })}
                          placeholder="Enter model name"
                          className="mt-1 bg-zinc-800 border-zinc-700"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="agent-description" className="text-sm font-medium text-zinc-300">Description</Label>
                      <Input
                        id="agent-description"
                        value={singleAgentConfig.description}
                        onChange={(e) => setSingleAgentConfig({ ...singleAgentConfig, description: e.target.value })}
                        placeholder="Enter agent description"
                        className="mt-1 bg-zinc-800 border-zinc-700"
                      />
                    </div>

                    <div>
                      <Label htmlFor="system-prompt" className="text-sm font-medium text-zinc-300">System Prompt</Label>
                      <Textarea
                        id="system-prompt"
                        value={singleAgentConfig.system_prompt}
                        onChange={(e) => setSingleAgentConfig({ ...singleAgentConfig, system_prompt: e.target.value })}
                        placeholder="Enter system prompt"
                        className="mt-1 bg-zinc-800 border-zinc-700 min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="temperature" className="text-sm font-medium text-zinc-300">Temperature</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="temperature"
                            type="number"
                            min="0"
                            max="2"
                            step="0.1"
                            value={singleAgentConfig.temperature}
                            onChange={(e) => setSingleAgentConfig({ ...singleAgentConfig, temperature: parseFloat(e.target.value) })}
                            className="mt-1 bg-zinc-800 border-zinc-700"
                          />
                          <div className="text-xs text-zinc-400 mt-1">0.0 - 2.0</div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="max-tokens" className="text-sm font-medium text-zinc-300">Max Tokens</Label>
                        <Input
                          id="max-tokens"
                          type="number"
                          min="1"
                          value={singleAgentConfig.max_tokens}
                          onChange={(e) => setSingleAgentConfig({ ...singleAgentConfig, max_tokens: parseInt(e.target.value) })}
                          className="mt-1 bg-zinc-800 border-zinc-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="role" className="text-sm font-medium text-zinc-300">Role</Label>
                        <Input
                          id="role"
                          value={singleAgentConfig.role}
                          onChange={(e) => setSingleAgentConfig({ ...singleAgentConfig, role: e.target.value })}
                          placeholder="Enter role"
                          className="mt-1 bg-zinc-800 border-zinc-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-loops" className="text-sm font-medium text-zinc-300">Max Loops</Label>
                        <Input
                          id="max-loops"
                          type="number"
                          min="1"
                          value={singleAgentConfig.max_loops}
                          onChange={(e) => setSingleAgentConfig({ ...singleAgentConfig, max_loops: parseInt(e.target.value) })}
                          className="mt-1 bg-zinc-800 border-zinc-700"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="mcp-url" className="text-sm font-medium text-zinc-300">MCP URL (Optional)</Label>
                      <Input
                        id="mcp-url"
                        value={singleAgentConfig.mcp_url || ''}
                        onChange={(e) => setSingleAgentConfig({ ...singleAgentConfig, mcp_url: e.target.value as string | null })}
                        placeholder="Enter MCP URL"
                        className="mt-1 bg-zinc-800 border-zinc-700"
                      />
                    </div>

                    <div>
                      <Label htmlFor="task" className="text-sm font-medium text-zinc-300">Task</Label>
                      <Textarea
                        id="task"
                        value={singleAgentTask}
                        onChange={(e) => setSingleAgentTask(e.target.value)}
                        placeholder="Enter task for the agent"
                        className="mt-1 bg-zinc-800 border-zinc-700 min-h-[100px]"
                      />
                    </div>

                    <Button
                      onClick={handleSingleAgentSubmit}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Running...
                        </div>
                      ) : (
                        'Run Agent'
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="multi" className="p-6">
                  {/* Multi-agent configuration content */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="swarm-name" className="text-sm font-medium text-zinc-300">Swarm Name</Label>
                        <Input
                          id="swarm-name"
                          value={swarmConfig.name}
                          onChange={(e) => setSwarmConfig({ ...swarmConfig, name: e.target.value })}
                          placeholder="Enter swarm name"
                          className="mt-1 bg-zinc-800 border-zinc-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="swarm-type" className="text-sm font-medium text-zinc-300">Swarm Type</Label>
                        <Select
                          value={swarmConfig.swarm_type}
                          onValueChange={(value) => setSwarmConfig({ ...swarmConfig, swarm_type: value })}
                        >
                          <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700">
                            <SelectValue placeholder="Select swarm type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SequentialWorkflow">Sequential Workflow</SelectItem>
                            <SelectItem value="ConcurrentWorkflow">Concurrent Workflow</SelectItem>
                            <SelectItem value="GroupChat">Group Chat</SelectItem>
                            <SelectItem value="MixtureOfAgents">Mixture of Agents</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="swarm-description" className="text-sm font-medium text-zinc-300">Description</Label>
                      <Input
                        id="swarm-description"
                        value={swarmConfig.description}
                        onChange={(e) => setSwarmConfig({ ...swarmConfig, description: e.target.value })}
                        placeholder="Enter swarm description"
                        className="mt-1 bg-zinc-800 border-zinc-700"
                      />
                    </div>

                    <div>
                      <Label htmlFor="swarm-task" className="text-sm font-medium text-zinc-300">Task</Label>
                      <Textarea
                        id="swarm-task"
                        value={swarmConfig.task}
                        onChange={(e) => setSwarmConfig({ ...swarmConfig, task: e.target.value })}
                        placeholder="Enter task for the swarm"
                        className="mt-1 bg-zinc-800 border-zinc-700 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="swarm-rules" className="text-sm font-medium text-zinc-300">Rules (Optional)</Label>
                      <Textarea
                        id="swarm-rules"
                        value={swarmConfig.rules}
                        onChange={(e) => setSwarmConfig({ ...swarmConfig, rules: e.target.value })}
                        placeholder="Enter rules for the swarm"
                        className="mt-1 bg-zinc-800 border-zinc-700 min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="max-loops" className="text-sm font-medium text-zinc-300">Max Loops</Label>
                        <Input
                          id="max-loops"
                          type="number"
                          min="1"
                          value={swarmConfig.max_loops}
                          onChange={(e) => setSwarmConfig({ ...swarmConfig, max_loops: parseInt(e.target.value) })}
                          className="mt-1 bg-zinc-800 border-zinc-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="service-tier" className="text-sm font-medium text-zinc-300">Service Tier</Label>
                        <Select
                          value={swarmConfig.service_tier}
                          onValueChange={(value) => setSwarmConfig({ ...swarmConfig, service_tier: value })}
                        >
                          <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700">
                            <SelectValue placeholder="Select service tier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="flex">Flex</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-zinc-300">Agents</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddAgent(true)}
                          className="text-cyan-500 border-cyan-500 hover:bg-cyan-500/10"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Agent
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {swarmConfig.agents.map((agent, index) => (
                          <Card key={index} className="p-4 bg-zinc-800 border-zinc-700">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-white">{agent.agent_name}</h4>
                                <p className="text-sm text-zinc-400">{agent.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAgentFromSwarm(index)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleSwarmSubmit}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Running...
                        </div>
                      ) : (
                        'Run Swarm'
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Panel - Output and Code */}
          <div className="space-y-6">
            {/* API Response Terminal */}
            <Card className="bg-zinc-900 border-zinc-800">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Output Terminal</h3>
                  {response && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const textToCopy = typeof response.outputs === 'string' 
                          ? response.outputs 
                          : JSON.stringify(response, null, 2);
                        navigator.clipboard.writeText(textToCopy);
                        toast({
                          title: 'Response Copied',
                          description: 'Response has been copied to clipboard',
                        });
                      }}
                      className="text-cyan-500 hover:text-cyan-600 hover:bg-cyan-500/10"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  )}
                </div>
                <div className="bg-black rounded-lg p-4 font-mono text-sm overflow-x-auto min-h-[200px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                    </div>
                  ) : response ? (
                    <pre className="text-gray-300 whitespace-pre-wrap break-words">
                      {typeof response.outputs === 'string' 
                        ? response.outputs 
                        : JSON.stringify(response, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-gray-500">No output yet. Run an agent or swarm to see the results.</div>
                  )}
                </div>
              </div>
            </Card>

            {/* Code Preview */}
            <Card className="bg-zinc-900 border-zinc-800">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Code Preview</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generateCode());
                      toast({
                        title: 'Code Copied',
                        description: 'Code has been copied to clipboard',
                      });
                    }}
                    className="text-cyan-500 hover:text-cyan-600 hover:bg-cyan-500/10"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                </div>
                <div className="bg-black rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-gray-300">{generateCode()}</pre>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Agent Modal */}
      <Dialog open={showAddAgent} onOpenChange={setShowAddAgent}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Add Agent to Swarm</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Configure a new agent to add to your swarm
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new-agent-name" className="text-sm font-medium text-zinc-300">Agent Name</Label>
              <Input
                id="new-agent-name"
                value={newAgent.agent_name}
                onChange={(e) => setNewAgent({ ...newAgent, agent_name: e.target.value })}
                placeholder="Enter agent name"
                className="mt-1 bg-zinc-800 border-zinc-700"
              />
            </div>
            <div>
              <Label htmlFor="new-agent-description" className="text-sm font-medium text-zinc-300">Description</Label>
              <Input
                id="new-agent-description"
                value={newAgent.description}
                onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                placeholder="Enter agent description"
                className="mt-1 bg-zinc-800 border-zinc-700"
              />
            </div>
            <div>
              <Label htmlFor="new-agent-system-prompt" className="text-sm font-medium text-zinc-300">System Prompt</Label>
              <Textarea
                id="new-agent-system-prompt"
                value={newAgent.system_prompt}
                onChange={(e) => setNewAgent({ ...newAgent, system_prompt: e.target.value })}
                placeholder="Enter system prompt"
                className="mt-1 bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-agent-model" className="text-sm font-medium text-zinc-300">Model Name</Label>
                <Input
                  id="new-agent-model"
                  value={newAgent.model_name}
                  onChange={(e) => setNewAgent({ ...newAgent, model_name: e.target.value })}
                  placeholder="Enter model name"
                  className="mt-1 bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <Label htmlFor="new-agent-role" className="text-sm font-medium text-zinc-300">Role</Label>
                <Input
                  id="new-agent-role"
                  value={newAgent.role}
                  onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value })}
                  placeholder="Enter role"
                  className="mt-1 bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddAgent(false)}
              className="text-zinc-400 hover:text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                addAgentToSwarm();
                setShowAddAgent(false);
              }}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              Add Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 