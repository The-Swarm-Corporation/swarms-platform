import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/spread_sheet_swarm/ui/card';
import { DbSession, Session } from '@/shared/types/spreadsheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/spread_sheet_swarm/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/Button';
import { MoreHorizontal } from 'lucide-react';

interface SessionStatsProps {
  session: Session | null;
  onSessionSelect: (sessionId: string) => void;
  allSessions: DbSession[];
}

export const SessionStats: React.FC<SessionStatsProps> = ({
  session,
  onSessionSelect,
  allSessions,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spreadsheet Swarm</CardTitle>
      </CardHeader>
      <CardContent>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="mb-6">
              <MoreHorizontal className="size-10 mr-2" />
              All Sessions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Select a session</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allSessions?.map((session) => (
              <DropdownMenuItem
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
              >
                {session.id}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Session ID</h3>
            <p className="text-sm font-mono">{session?.id || 'pending'}</p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Number of Agents</h3>
            <p className="text-2xl font-bold">{session?.agents?.length || 0}</p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Tasks Executed</h3>
            <p className="text-2xl font-bold">{session?.tasks_executed || 0}</p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Time Saved</h3>
            <p className="text-2xl font-bold">{session?.time_saved || 0}s</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
