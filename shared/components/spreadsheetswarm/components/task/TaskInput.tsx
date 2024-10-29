import { Button } from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import { Play, Loader2 } from 'lucide-react';
import LoadingSpinner from '@/shared/components/loading-spinner';

interface TaskInputProps {
  task: string;
  onTaskChange: (value: string) => void;
  onRunTask: () => void;
  isRunning: boolean;
  isLoading: boolean;
}

export const TaskInput: React.FC<TaskInputProps> = ({
  task,
  onTaskChange,
  onRunTask,
  isRunning,
  isLoading,
}) => {
  return (
    <div className="flex space-x-4 grow">
      <div className="grow">
        <Input
          placeholder="Enter task for agents..."
          value={task}
          onChange={(value) => onTaskChange(value)}
        />
      </div>
      <Button
        onClick={onRunTask}
        disabled={isRunning}
        className="min-w-[120px]"
      >
        {isRunning ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Running
          </>
        ) : (
          <>
            {isLoading ? <LoadingSpinner /> : <Play className="size-4 mr-2" />}
            Run Agents
          </>
        )}
      </Button>
    </div>
  );
};
