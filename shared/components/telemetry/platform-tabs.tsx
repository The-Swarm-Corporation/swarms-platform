'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { cn } from '@/shared/utils/cn';
import { PLATFORM } from '@/shared/utils/constants';

const routes = [
  { value: PLATFORM.TELEMETRY_DASHBOARD, label: 'Dashboard' },
  { value: PLATFORM.TELEMETRY_HISTORY, label: 'History' },
  { value: PLATFORM.TELEMETRY_SETTINGS, label: 'Settings' },
  { value: PLATFORM.TELEMETRY_PRICING, label: 'Pricing' },
];

export function PlatformTabs() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="w-full mb-8">
      <Tabs
        value={pathname || ''}
        onValueChange={(value) => router.push(value)}
      >
        <div className="overflow-x-auto no-scrollbar">
          <TabsList className="w-full max-w-4xl mx-auto bg-muted p-1 whitespace-nowrap flex border border-white/20">
            {routes.map((route) => (
              <TabsTrigger
                key={route.value}
                value={route.value}
                className={cn(
                  'flex-1 min-w-0 px-3 py-2 text-sm font-medium transition-all duration-200',
                  'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border border-white/30',
                  'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-white/5',
                  'rounded-md',
                )}
              >
                <span className="truncate">{route.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
}
