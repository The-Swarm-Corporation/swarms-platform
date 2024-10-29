import { Column, DataTable } from '@/shared/components/ui/Table/DataTable';
import { Session } from '@/shared/types/spreadsheet';

interface SessionTableProps {
  sessions: Session[];
}

export const SessionTable: React.FC<SessionTableProps> = ({
  sessions = [],
}) => {
  const columns: Column<Session>[] = [
    {
      header: 'Session ID',
      accessor: (session) => session.id,
      className: 'font-mono',
    },
    {
      header: 'Timestamp',
      accessor: (session) =>
        session.timestamp ? new Date(session.timestamp).toLocaleString() : '',
    },
    {
      header: 'Agents',
      accessor: (session) => String(session.agents?.length || 0),
      className: 'text-center',
    },
    {
      header: 'Tasks Executed',
      accessor: (session) => String(session.tasks_executed || 0),
      className: 'text-center',
    },
    {
      header: 'Time Saved',
      accessor: (session) => `${session.time_saved || 0}s`,
      className: 'text-right',
    },
  ];

  return <DataTable data={sessions} columns={columns} />;
};
