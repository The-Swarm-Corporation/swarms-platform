import { DbSession, Session } from '@/shared/types/spreadsheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/spread_sheet_swarm/ui/table';

interface SessionTableProps {
  sessions: Session[];
}

export const SessionTable: React.FC<SessionTableProps> = ({ sessions }) => {
  return (
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
        {sessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell>{session.id}</TableCell>
            <TableCell>
              {session.timestamp &&
                new Date(session.timestamp).toLocaleString()}
            </TableCell>
            <TableCell>{session.agents?.length}</TableCell>
            <TableCell>{session.tasks_executed}</TableCell>
            <TableCell>{session.time_saved}s</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
