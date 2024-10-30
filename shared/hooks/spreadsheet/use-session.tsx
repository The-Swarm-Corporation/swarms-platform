import { DbSession, Session } from '@/shared/types/spreadsheet';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useEffect, useState } from 'react';

interface QueryResult<T> {
  data: T | undefined;
  isPending: boolean;
  refetch: () => Promise<any>;
}

export const useSession = () => {
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  const allSessions: QueryResult<DbSession[]> =
    trpc.panel.getAllSessions.useQuery();
  const allSessionsAgents: QueryResult<Session[]> =
    trpc.panel.getAllSessionsWithAgents.useQuery();

  const sessionData: QueryResult<Session> =
    trpc.panel.getSessionWithAgents.useQuery(
      { session_id: currentSessionId },
      { enabled: !!currentSessionId },
    );

  const mutations = {
    create: trpc.panel.createSession.useMutation(),
    updateTask: trpc.panel.updateSessionTask.useMutation(),
    updateMetrics: trpc.panel.updateSessionMetrics.useMutation(),
    setCurrentSession: trpc.panel.setCurrentSession.useMutation(),
    updateSessionOutput: trpc.panel.updateSessionOutput.useMutation(),
  };

  useEffect(() => {
    if (allSessions.data) {
      setCurrentSessionId(allSessions.data[0]?.id);
    }
  }, [allSessions.data]);

  const handleSessionSelect = async (sessionId: string) => {
    await mutations.setCurrentSession.mutateAsync({ session_id: sessionId });
    setCurrentSessionId(sessionId);
  };

  const createNewSession = async (
    task: string,
    output?: any,
    tasks_executed?: number,
    time_saved?: number,
  ) => {
    try {
      const newSession = await mutations.create.mutateAsync({
        task,
        tasks_executed,
        output,
        time_saved,
      });
      setCurrentSessionId(newSession.id);
      allSessions.refetch();
      return newSession.id;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  };

  const updateSessionTask = async (task: string): Promise<boolean> => {
    if (!currentSessionId) return false;

    try {
      await mutations.updateTask.mutateAsync({
        session_id: currentSessionId,
        task,
      });
      return true;
    } catch (error) {
      console.error('Failed to update task:', error);
      return false;
    }
  };

  const updateSessionMetrics = async (
    tasksExecuted: number,
    timeSaved: number,
  ) => {
    if (!currentSessionId) return;

    try {
      await mutations.updateMetrics.mutateAsync({
        session_id: currentSessionId,
        tasksExecuted,
        timeSaved,
      });
    } catch (error) {
      console.error('Failed to update session metrics:', error);
    }
  };

  return {
    currentSessionId,
    setCurrentSessionId,
    handleSessionSelect,
    currentSession: sessionData.data || null,
    allSessions,
    allSessionsAgents,
    createNewSession,
    updateSessionTask,
    updateSessionMetrics,
    updateSessionOutput: mutations.updateSessionOutput.mutateAsync,
    isLoading: allSessions.isPending || sessionData.isPending,
    isUpdating: mutations.updateSessionOutput.isPending,
    refetchSession: sessionData.refetch,
  };
};
