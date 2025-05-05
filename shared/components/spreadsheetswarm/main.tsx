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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

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
  Loader2,
  Edit2,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  KeyRound,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ShareModal from '@/modules/platform/explorer/components/share-modal';
import useSpreadsheet from './hook';
import { cn } from '@/shared/utils/cn';
import MessageScreen from '../chat/components/message-screen';
import Link from 'next/link';
import { AGENT_ROLES } from '../chat/helper';
import AgentForm from './agent-form';
import LoadingSpinner from '../loading-spinner';
import MarkdownComponent from '../markdown';

export function SwarmManagement() {
  const {
    isAddAgentOpen,
    newAgent,
    isExpanded,
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
    isEditAgentLoader,
    updateSessionOutputMutation,
    updateAgentMutation,
    deleteAgentMutation,
    selectedAgent,
    copyToClipboard,
    setIsExpanded,
    setIsShareModalOpen,
    setEditingAgent,
    setIsAddAgentOpen,
    setIsEditAgentOpen,
    setNewAgent,
    setAgentId,
    setIsAgentOutput,
    setDraggedFiles,
    handleCheckExpand,
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
    agentStatuses,
    downloadJSON,
    uploadJSON,
    downloadCSV,
    models,
    isInitializing,
    creationError,
    apiKeyQuery,
    isCreatingApiKey,
  } = useSpreadsheet();

  if (apiKeyQuery.isLoading || isCreatingApiKey.current || isInitializing) {
    return (
      <MessageScreen
        containerClass="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        borderClass="border border-zinc-700/50"
        title="Swarms Agent System"
      >
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin h-6 w-6 text-primary" />
          <p className="text-zinc-300 text-xs font-semibold">
            {apiKeyQuery.isLoading
              ? 'Checking for existing API credentials...'
              : isCreatingApiKey.current
                ? 'Generating secure API key for you...'
                : 'Initializing spreadsheet swarm...'}
          </p>
        </div>
        <p className="text-xs text-zinc-400 text-center mt-2">
          We&apos;re setting up your environment to interact with our AI agents.
          This only takes a moment and ensures a seamless experience.
        </p>
      </MessageScreen>
    );
  }

  if (creationError) {
    return (
      <MessageScreen
        icon={AlertTriangle}
        iconClass="h-10 w-10 text-primary mb-2"
        title="API Key Creation Failed"
        borderClass="border border-primary/50"
        containerClass="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <p className="text-sm text-center text-zinc-300">
          We encountered an issue creating your API key:
        </p>
        <p className="text-primary text-center font-mono text-sm p-3 bg-red-900/20 rounded-md border border-red-900/50">
          {creationError}
        </p>
        <Link
          href="https://swarms.world/platform/api-keys"
          target="_blank"
          className="mt-6"
        >
          <Button className="bg-primary hover:bg-primary/80">
            <KeyRound size={20} className="mr-2" /> Manage API Keys
          </Button>
        </Link>
      </MessageScreen>
    );
  }

  if (
    !apiKeyQuery.data?.key &&
    !apiKeyQuery.isLoading &&
    !isCreatingApiKey.current &&
    !isInitializing
  ) {
    return (
      <MessageScreen
        icon={KeyRound}
        iconClass="h-12 w-12 text-yellow-500 mb-2"
        title="API Key Required"
        borderClass="border border-zinc-700/50"
        containerClass="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <p className="text-center text-sm text-zinc-300">
          You&apos;ll need an API key to interact with our platform. We tried to
          create one automatically but ran into an issue.
        </p>
        <Link
          href="https://swarms.world/platform/api-keys"
          target="_blank"
          className="mt-6"
        >
          <Button className="bg-primary hover:bg-primary/80">
            <KeyRound size={20} className="mr-2" /> Create API Key
          </Button>
        </Link>
      </MessageScreen>
    );
  }

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
        <div
          onClick={handleCheckExpand}
          className={cn(
            'flex flex-col fixed border-r dark:bg-[#141414] bg-[#c1c1c1] border-foreground border-[#40403F] left-auto lg:left-20 p-4 flex-shrink-0 max-w-[250px] w-full transition-all ease-out duration-150 translate-x-0 min-h-screen shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)] z-[50]',
            !isExpanded &&
              'max-w-[20px] lg:max-w-[10px] xl:max-w-[50px] cursor-pointer',
          )}
        >
          <div
            role="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7 xl:h-9 xl:w-9 absolute -right-4 flex items-center justify-center rounded-full bg-primary"
          >
            {isExpanded ? (
              <ChevronLeft size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </div>
          <h3
            className={cn(
              'font-semibold mb-4',
              isExpanded ? 'visible' : 'invisible',
            )}
          >
            All Sessions
          </h3>
          <div className={cn('space-y-2', isExpanded ? 'block' : 'hidden')}>
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
        <div className="mx-auto container overflow-x-auto">
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
                    <h3 className="text-lg font-semibold">Number of Agents</h3>
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

                  <AgentForm
                    mode="add"
                    agent={newAgent}
                    setAgent={setNewAgent}
                    onSubmit={addAgent}
                    models={models}
                    roles={AGENT_ROLES}
                    isSubmitting={isAddAgentLoader}
                    isOptimizing={isOptimizing}
                    onOptimizePrompt={() => optimizePrompt(false)}
                    onFileDrop={handleFileDrop}
                    files={draggedFiles}
                    setFiles={setDraggedFiles}
                  />
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
                        <TableHead className="whitespace-nowrap">LLM</TableHead>
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
                      {currentSession?.agents?.map((agent) => {
                        const status =
                          agentStatuses[agent?.id] || agent?.status;
                        return (
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
                                {status === 'running' ? (
                                  <Loader2 className="size-4 mr-2 animate-spin" />
                                ) : null}
                                {isRunning ? 'running...' : status}
                              </div>
                            </TableCell>
                            <TableCell className="min-w-[320px]">
                              <Dialog
                                open={isAgentOutput && agent?.id === agentId}
                                onOpenChange={setIsAgentOutput}
                              >
                                <DialogTrigger asChild>
                                  <div className="max-h-[100px] overflow-y-auto cursor-pointer hover:text-gray-200">
                                    <MarkdownComponent
                                      text={agent?.output || ''}
                                    />
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl p-6 border border-[#40403F]">
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
                                  <div className="max-h-[550px] md:max-h-[600px] overflow-y-auto">
                                    <MarkdownComponent
                                      text={agent?.output || ''}
                                    />
                                  </div>
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

                                <AgentForm
                                  mode="edit"
                                  agent={editingAgent}
                                  setAgent={setEditingAgent}
                                  onSubmit={saveEditedAgent}
                                  models={models}
                                  roles={AGENT_ROLES}
                                  isSubmitting={isEditAgentLoader}
                                  isOptimizing={isOptimizing}
                                  onOptimizePrompt={() => optimizePrompt(true)}
                                  onFileDrop={handleFileDrop}
                                  files={draggedFiles}
                                  setFiles={setDraggedFiles}
                                />
                              </DialogContent>
                            </Dialog>
                          </TableRow>
                        );
                      })}
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
    </>
  );
}
