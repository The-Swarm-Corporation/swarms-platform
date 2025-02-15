'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
} from '../ui/dropdown-menu';
import Input from '../ui/Input/Input';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Textarea } from '../ui/textarea';

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
  Edit2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import LoadingSpinner from '../loading-spinner';
import ComponentLoader from '../loaders/component';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ShareModal from '@/modules/platform/explorer/components/share-modal';
import useSpreadsheet from './hook';

const CustomPre = (props: React.HTMLAttributes<HTMLPreElement>) => (
  <pre id="customPreTag" {...props} className="max-h-[600px]" />
);

export function SwarmManagement() {
  const {
    isAddAgentOpen,
    newAgent,
    isOptimizing,
    draggedFiles,
    runningAgents,
    task,
    isRunning,
    isAgentOutput,
    agentId,
    isEditAgentOpen,
    editingAgent,
    isLoading,
    isAddAgentLoader,
    isRunAgentLoader,
    isDuplicateLoader,
    allSessions,
    allSessionsAgents,
    currentSession,
    isShareModalOpen,
    updateSessionOutputMutation,
    updateAgentMutation,
    deleteAgentMutation,
    selectedAgent,
    copyToClipboard,
    setIsShareModalOpen,
    setEditingAgent,
    setIsAddAgentOpen,
    setIsEditAgentOpen,
    setNewAgent,
    setAgentId,
    setIsAgentOutput,
    setDraggedFiles,
    setTask,
    getShareablePath,
    shareSwarm,
    handleSessionSelect,
    handleEditClick,
    saveEditedAgent,
    createNewSession,
    addAgent,
    deleteAgent,
    handleDuplicateClick,
    optimizePrompt,
    handleFileDrop,
    runAgents,
    downloadJSON,
    uploadJSON,
    downloadCSV,
  } = useSpreadsheet();

  if (isLoading) {
    return (
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size={40} />
          <p className="text-muted-foreground">Loading Spreadsheet Swarm...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* {allSessions?.isPending && <ComponentLoader />} */}
      <div className="flex flex-1 h-screen ">
        <div className="min-w-[250px] w-[250px] border-r bg-background p-4">
          <h3 className="font-semibold mb-4">All Sessions</h3>
          <div className="space-y-2">
            {allSessions?.data?.map((session) => (
              <div
                key={session?.id}
                onClick={() => handleSessionSelect(session?.id)}
                className={`p-3 rounded-md cursor-pointer hover:bg-primary hover:text-white transition-colors ${
                  currentSession?.id === session?.id
                    ? 'bg-primary text-white'
                    : ''
                }`}
              >
                <span className="font-mono text-sm break-all">
                  {session?.id}
                </span>
              </div>
            ))}
          </div>
        </div>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          link={getShareablePath()}
        />

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          link={getShareablePath()}
        />

        {/* Main content */}
        <div className="">
          <div className="container mx-auto ">
            {/* Stats Card */}
            <div className="space-y-6">
              <Card className="mt-6 shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]">
                <CardHeader>
                  <CardTitle>Session Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center min-w-[305px]">
                      <h3 className="text-lg font-semibold">Session ID</h3>
                      <p className="text-sm font-mono break-all">
                        {currentSession?.id || 'pending'}
                      </p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">
                        Number of Agents
                      </h3>
                      <p className="text-2xl font-bold">
                        {currentSession?.agents?.length || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Tasks Executed</h3>
                      <p className="text-2xl font-bold">
                        {currentSession?.tasks_executed || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Time Saved</h3>
                      <p className="text-2xl font-bold">
                        {currentSession?.time_saved || 0}s
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Task Input and Actions */}
              <div className="flex space-x-4">
                <div className="grow">
                  <Input
                    className="shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]"
                    placeholder="Enter task for agents..."
                    value={task}
                    onChange={(newTask: any) => setTask(newTask)}
                  />
                </div>
                <Button
                  onClick={runAgents}
                  disabled={runningAgents.size > 0}
                  className="min-w-[120px] shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]"
                >
                  {runningAgents.size > 0 ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Running ({runningAgents.size})
                    </>
                  ) : (
                    <>
                      {isRunAgentLoader ? (
                        <LoadingSpinner />
                      ) : (
                        <Play className="size-4 mr-2" />
                      )}
                      Run Agents
                    </>
                  )}
                </Button>

                {/* Add Agent Dialog */}
                <Dialog
                  open={isAddAgentOpen}
                  onOpenChange={() => {
                    // if (redirectStatus()) return;

                    setIsAddAgentOpen(!isAddAgentOpen);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]">
                      {isAddAgentLoader ? (
                        <LoadingSpinner />
                      ) : (
                        <Plus className="size-4 mr-2" />
                      )}{' '}
                      Add Agent
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader className="-mb-3">
                      <DialogTitle>Add New Agent</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4 ">
                      <div>
                        <Label htmlFor="name" className="mb-2.5 block">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newAgent.name || ''}
                          onChange={(name: any) =>
                            setNewAgent({ ...newAgent, name })
                          }
                          className="w-full shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)] ring-offset-background focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-0 "
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="mb-2.5 block">
                          Description
                        </Label>
                        <Input
                          id="description"
                          value={newAgent.description || ''}
                          onChange={(description: any) =>
                            setNewAgent({ ...newAgent, description })
                          }
                          className="w-full shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)] bg-white dark:bg-black  ring-offset-background focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-0 "
                        />
                      </div>

                      <div>
                        <Label htmlFor="systemPrompt" className="mb-2.5 block">
                          System Prompt
                        </Label>
                        <div className="relative">
                          <Textarea
                            id="systemPrompt"
                            value={newAgent.systemPrompt || ''}
                            onChange={(e) =>
                              setNewAgent({
                                ...newAgent,
                                systemPrompt: e.target.value,
                              })
                            }
                            className="pr-10 shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-2 top-2"
                            onClick={() => optimizePrompt(false)}
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

                      <div>
                        <Label htmlFor="llm" className="mb-2.5 block">
                          LLM
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            setNewAgent({ ...newAgent, llm: value })
                          }
                        >
                          <SelectTrigger className="w-full shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]">
                            <SelectValue placeholder="Select LLM" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="openai:gpt-4o">
                              GPT-4o
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

                      <div
                        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
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

                      {draggedFiles.length > 0 && (
                        <div>
                          {draggedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-secondary rounded mb-2 last:mb-0"
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
                      <Button
                        onClick={addAgent}
                        className="shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)] hover:shadow-[0_3px_6px_rgba(0,0,0,0.16),_0_3px_6px_rgba(0,0,0,0.23)] -mb-5"
                      >
                        Add Agent
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    className="shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]"
                  >
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
                      {updateSessionOutputMutation.isPending ? (
                        <Loader2 className="size-4 mr-2" />
                      ) : (
                        <Upload className="size-4 mr-2" />
                      )}{' '}
                      Load JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={downloadCSV}>
                      <Download className="size-4 mr-2" /> Download CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareSwarm}>
                      <Share2 className="size-4 mr-2" /> Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => createNewSession(task)}>
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
                <TabsList className="shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]">
                  <TabsTrigger value="current">Current Session</TabsTrigger>
                  <TabsTrigger value="history">Session History</TabsTrigger>
                </TabsList>
                <TabsContent value="current">
                  <div className="relative z-0 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">
                            Name
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Description
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            System Prompt
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            LLM
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Status
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Output
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentSession?.agents?.map((agent) => (
                          <TableRow
                            key={agent?.id}
                            onClick={() => setAgentId(agent?.id)}
                          >
                            <TableCell className="min-w-[100px]">
                              <div className="max-h-[100px] overflow-y-auto">
                                {agent?.name}
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[150px]">
                              <div className="max-h-[100px] overflow-y-auto">
                                {agent?.description}
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[280px]">
                              <div className="max-h-[100px] overflow-y-auto">
                                {agent?.system_prompt}
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[80px]">
                              {agent?.llm}
                            </TableCell>
                            <TableCell className="min-w-[100px]">
                              <div className="flex items-center">
                                {agent?.status === 'running' ? (
                                  <Loader2 className="size-4 mr-2 animate-spin" />
                                ) : null}
                                {isRunning ? 'running...' : agent?.status}
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[320px]">
                              <Dialog
                                open={isAgentOutput && agent?.id === agentId}
                                onOpenChange={setIsAgentOutput}
                              >
                                <DialogTrigger asChild>
                                  <div className="max-h-[100px] overflow-y-auto cursor-pointer hover:text-gray-200">
                                    {agent?.output}
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl p-6">
                                  <DialogHeader>
                                    <DialogTitle>Output</DialogTitle>
                                  </DialogHeader>
                                  <Copy
                                    size={30}
                                    className="p-1 text-primary cursor-pointer absolute right-12 top-2 focus:outline-none"
                                    onClick={() =>
                                      copyToClipboard(agent?.output ?? '')
                                    }
                                  />
                                  <SyntaxHighlighter
                                    PreTag={CustomPre}
                                    style={dracula}
                                    language="markdown"
                                    wrapLongLines
                                  >
                                    {agent?.output ?? ''}
                                  </SyntaxHighlighter>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                            <TableCell className="min-w-[120px]">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]"
                                  onClick={() => handleEditClick(agent)}
                                >
                                  {updateAgentMutation.isPending &&
                                  agent?.id === editingAgent?.id ? (
                                    <LoadingSpinner />
                                  ) : (
                                    <Edit2 className="size-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDuplicateClick(agent)}
                                  className="shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]"
                                >
                                  {isDuplicateLoader ? (
                                    <LoadingSpinner />
                                  ) : (
                                    <Copy className="size-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteAgent(agent)}
                                  className="shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]"
                                >
                                  {deleteAgentMutation.isPending &&
                                  agent?.id === selectedAgent?.id ? (
                                    <LoadingSpinner />
                                  ) : (
                                    <Trash2 className="size-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>

                            {/* Add Edit Agent Dialog */}
                            <Dialog
                              open={isEditAgentOpen}
                              onOpenChange={() =>
                                setIsEditAgentOpen(!isEditAgentOpen)
                              }
                            >
                              <DialogContent className="max-w-2xl">
                                <DialogHeader className="-mb-3">
                                  <DialogTitle>Edit Agent</DialogTitle>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                  <div>
                                    <Label
                                      htmlFor="edit-name"
                                      className="mb-2.5 block"
                                    >
                                      Name
                                    </Label>
                                    <Input
                                      id="edit-name"
                                      value={editingAgent.name || ''}
                                      onChange={(name: any) =>
                                        setEditingAgent({
                                          ...editingAgent,
                                          name,
                                        })
                                      }
                                      className="w-full shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]"
                                    />
                                  </div>

                                  <div>
                                    <Label
                                      htmlFor="edit-description"
                                      className="mb-2.5 block"
                                    >
                                      Description
                                    </Label>
                                    <Input
                                      id="edit-description"
                                      value={editingAgent.description || ''}
                                      onChange={(description: any) =>
                                        setEditingAgent({
                                          ...editingAgent,
                                          description,
                                        })
                                      }
                                      className="w-full shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]"
                                    />
                                  </div>

                                  <div>
                                    <Label
                                      htmlFor="edit-systemPrompt"
                                      className="mb-2.5 block"
                                    >
                                      System Prompt
                                    </Label>
                                    <div className="relative">
                                      <Textarea
                                        id="edit-systemPrompt"
                                        value={editingAgent.systemPrompt || ''}
                                        onChange={(e) =>
                                          setEditingAgent({
                                            ...editingAgent,
                                            systemPrompt: e.target.value,
                                          })
                                        }
                                        className="pr-10 shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]"
                                      />
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="absolute right-2 top-2"
                                        onClick={() => optimizePrompt(true)}
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

                                  <div>
                                    <Label
                                      htmlFor="edit-llm"
                                      className="mb-2.5 block"
                                    >
                                      LLM
                                    </Label>
                                    <Select
                                      value={editingAgent.llm}
                                      onValueChange={(value) =>
                                        setEditingAgent({
                                          ...editingAgent,
                                          llm: value,
                                        })
                                      }
                                    >
                                      <SelectTrigger className="w-full shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]">
                                        <SelectValue placeholder="Select LLM" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="openai:gpt-4o-mini">
                                          GPT-4o-Mini
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

                                  <Button
                                    onClick={saveEditedAgent}
                                    className="shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)] hover:shadow-[0_3px_6px_rgba(0,0,0,0.16),_0_3px_6px_rgba(0,0,0,0.23)] -mb-5"
                                  >
                                    Save Changes
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
                      {allSessionsAgents?.data &&
                        allSessionsAgents.data?.map((session) => (
                          <TableRow key={session?.id}>
                            <TableCell>{session?.id}</TableCell>
                            <TableCell>
                              {session?.timestamp &&
                                new Date(session?.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>{session?.agents?.length}</TableCell>
                            <TableCell>{session?.tasks_executed}</TableCell>
                            <TableCell>{session?.time_saved}s</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
