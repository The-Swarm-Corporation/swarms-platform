import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { History } from 'lucide-react';
import { PLATFORM } from '@/shared/utils/constants';
import DashboardMetrics from './client-component';

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-6 border border-white/20 rounded-lg bg-background/50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Telemetry Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Monitor your swarm executions, agent usage, and cost analytics
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-6 md:mt-0">
          <Button
            asChild
            variant="outline"
            className="border-white/30 hover:bg-white/10 hover:border-white/50"
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
