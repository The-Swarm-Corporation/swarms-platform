import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { History } from 'lucide-react';
import { PLATFORM } from '@/shared/utils/constants';
import DashboardMetrics from './client-component';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-600">
            Dashboard
          </h1>
          <p className="text-zinc-900 dark:text-white">
            Monitor your swarm executions, agent usage, and cost analytics
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-8 md:mt-0">
          <Button
            asChild
            variant="outline"
            className="border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-red-600"
          >
            <Link href={PLATFORM.TELEMETRY_HISTORY}>
              <History className="mr-2 h-4 w-4" />
              View History
            </Link>
          </Button>
        </div>
      </div>

      <DashboardMetrics />
    </div>
  );
}
