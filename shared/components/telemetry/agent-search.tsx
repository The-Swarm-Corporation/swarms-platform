'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useStorageManager } from '@/shared/utils/api/telemetry/storage';
import type { StoredAgent } from '@/shared/utils/api/telemetry/storage';

interface AgentSearchProps {
  onSelect: (agent: StoredAgent) => void;
}

export function AgentSearch({ onSelect }: AgentSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<StoredAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<StoredAgent[]>([]);
  const storageManager = useStorageManager(); // Moved hook outside useEffect

  useEffect(() => {
    const storedAgents = storageManager?.getAgents() || [];
    setAgents(storedAgents);
    setFilteredAgents(storedAgents);
  }, [storageManager]);

  useEffect(() => {
    const filtered = agents.filter((agent) => {
      if (!agent || !agent.name || !agent.description) {
        console.warn('Skipping invalid agent in filter:', agent);
        return false;
      }

      try {
        const searchLower = searchQuery.toLowerCase();
        return (
          agent.name.toLowerCase().includes(searchLower) ||
          agent.description.toLowerCase().includes(searchLower)
        );
      } catch (error) {
        console.error('Error filtering agent:', error, agent);
        return false;
      }
    });
    setFilteredAgents(filtered);
  }, [searchQuery, agents]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search pre-built agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
        />
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {filteredAgents.map((agent) => (
          <Card
            key={agent.id}
            className="p-4 hover:border-red-600 cursor-pointer transition-colors"
            onClick={() => onSelect(agent)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">{agent.name}</h3>
                <p className="text-sm text-zinc-400">{agent.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-zinc-700">
                  {agent.modelName}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    agent.successRate > 90
                      ? 'border-green-500 text-green-500'
                      : agent.successRate > 70
                        ? 'border-yellow-500 text-yellow-500'
                        : 'border-red-500 text-red-500'
                  }
                >
                  {agent.successRate.toFixed(0)}% Success
                </Badge>
              </div>
            </div>
          </Card>
        ))}
        {filteredAgents.length === 0 && (
          <div className="text-center py-4 text-zinc-400">
            No agents found matching your search
          </div>
        )}
      </div>
    </div>
  );
}
