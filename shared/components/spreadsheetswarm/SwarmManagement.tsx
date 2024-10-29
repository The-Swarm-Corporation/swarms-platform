'use client';
import ComponentLoader from '@/shared/components/loaders/component';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { useAgent } from '@/shared/hooks/spreadsheet/use-agent';
import { useAuth } from '@/shared/hooks/spreadsheet/use-Auth';
import { useSession } from '@/shared/hooks/spreadsheet/use-session';
import { registry } from '@/shared/utils/registry';
import { User } from '@supabase/supabase-js';
import { generateText } from 'ai';
import { useState } from 'react';
import { AgentDialog } from './components/agent/AgentDialog';
import { AgentTable } from './components/agent/AgentTable';
import { SessionActions } from './components/session/SessionActions';
import { SessionStats } from './components/session/SessionStats';
import { SessionTable } from './components/session/SessionTable';
import { TaskInput } from './components/task/TaskInput';

export function SwarmManagement() {
  const [task, setTask] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const { user, redirectStatus } = useAuth();
  const toast = useToast();

  const {
    currentSession,
    currentSessionId,
    allSessions,
    allSessionsAgents,
    handleSessionSelect,
    createNewSession,
    updateSessionTask,
    updateSessionMetrics,
    updateSessionOutput,
    isLoading: isSessionLoading,
    isUpdating: isSessionUpdating,
    refetchSession,
  } = useSession();

  const {
    selectedAgent,
    setSelectedAgent,
    isAddAgentOpen,
    setIsAddAgentOpen,
    newAgent,
    setNewAgent,
    draggedFiles,
    setDraggedFiles,
    addAgent,
    deleteAgent,
    duplicateAgent,
    updateAgentStatus,
    isAddingAgent,
    isDeletingAgent,
    isUpdatingStatus,
    getDuplicateCount,
  } = useAgent(currentSessionId);

  const handleAddAgent = async () => {
    if (redirectStatus()) return;

    if (
      !newAgent.name ||
      !newAgent.description ||
      !newAgent.systemPrompt ||
      !newAgent.llm
    )
      return;

    try {
      if (!currentSessionId) {
        await createNewSession(task);
      }

      await addAgent(newAgent);
      setIsAddAgentOpen(false);
      setNewAgent({});
      refetchSession();
    } catch (error) {
      console.error('Failed to add agent:', error);
      toast.toast({
        description: 'Failed to add agent',
        variant: 'destructive',
      });
    }
  };

  const handleTaskChange = async (newTask: string) => {
    setTask(newTask);
    if (currentSessionId) {
      try {
        await updateSessionTask(newTask);
        return true;
      } catch (error) {
        console.error('Failed to update task:', error);
        return false;
      }
    }
    return false;
  };

  const runAgents = async () => {
    if (redirectStatus()) return;

    if (!currentSessionId) return;

    if (!task) {
      toast.toast({
        description: 'Please enter a task',
        variant: 'destructive',
      });
      return;
    }

    if (!currentSession?.agents?.length) {
      toast.toast({
        description: 'No agents available',
        variant: 'destructive',
      });
      return;
    }

    const isTaskHandled = await handleTaskChange(task);
    if (!isTaskHandled) {
      toast.toast({
        description: 'An error has occurred',
        variant: 'destructive',
      });
      return;
    }

    setIsRunning(true);
    const startTime = Date.now();

    try {
      await Promise.all(
        currentSession.agents.map(async (agent) => {
          try {
            await updateAgentStatus(agent.id, 'running');

            const uniquePrompt =
              agent.status === 'completed'
                ? `Task: ${task}\n\nAgent Name: ${agent.id}\n\nResponse:`
                : `${agent.system_prompt}\n\nTask: ${task}\n\nAgent Name: ${agent.name}\nAgent Description: ${agent.description}\n\nResponse:`;

            if (agent.llm) {
              const { text } = await generateText({
                model: registry.languageModel(agent.llm),
                prompt: uniquePrompt,
              });

              await updateAgentStatus(agent.id, 'completed', text);
            }
          } catch (error: any) {
            await updateAgentStatus(
              agent.id,
              'error',
              `Error: ${error?.message || 'Unknown error'}`,
            );
          }
        }),
      );

      const endTime = Date.now();
      const timeSaved = Math.round((endTime - startTime) / 1000);

      await updateSessionMetrics(
        (currentSession.tasks_executed || 0) + 1,
        (currentSession.time_saved || 0) + timeSaved,
      );

      refetchSession();
    } catch (error) {
      console.error('Failed to run agents:', error);
      toast.toast({
        description: 'An error occurred while running agents',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownloadJSON = async () => {
    if (redirectStatus()) return;

    if (!currentSession) {
      toast.toast({
        description: 'No session data available',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateSessionOutput({
        session_id: currentSessionId,
        output: currentSession,
      });

      const jsonString = JSON.stringify(currentSession, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `swarm_data_${currentSessionId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading JSON:', error);
      toast.toast({
        description: 'Failed to download session data',
        variant: 'destructive',
      });
    }
  };

  const handleUploadJSON = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const parsedState = JSON.parse(content);
            await createNewSession(parsedState.task);
            refetchSession();
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          toast.toast({
            description: 'Failed to parse uploaded file',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadCSV = () => {
    if (redirectStatus()) return;

    if (!currentSession) {
      toast.toast({
        description: 'No session data available',
        variant: 'destructive',
      });
      return;
    }

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
      ...currentSession.agents.map((agent) =>
        [
          currentSession.id,
          currentSession.timestamp
            ? new Date(currentSession.timestamp).toISOString()
            : '',
          currentSession.task,
          agent.id,
          agent.name,
          agent.description,
          `"${(agent.system_prompt || '').replace(/"/g, '""')}"`,
          agent.llm,
          agent.status,
          `"${(agent.output || '').replace(/"/g, '""')}"`,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `swarm_data_${currentSession.id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {allSessions?.isPending && user && <ComponentLoader />}
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 space-y-6">
            <SessionStats
              session={currentSession}
              onSessionSelect={handleSessionSelect}
              allSessions={allSessions?.data || []}
            />

            <div className="flex space-x-4">
              <div className="grow">
                <TaskInput
                  task={task}
                  onTaskChange={setTask}
                  onRunTask={runAgents}
                  isRunning={isRunning}
                  isLoading={isUpdatingStatus}
                />
              </div>

              <AgentDialog
                isOpen={isAddAgentOpen}
                onOpenChange={setIsAddAgentOpen}
                onAddAgent={handleAddAgent}
                newAgent={newAgent}
                setNewAgent={setNewAgent}
                draggedFiles={draggedFiles}
                setDraggedFiles={setDraggedFiles}
                isLoading={isAddingAgent}
              />

              <SessionActions
                onDownloadJSON={handleDownloadJSON}
                onUploadJSON={handleUploadJSON}
                onDownloadCSV={handleDownloadCSV}
                onShare={() => console.log('Sharing...')}
                onNewSession={() => createNewSession(task)}
                isUpdating={isSessionUpdating}
              />
            </div>

            <Tabs defaultValue="current">
              <TabsList>
                <TabsTrigger value="current">Current Session</TabsTrigger>
                <TabsTrigger value="history">Session History</TabsTrigger>
              </TabsList>

              <TabsContent value="current">
                <AgentTable
                  agents={currentSession?.agents || []}
                  onDuplicate={(agent) => {
                    setSelectedAgent(agent);
                    duplicateAgent(agent);
                  }}
                  onDelete={(agent) => {
                    setSelectedAgent(agent);
                    deleteAgent(agent);
                  }}
                  isRunning={isRunning}
                  selectedAgent={selectedAgent}
                  isDuplicateLoading={
                    getDuplicateCount.isLoading || isAddingAgent
                  }
                  isDeleteLoading={isDeletingAgent}
                />
              </TabsContent>

              <TabsContent value="history">
                <SessionTable sessions={allSessionsAgents?.data || []} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
