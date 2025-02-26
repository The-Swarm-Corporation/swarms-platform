'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Agent } from '@/shared/components/chat/types';
import LoadingSpinner from '../../loading-spinner';
import { useToast } from '../../ui/Toasts/use-toast';

interface AgentFormProps {
  isLoading: boolean;
  onSubmit: (agent: Omit<Agent, 'id'>) => void;
  initialData?: Partial<Agent>;
}

export function AgentForm({
  onSubmit,
  initialData,
  isLoading,
}: AgentFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    model: initialData?.model || 'gpt-4',
    temperature: initialData?.temperature || 0.7,
    maxTokens: initialData?.maxTokens || 2048,
    systemPrompt: initialData?.systemPrompt || '',
    isActive:
      initialData?.id !== undefined ? (initialData.isActive ?? false) : true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.systemPrompt) {
      toast({
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Agent name"
          className="bg-white/80 dark:bg-zinc-950/80"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Agent description"
          className="bg-white/80 dark:bg-zinc-950/80"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <Select
          value={formData.model}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, model: value }))
          }
        >
          <SelectTrigger className="bg-white/80 dark:bg-zinc-950/80">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="claude-2">Claude 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="temperature">
          Temperature ({formData.temperature})
        </Label>
        <Input
          id="temperature"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={formData.temperature}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              temperature: Number.parseFloat(e.target.value),
            }))
          }
          className="bg-white/80 dark:bg-zinc-950/80"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxTokens">Max Tokens</Label>
        <Input
          id="maxTokens"
          type="number"
          value={formData.maxTokens}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              maxTokens: Number.parseInt(e.target.value),
            }))
          }
          className="bg-white/80 dark:bg-zinc-950/80"
          min="1"
          max="8192"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea
          id="systemPrompt"
          value={formData.systemPrompt}
          required
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, systemPrompt: e.target.value }))
          }
          placeholder="System prompt for the agent"
          className="bg-white/80 dark:bg-zinc-950/80"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-red-500 hover:bg-red-600 text-white"
      >
        Save Agent {isLoading && <LoadingSpinner className="ml-2" size={18} />}
      </Button>
    </form>
  );
}
