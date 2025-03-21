import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { cn } from '@/shared/utils/cn';
import { Dispatch, SetStateAction } from 'react';

const agentTabs = [
  { value: 'library', label: 'Library' },
  { value: 'explorer', label: 'Explorer' },
];

type TabProps = 'library' | 'explorer';

interface AgentTabsProps {
  activeTab: TabProps;
  setActiveTab: Dispatch<SetStateAction<TabProps>>;
}

export function AgentTabs({ activeTab, setActiveTab }: AgentTabsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto my-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabProps)}
      >
        <TabsList className="w-full bg-zinc-900 p-1">
          {agentTabs.map((route) => (
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
      </Tabs>
    </div>
  );
}
