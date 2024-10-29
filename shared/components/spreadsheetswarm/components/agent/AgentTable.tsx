import LoadingSpinner from '@/shared/components/loading-spinner';
import { Button } from '@/shared/components/ui/Button';
import { Column, DataTable } from '@/shared/components/ui/Table/DataTable';
import { SwarmAgent } from '@/shared/types/spreadsheet';
import { Copy, Loader2, Trash2 } from 'lucide-react';

interface AgentTableProps {
  agents: SwarmAgent[];
  onDuplicate: (agent: SwarmAgent) => void;
  onDelete: (agent: SwarmAgent) => void;
  isRunning: boolean;
  selectedAgent: SwarmAgent | null;
  isDuplicateLoading: boolean;
  isDeleteLoading: boolean;
}

export const AgentTable: React.FC<AgentTableProps> = ({
  agents,
  onDuplicate,
  onDelete,
  isRunning,
  selectedAgent,
  isDuplicateLoading,
  isDeleteLoading,
}) => {
  const columns: Column<SwarmAgent>[] = [
    {
      header: 'Name',
      accessor: (agent) => agent.name,
    },
    {
      header: 'Description',
      accessor: (agent) => agent.description || '',
    },
    {
      header: 'System Prompt',
      accessor: (agent) => agent.system_prompt || '',
    },
    {
      header: 'LLM',
      accessor: (agent) => agent.llm || '',
    },
    {
      header: 'Status',
      accessor: (agent) => (
        <div className="flex items-center">
          {agent.status === 'running' ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : null}
          {isRunning ? 'running...' : agent.status}
        </div>
      ),
    },
    {
      header: 'Output',
      accessor: (agent) => agent.output || '',
      className: 'max-w-md',
    },
    {
      header: 'Actions',
      accessor: (agent) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicate(agent)}
            disabled={isDuplicateLoading && selectedAgent?.id === agent.id}
          >
            {isDuplicateLoading && selectedAgent?.id === agent.id ? (
              <LoadingSpinner />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(agent)}
            disabled={isDeleteLoading && selectedAgent?.id === agent.id}
          >
            {isDeleteLoading && selectedAgent?.id === agent.id ? (
              <LoadingSpinner />
            ) : (
              <Trash2 className="size-4" />
            )}
          </Button>
        </div>
      ),
      className: 'w-[100px]',
    },
  ];

  return <DataTable data={agents} columns={columns} />;
};
