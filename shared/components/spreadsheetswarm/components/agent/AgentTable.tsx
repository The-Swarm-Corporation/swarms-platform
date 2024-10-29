import { Agent, SwarmAgent } from '@/shared/types/spreadsheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/spread_sheet_swarm/ui/table';
import { Button } from '@/shared/components/ui/Button';
import { Copy, Trash2, Loader2 } from 'lucide-react';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { Tables } from '@/types_db';

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
  return (
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
        {agents.map((agent) => (
          <TableRow key={agent.id}>
            <TableCell>{agent.name}</TableCell>
            <TableCell>{agent.description}</TableCell>
            <TableCell>{agent.system_prompt}</TableCell>
            <TableCell>{agent.llm}</TableCell>
            <TableCell>
              <div className="flex items-center">
                {agent.status === 'running' ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : null}
                {isRunning ? 'running...' : agent.status}
              </div>
            </TableCell>
            <TableCell className="max-w-md truncate">{agent.output}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDuplicate(agent)}
                  disabled={
                    isDuplicateLoading && selectedAgent?.id === agent.id
                  }
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
