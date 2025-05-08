'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { cn } from '@/shared/utils/cn';

const routes = [
  { value: '/telemetry/dashboard', label: 'Dashboard' },
  { value: '/telemetry/swarms', label: 'Swarms' },
  { value: '/telemetry/agents', label: 'Agents' },
  { value: '/telemetry/history', label: 'History' },
  { value: '/telemetry/settings', label: 'Settings' },
  { value: '/telemetry/pricing', label: 'Pricing' },
];

export function PlatformTabs() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <Tabs
        value={pathname || ''}
        onValueChange={(value) => router.push(value)}
      >
        <div className="overflow-x-auto no-scrollbar">
          <TabsList className="min-w-max bg-zinc-900 p-1 whitespace-nowrap flex">
            {routes.map((route) => (
              <TabsTrigger
                key={route.value}
                value={route.value}
                className={cn(
                  'flex-1',
                  'data-[state=active]:bg-red-600 data-[state=active]:text-white',
                  'data-[state=inactive]:text-red-500 data-[state=inactive]:hover:text-red-600',
                )}
              >
                {route.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
}
