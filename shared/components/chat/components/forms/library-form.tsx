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
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import LoadingSpinner from '@/shared/components/loading-spinner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { Brain, HelpCircle, Pencil } from 'lucide-react';
import { Switch } from '@/shared/components/ui/switch';
import { AGENT_ROLES } from '../../helper';

interface AgentFormProps {
  models: string[];
  isLoading: boolean;
  isEditing: boolean;
  onSubmit: (agent: Omit<Agent, 'id'>) => void;
  handleCloseModal: () => void;
  initialData?: Partial<Agent>;
}

export function LibraryAgentForm({
  onSubmit,
  handleCloseModal,
  models = [],
  initialData,
  isEditing,
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {isEditing ? 'Edit Agent' : 'Create New Agent'}
        </h1>
        <p className="text-zinc-400">Configure your AI agent</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Agent Configuration</CardTitle>
          <CardDescription>
            Define your agent&apos;s capabilities and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-y-auto h-[400px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="agent_name">Agent Name</Label>
                <Input
                  id="agent_name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter agent name"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model_name">Model</Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) =>
                    setFormData({ ...formData, model: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models?.length > 0 &&
                      models?.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your agent's purpose and capabilities"
                maxLength={500}
              />
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
                className="data-[state=checked]:bg-red-600"
              />
            </div>

            {!formData.autoGeneratePrompt && (
              <div className="space-y-2">
                <Label htmlFor="system_prompt">System Prompt</Label>
                <Textarea
                  id="system_prompt"
                  value={formData.systemPrompt}
                  onChange={(e) =>
                    setFormData({ ...formData, systemPrompt: e.target.value })
                  }
                  placeholder="Define the agent's behavior and instructions"
                  maxLength={500}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="max_tokens">Max Tokens</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <HelpCircle className="h-4 w-4 text-zinc-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Maximum number of tokens to generate in the response
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="max_tokens"
                  type="number"
                  min={1}
                  value={formData.maxTokens}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxTokens: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="temperature">Temperature</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <HelpCircle className="h-4 w-4 text-zinc-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Controls randomness: 0 is focused, 1 is creative</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="temperature"
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      temperature: Number.parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="border-zinc-700 text-zinc-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Editing...' : ' Creating...'}
                  </>
                ) : (
                  <>
                    {isEditing ? (
                      <Pencil className="mr-2 h-4 w-4" />
                    ) : (
                      <Brain className="mr-2 h-4 w-4" />
                    )}
                    {isEditing ? 'Edit Agent' : 'Create Agent'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
