import React, { useState } from 'react';
import { Button } from '../spread_sheet_swarm/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';

// Define proper types for the popup state
type PopupState = {
  message: string;
  type: 'success' | 'error';
} | null;

interface AutoGenerateSwarmProps {
  addAgent: (agent: any) => void;
  reactFlowInstance: any;
  setPopup: (popup: PopupState) => void;
}

const AgentSchema = z.object({
  name: z.string().describe('Name of the agent reflecting their role'),
  type: z.enum(['Worker', 'Boss']).describe('Type of agent: Worker or Boss'),
  model: z.enum(['gpt-4-turbo', 'gpt-3.5-turbo', 'claude-2'])
    .describe('AI model to use for this agent'),
  systemPrompt: z.string()
    .min(50)
    .describe('Detailed system prompt defining agent behavior and responsibilities'),
  description: z.string()
    .describe('Brief description of the agent\'s role and expertise')
});

const SwarmSchema = z.array(AgentSchema)
  .min(4)
  .max(7)
  .describe('Array of agent configurations forming a balanced team');

const AutoGenerateSwarm: React.FC<AutoGenerateSwarmProps> = ({ addAgent, setPopup, reactFlowInstance }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const calculateOptimalPosition = (index: number, totalAgents: number) => {
    // Get the viewport dimensions
    const viewport = reactFlowInstance.getViewport();
    const { width, height } = reactFlowInstance.getViewport();
    
    // Calculate center of viewport
    const centerX = (-viewport.x + width / 2) / viewport.zoom;
    const centerY = (-viewport.y + height / 2) / viewport.zoom;
    
    // Calculate positions in a circle around the center
    const radius = Math.min(width, height) / 4;
    const angle = (2 * Math.PI * index) / totalAgents;
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  const addAgentWithAnimation = (agent: any, position: { x: number, y: number }, index: number) => {
    // Create the node with initial scale of 0
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
            delay: index * 0.2
          }
        }
      }
    };

    // Add the node
    addAgent(newNode);

    // Animate the node after a short delay
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
              damping: 20
            }
          }
        }
      };
      addAgent(updatedNode);
    }, index * 200);
  };

  const generateAgentConfig = async () => {
    setIsGenerating(true);
    try {
      const result = await generateText({
        model: openai('gpt-4o-2024-08-06', { structuredOutputs: true }),
        tools: {
          createSwarm: tool({
            description: 'Generate a balanced team of AI agents with complementary roles',
            parameters: SwarmSchema,
            execute: async (agents) => {
              // Add agents with staggered animations
              agents.forEach((agent, index) => {
                const position = calculateOptimalPosition(index, agents.length);
                addAgentWithAnimation(agent, position, index);
              });
              return agents;
            }
          })
        },
        prompt: `Create a production-ready swarm of AI agents that work together effectively. The team should include:

        1. One or two Boss agents for:
           - Task coordination
           - Quality oversight
           - Team management
        
        2. Three to four Worker agents with specialized roles such as:
           - Research and analysis
           - Content creation
           - Data processing
           - Quality assurance
           - Technical implementation
        
        Each agent should have:
        - A clear and specific role
        - A detailed system prompt that includes error handling and collaboration protocols
        - An appropriate model selection based on task complexity
        
        Ensure the team is balanced and can handle complex workflows efficiently.`
      });

      setPopup({
        message: 'Successfully generated agent swarm',
        type: 'success'
      });
    } catch (error) {
      console.error('Error generating swarm:', error);
      setPopup({
        message: 'Failed to generate swarm: ' + (error instanceof Error ? error.message : 'Unknown error'),
        type: 'error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="bg-card hover:bg-muted"
      onClick={generateAgentConfig}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4 mr-2" />
      )}
      Auto-Generate Swarm
    </Button>
  );
};

export default AutoGenerateSwarm;