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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { Agent } from '@/shared/components/chat/types';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { Switch } from '@/shared/components/ui/switch';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { HelpCircle } from 'lucide-react';
import { AGENT_ROLES } from '../../helper';

interface AgentFormProps {
  models: string[];
  isLoading: boolean;
  onSubmit: (agent: Omit<Agent, 'id'>) => void;
  initialData?: Partial<Agent>;
}

export function AgentForm({
  onSubmit,
  models = [],
  initialData,
  isLoading,
}: AgentFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    model: initialData?.model || 'gpt-4o',
    temperature: initialData?.temperature || 0.7,
    maxTokens: initialData?.maxTokens || 2048,
    systemPrompt: initialData?.systemPrompt || '',
    autoGeneratePrompt: initialData?.autoGeneratePrompt || false,
    maxLoops: initialData?.maxLoops || 1,
    role: initialData?.role || 'worker',
    isActive:
      initialData?.id !== undefined ? (initialData.isActive ?? false) : true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      toast({
        description: 'Agent name and description are required',
        variant: 'destructive',
      });
      return;
    }

    if (formData.autoGeneratePrompt && !formData.description) {
      toast({
        description:
          'Description is required for auto-generating system prompt',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.autoGeneratePrompt && !formData.systemPrompt) {
      toast({
        description: 'System prompt is required when not auto-generating',
        variant: 'destructive',
      });
      return;
    }

    onSubmit({
      ...formData,
      systemPrompt: formData.autoGeneratePrompt
        ? `You are an AI agent specialized in: ${formData.description}. Approach tasks methodically and provide clear, detailed responses.`
        : formData.systemPrompt,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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
          <SelectContent className="border border-[#40403F]">
            {models?.length > 0 &&
              models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto_generate_prompt">
            Auto-generate System Prompt
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <HelpCircle className="h-4 w-4 text-zinc-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Automatically generate a system prompt based on the
                  description
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Switch
          checked={formData.autoGeneratePrompt}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, autoGeneratePrompt: checked })
          }
          className="data-[state=unchecked]:bg-[#40403F] data-[state=checked]:bg-red-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {AGENT_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_loops">Max Loops</Label>
          <Input
            id="max_loops"
            type="number"
            min={1}
            value={formData.maxLoops}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxLoops: Number.parseInt(e.target.value),
              })
            }
          />
        </div>
      </div>

      {!formData.autoGeneratePrompt && (
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
      )}

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
