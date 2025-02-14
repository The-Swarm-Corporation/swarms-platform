'use server';

import { anthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import {
  experimental_createProviderRegistry as createProviderRegistry,
  generateText,
} from 'ai';

type SwarmArchitecture = 'Concurrent' | 'Sequential' | 'Hierarchical';

const registry = createProviderRegistry({
  anthropic,
  openai: createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  }),
});

export async function optimizePrompt(currentPrompt: string): Promise<string> {
  if (!currentPrompt?.trim()) {
    throw new Error('System prompt is required for optimization');
  }

  try {
    const { text } = await generateText({
      model: registry.languageModel('openai:gpt-4o'),
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
      ${currentPrompt}

      Please provide an optimized version of this prompt, incorporating the guidelines mentioned above. Only return the optimized prompt, no other text or comments.
      `,
    });

    return text;
  } catch (error) {
    console.error('Failed to optimize prompt:', error);
    throw new Error('Failed to optimize system prompt');
  }
}

export async function getProcessedText(
  agent: Record<string, string>,
  context: string = '',
  task: string,
  incomingResults: string[],
) {
  if (!task?.trim()) {
    throw new Error('System prompt is required for optimization');
  }

  try {
    const { text } = await generateText({
      model: registry.languageModel(`openai:${agent.model}`),
      prompt: `${agent.systemPrompt}
            
            ${context ? `Previous Context: ${context}\n` : ''}
            ${incomingResults.length > 0 ? `Previous Agents' Results:\n${incomingResults.join('\n')}\n` : ''}
            
            Task: ${task}
            
            Based on ${incomingResults.length > 0 ? "the previous agents' results" : 'the task'}, provide your response:`,
    });

    return text;
  } catch (error) {
    console.error('Failed to get processed task:', error);
    throw new Error('Failed to get processed task');
  }
}

export async function getSwarmGroupResults(
  groupAgents: any[],
  swarmArchitecture: SwarmArchitecture,
  group: any,
  currentTask: string,
  previousResults: string = ""
) {
  try {
    let groupResults: { agentId: string; result: string }[] = [];

      switch (swarmArchitecture) {
        case 'Concurrent':
          groupResults = await Promise.all(
            groupAgents.map(async (agent: any) => {
              const { text } = await generateText({
                model: registry.languageModel(`openai:${agent.model}`),
                prompt: `${agent.systemPrompt}
                
                You are part of team: ${group.data.teamName}
                Team Type: ${group.data.swarmType}
                Previous Results: ${previousResults}
                
                Task: ${currentTask}
                
                Response:`,
              });
              return { agentId: agent.id, result: text };
            }),
          );
          break;

        case 'Sequential':
          let context = previousResults;
          for (const agent of groupAgents) {
            const { text } = await generateText({
              model: registry.languageModel(`openai:${agent.model}`),
              prompt: `${agent.systemPrompt}
              
              You are part of team: ${group.data.teamName}
              Team Type: ${group.data.swarmType}
              Previous Context: ${context}
              
              Task: ${currentTask}
              
              Response:`,
            });
            groupResults.push({ agentId: agent.id, result: text });
            context += `\n${agent.name}: ${text}`;
          }
          break;

        case 'Hierarchical':
          const bosses = groupAgents.filter((a: any) => a.type === 'Boss');
          const workers = groupAgents.filter((a: any) => a.type === 'Worker');

          // Process bosses first
          const bossResults = await Promise.all(
            bosses.map(async (boss: any) => {
              const { text } = await generateText({
                model: registry.languageModel(`openai:${boss.model}`),
                prompt: `${boss.systemPrompt}
                
                You are a Boss in team: ${group.data.teamName}
                Previous Results: ${previousResults}
                
                Create subtasks for your team based on:
                Task: ${currentTask}
                
                Response:`,
              });
              groupResults.push({ agentId: boss.id, result: text });
              return { bossId: boss.id, subtask: text };
            }),
          );

          // Then process workers
          await Promise.all(
            workers.map(async (worker: any) => {
              const boss = bosses.find(
                (b: any) => b.clusterId === worker.clusterId,
              );
              if (!boss) return null;

              const bossPrompt = bossResults.find(
                (bp) => bp.bossId === boss.id,
              );
              if (!bossPrompt) return null;

              const { text } = await generateText({
                model: registry.languageModel(`openai:${worker.model}`),
                prompt: `${worker.systemPrompt}
                
                You are a Worker in team: ${group.data.teamName}
                Task from your boss: ${bossPrompt.subtask}
                
                Response:`,
              });
              groupResults.push({ agentId: worker.id, result: text });
            }),
          );
          break;
      }

    return groupResults;
  } catch (error) {
    console.error("Error processing group task:", error);
    throw new Error("Failed to process group task");
  }
}
