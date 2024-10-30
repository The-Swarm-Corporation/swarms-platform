import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { useState } from 'react';

import { Label } from '@/shared/components/spread_sheet_swarm/ui/label';
import { Textarea } from '@/shared/components/spread_sheet_swarm/ui/textarea';
import { Button } from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import LoadingSpinner from '@/shared/components/loading-spinner';
import { DraggedFile, NewAgent } from '@/shared/types/spreadsheet';
import { FileText, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { generateText } from 'ai';
import { registry } from '@/shared/utils/registry';

interface AgentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAgent: () => Promise<void>;
  isLoading: boolean;
  newAgent: {
    name?: string;
    description?: string;
    systemPrompt?: string;
    llm?: string;
  };
  setNewAgent: (agent: any) => void;
  draggedFiles: DraggedFile[];
  setDraggedFiles: (files: DraggedFile[]) => void;
}

export const AgentDialog: React.FC<AgentDialogProps> = ({
  isOpen,
  onOpenChange,
  onAddAgent,
  isLoading,
  newAgent,
  setNewAgent,
  draggedFiles,
  setDraggedFiles,
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const newFiles = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        content: await file.text(),
        type: file.type,
      })),
    );
    setDraggedFiles([...draggedFiles, ...newFiles]);
  };

  const handleOptimizePrompt = async () => {
    if (!newAgent.systemPrompt) return;

    setIsOptimizing(true);
    try {
      const { text } = await generateText({
        model: registry.languageModel('openai:gpt-4-turbo'),
        prompt: `
        Your task is to optimize the following system prompt for an AI agent. The optimized prompt should be highly reliable, production-grade, and tailored to the specific needs of the agent. Consider the following guidelines:

        1. Thoroughly understand the agent's requirements and capabilities.
        2. Employ diverse prompting strategies (e.g., chain of thought, few-shot learning).
        3. Blend strategies effectively for the specific task or scenario.
        4. Ensure production-grade quality and educational value.
        5. Provide necessary constraints for the agent's operation.
        6. Design for extensibility and wide scenario coverage.
        7. Aim for a prompt that fosters the agent's growth and specialization.

        Original prompt to optimize:
        ${newAgent.systemPrompt}

        Please provide an optimized version of this prompt, incorporating the guidelines mentioned above. Only return the optimized prompt, no other text or comments.
        `,
      });
      setNewAgent((prev: any) => ({ ...prev, systemPrompt: text }));
    } catch (error) {
      console.error('Failed to optimize prompt:', error);
    }
    setIsOptimizing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          {isLoading ? <LoadingSpinner /> : <Plus className="size-4 mr-2" />}
          Add Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-6 space-y-6">
        <DialogHeader>
          <DialogTitle>Add New Agent</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-left">
              Name
            </Label>
            <Input
              id="name"
              value={newAgent.name || ''}
              onChange={(name) => setNewAgent({ ...newAgent, name })}
              placeholder="Enter agent name"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description" className="text-left">
              Description
            </Label>
            <Input
              id="description"
              value={newAgent.description || ''}
              onChange={(description) =>
                setNewAgent({ ...newAgent, description })
              }
              placeholder="Enter a brief description"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="systemPrompt" className="text-left">
              System Prompt
            </Label>
            <div className="relative">
              <Textarea
                id="systemPrompt"
                value={newAgent.systemPrompt || ''}
                onChange={(e) =>
                  setNewAgent({ ...newAgent, systemPrompt: e.target.value })
                }
                placeholder="Enter system prompt details"
                className="pr-10"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-2 top-2"
                onClick={handleOptimizePrompt}
                disabled={isOptimizing}
              >
                {isOptimizing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="llm" className="text-left">
              LLM
            </Label>
            <Select
              onValueChange={(value) =>
                setNewAgent({ ...newAgent, llm: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select LLM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai:gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="anthropic:claude-3-opus-20240229">
                  Claude 3 Opus
                </SelectItem>
                <SelectItem value="anthropic:claude-3-sonnet-20240229">
                  Claude 3 Sonnet
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors space-y-2"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
        >
          <FileText className="mx-auto size-8 mb-2" />
          <p className="text-lg font-medium mb-1">Drag and drop files here</p>
          <p className="text-sm text-muted-foreground">
            Supports PDF, TXT, CSV
          </p>
        </div>

        {draggedFiles.length > 0 && (
          <div className="space-y-2">
            {draggedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-secondary rounded"
              >
                <span className="flex items-center">
                  <FileText className="size-4 mr-2" />
                  {file.name}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setDraggedFiles(draggedFiles.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          className="w-full mt-6"
          onClick={onAddAgent}
          disabled={
            !newAgent.name ||
            !newAgent.description ||
            !newAgent.systemPrompt ||
            !newAgent.llm ||
            isLoading
          }
        >
          {isLoading && <LoadingSpinner className="mr-2" />}
          Add Agent
        </Button>
      </DialogContent>
    </Dialog>
  );
};
