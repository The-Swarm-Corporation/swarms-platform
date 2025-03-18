import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { tool } from 'ai';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';
import {
  experimental_createProviderRegistry as createProviderRegistry,
  generateText,
} from 'ai';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '../ui/Toasts/use-toast';
import { estimateTokensAndCost } from '@/shared/utils/helpers';
import { trpc } from '@/shared/utils/trpc/trpc';
import ComponentLoader from '../loaders/component';

const getRegistry = (apiKey: string) =>
  createProviderRegistry({
    openai: createOpenAI({
      apiKey,
    }),
  });

const AgentConfigSchema = z.object({
  name: z
    .string()
    .describe(
      'The unique identifier for the agent, reflecting its specific role within the swarm and its role and purpose. Be very specific ',
    ),
  systemPrompt: z
    .string()
    .min(50)
    .describe(
      "A comprehensive and detailed prompt that outlines the agent's expected behavior, responsibilities, and objectives",
    ),
  description: z
    .string()
    .describe(
      "A concise summary of the agent's primary function, highlighting its area of expertise and capabilities",
    ),
  model: z
    .enum(['gpt-4o', 'gpt-4o-mini'])
    .describe('AI model to use for this agent'),
});

const SwarmToolSchema = z.object({
  agents: z
    .array(AgentConfigSchema)
    .min(4)
    .max(7)
    .describe('Array of agent configurations forming a balanced team'),
});

type SwarmToolSet = {
  createSwarm: any;
};

interface AutoGenerateSwarmProps {
  addAgent: (agent: any) => void;
  reactFlowInstance: any;
  setPopup: (
    popup: { message: string; type: 'success' | 'error' } | null,
  ) => void;
}

const AutoGenerateSwarm: React.FC<AutoGenerateSwarmProps> = ({
  addAgent,
  setPopup,
  reactFlowInstance,
}) => {
  const deductCredit = trpc.explorer.deductCredit.useMutation();
  const userCredit = trpc.panel.getUserCredit.useQuery();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [task, setTask] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      setIsFetching(true);
      try {
        const response = await fetch('/api/config');
        const config = await response.json();

        if (config?.openAPIKey) {
          setOpenaiKey(config?.openAPIKey);
        }
      } catch (error) {
        console.error('Failed to fetch Solana config:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchConfig();
  }, []);

  // Create the tool set
  const swarmTools: SwarmToolSet = {
    createSwarm: tool({
      description:
        'Generate a balanced team of AI agents with complementary roles',
      parameters: SwarmToolSchema,
      execute: async ({ agents }) => {
        agents.forEach((agent, index) => {
          const position = calculateOptimalPosition(index, agents.length);
          addAgentWithAnimation(agent, position, index);
        });
        return { success: true, count: agents.length };
      },
    }),
  };

  const calculateOptimalPosition = (index: number, totalAgents: number) => {
    const viewport = reactFlowInstance.getViewport();
    const { width, height } = reactFlowInstance.getViewport();
    const centerX = (-viewport.x + width / 2) / viewport.zoom;
    const centerY = (-viewport.y + height / 2) / viewport.zoom;
    const radius = Math.min(width, height) / 4;
    const angle = (2 * Math.PI * index) / totalAgents;

    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const addAgentWithAnimation = (
    agent: z.infer<typeof AgentConfigSchema>,
    position: { x: number; y: number },
    index: number,
  ) => {
    const newNode = {
      ...agent,
      id: `auto-${Date.now()}-${index}`,
      position,
      data: {
        ...agent,
        style: {
          opacity: 0,
          scale: 0,
          transition: {
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: index * 0.2,
          },
        },
      },
    };

    addAgent(newNode);

    setTimeout(() => {
      const updatedNode = {
        ...newNode,
        data: {
          ...newNode.data,
          style: {
            opacity: 1,
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 260,
              damping: 20,
            },
          },
        },
      };
      addAgent(updatedNode);
    }, index * 200);
  };

  const generateAgentConfig = async (taskDescription: string) => {
    if (!taskDescription.trim()) {
      setPopup({
        message: 'Please provide a task description',
        type: 'error',
      });
      return;
    }

    setIsGenerating(true);

    const systemPrompt = `Analyze this task and create a specialized team of AI agents to accomplish it effectively:
  
          Task: "${taskDescription}"
  
          Create a production-ready swarm of AI agents that will work together to accomplish this specific task. Design the team considering:
  
          1. The specific requirements and challenges of the given task
          2. Different aspects and stages of the task that need specialized attention
          3. Required coordination and oversight for task completion
  
          For each agent, provide:
          - A name that reflects their specific role in handling this task
          - A role-specific system prompt that includes:
            * Clear definition of their responsibilities for this task
            * How they should interact with other team members
            * Specific outputs they should generate
            * Error handling relevant to their part of the task
          - An appropriate AI model based on their role complexity
  
          The team structure should include:
          - Boss agent(s) for coordinating the specific aspects of this task
          - Worker agents with complementary specialties needed for the task
          - Clear collaboration protocols specific to this task's requirements
  
          Call the createSwarm tool with the generated team configuration in the required format.`;

    try {
      const costEstimate = estimateTokensAndCost(systemPrompt);

      const totalCredit = Number(userCredit.data) || 0;

      if (totalCredit < costEstimate.inputCost) {
        toast({
          description: 'Insufficient credit for prompt optimization',
          variant: 'destructive',
        });
        return;
      }

      const registry = getRegistry(openaiKey);

      const result = await generateText({
        model: registry.languageModel('openai:gpt-4-turbo'),
        tools: swarmTools,
        prompt: systemPrompt,
      });

      const finalCosts = estimateTokensAndCost(systemPrompt, result.text);

      if (finalCosts?.totalCost) {
        await deductCredit.mutateAsync({ amount: finalCosts.totalCost });
      }

      setPopup({
        message: `Successfully generated agent swarm with ${result.toolResults.length} agents`,
        type: 'success',
      });
    } catch (error) {
      console.error('Error generating swarm:', error);
      setPopup({
        message:
          'Failed to generate swarm: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
        type: 'error',
      });
    } finally {
      setIsGenerating(false);
      setIsDialogOpen(false);
      setTask('');
    }
  };

  return (
    <>
      {isFetching && <ComponentLoader />}
      <Button
        variant="outline"
        className="bg-card hover:bg-muted"
        onClick={() => setIsDialogOpen(true)}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 mr-2" />
        )}
        Auto-Generate Swarm
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Agent Swarm</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task">Task Description</Label>
              <Textarea
                id="task"
                placeholder="Describe the task you want the swarm to accomplish..."
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={() => generateAgentConfig(task)}
              disabled={isGenerating || !task.trim()}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                'Generate Swarm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AutoGenerateSwarm;
