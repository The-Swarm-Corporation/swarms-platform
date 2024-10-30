import { Button } from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import { Loader2, Play } from 'lucide-react';

interface TaskInputProps {
  task: string;
  setTask: (task: string) => void;
  onRun: () => void;
  isRunning: boolean;
}

export const TaskInput: React.FC<TaskInputProps> = ({
  task,
  setTask,
  onRun,
  isRunning,
}) => {
  return (
    <div className="flex space-x-4 flex-1">
      <div className="grow">
        <Input
          placeholder="Enter task for agents..."
          value={task}
          onChange={setTask}
        />
      </div>
      <Button onClick={onRun} disabled={isRunning} className="min-w-[120px]">
        {isRunning ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Running...
          </>
        ) : (
          <>
            <Play className="size-4 mr-2" />
            Run Agents
          </>
        )}
      </Button>
    </div>
  );
};
