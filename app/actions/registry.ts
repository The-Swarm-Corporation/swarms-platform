'use server';

import { getUserCredit, supabaseAdmin } from '@/shared/utils/supabase/admin';
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

async function bulkDeductUserCredits(
  systemPrompts: string[],
  generatedTexts: string[],
  userId: string,
) {
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);

  const inputCostPerThousand = 0.005;
  const outputCostPerThousand = 0.005;

  let totalSystemTokens = 0;
  let totalOutputTokens = 0;

  for (const prompt of systemPrompts) {
    totalSystemTokens += estimateTokens(prompt);
  }

  for (const text of generatedTexts) {
    totalOutputTokens += estimateTokens(text);
  }

  const estimatedCost =
    (totalSystemTokens / 1000) * inputCostPerThousand +
    (totalOutputTokens / 1000) * outputCostPerThousand;

  const { error } = await supabaseAdmin.rpc('deduct_credit', {
    user_id: userId,
    amount: estimatedCost,
  });

  if (error) {
    console.error(`Error deducting credit: ${error.message}`);
    throw new Error(`Failed to deduct user credit: ${error.message}`);
  }
}

export async function validateUserCredits(
  systemPrompts: string[],
  userId: string,
) {
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);

  const inputCostPerThousand = 0.005;

  let totalSystemTokens = 0;
  for (const prompt of systemPrompts) {
    totalSystemTokens += estimateTokens(prompt);
  }

  const estimatedInputCost = (totalSystemTokens / 1000) * inputCostPerThousand;

  const { credit, free_credit } = await getUserCredit(userId);
  const totalCredit = credit + free_credit;

  if (totalCredit < estimatedInputCost) {
    throw new Error('Insufficient credit');
  }
}

export async function optimizePrompt(
  currentPrompt: string,
  model = 'openai:gpt-4o',
  message = 'Failed to optimize prompt',
): Promise<string> {
  if (!currentPrompt?.trim()) {
    throw new Error('System prompt is required');
  }

  try {
    const { text } = await generateText({
      model: registry.languageModel(model),
      prompt: currentPrompt,
    });

    return text;
  } catch (error) {
    console.error(`${message}:`, error);
    throw new Error(message);
  }
}

export async function getProcessedText(
  currentPrompt: string,
  agent: Record<string, string>,
) {
  if (!currentPrompt?.trim()) {
    return { error: 'System prompt is required for optimization' };
  }

  try {
    const { text } = await generateText({
      model: registry.languageModel(`openai:${agent.model}`),
      prompt: currentPrompt,
    });

    return { text };
  } catch (error: any) {
    console.error('Failed to get processed task:', error);

    if (error?.statusCode === 429) {
      return { error: '⚠️ Rate limit exceeded. Please try again later.' };
    }

    if (error?.responseBody?.includes('insufficient_quota')) {
      return {
        error: '🚨 OpenAI quota exceeded. Upgrade your plan or wait for reset.',
      };
    }

    return { error: 'Failed to process the task. Please try again.' };
  }
}

export async function getSwarmGroupResults(
  groupAgents: any[],
  swarmArchitecture: SwarmArchitecture,
  group: any,
  currentTask: string,
  previousResults: string = '',
  userId: string,
) {
  try {
    let groupResults: { agentId: string; result: string }[] = [];
    const systemPrompts: string[] = [];
    const generatedTexts: string[] = [];

    switch (swarmArchitecture) {
      case 'Concurrent':
        groupAgents.forEach((agent) => {
          const systemPrompt = `${agent.systemPrompt}
          
          You are part of team: ${group.data.teamName}
          Team Type: ${group.data.swarmType}
          Previous Results: ${previousResults}
          
          Task: ${currentTask}
          
          Response:`;
          systemPrompts.push(systemPrompt);
        });

        await validateUserCredits(systemPrompts, userId);

        groupResults = await Promise.all(
          groupAgents.map(async (agent, index) => {
            const { text } = await generateText({
              model: registry.languageModel(`openai:${agent.model}`),
              prompt: systemPrompts[index],
            });
            generatedTexts.push(text);
            return { agentId: agent.id, result: text };
          }),
        );

        await bulkDeductUserCredits(systemPrompts, generatedTexts, userId);
        break;

      case 'Sequential':
        let context = previousResults;
        for (const agent of groupAgents) {
          const systemPrompt = `${agent.systemPrompt}
          
          You are part of team: ${group.data.teamName}
          Team Type: ${group.data.swarmType}
          Previous Context: ${context}
          
          Task: ${currentTask}
          
          Response:`;

          systemPrompts.push(systemPrompt);
        }

        await validateUserCredits(systemPrompts, userId);

        for (const agent of groupAgents) {
          const systemPrompt = systemPrompts.shift()!;
          const { text } = await generateText({
            model: registry.languageModel(`openai:${agent.model}`),
            prompt: systemPrompt,
          });

          generatedTexts.push(text);
          groupResults.push({ agentId: agent.id, result: text });
          context += `\n${agent.name}: ${text}`;
        }

        await bulkDeductUserCredits(systemPrompts, generatedTexts, userId);
        break;

      case 'Hierarchical':
        const bosses = groupAgents.filter((a) => a.type === 'Boss');
        const workers = groupAgents.filter((a) => a.type === 'Worker');

        bosses.forEach((boss) => {
          const systemPrompt = `${boss.systemPrompt}
          
          You are a Boss in team: ${group.data.teamName}
          Previous Results: ${previousResults}
          
          Create subtasks for your team based on:
          Task: ${currentTask}
          
          Response:`;
          systemPrompts.push(systemPrompt);
        });

        await validateUserCredits(systemPrompts, userId);

        const bossResults = await Promise.all(
          bosses.map(async (boss, index) => {
            const { text } = await generateText({
              model: registry.languageModel(`openai:${boss.model}`),
              prompt: systemPrompts[index],
            });
            generatedTexts.push(text);
            return { bossId: boss.id, subtask: text };
          }),
        );

        workers.forEach((worker) => {
          const boss = bosses.find((b) => b.clusterId === worker.clusterId);
          if (!boss) return;
          const bossPrompt = bossResults.find((bp) => bp.bossId === boss.id);
          if (!bossPrompt) return;

          const systemPrompt = `${worker.systemPrompt}
          
          You are a Worker in team: ${group.data.teamName}
          Task from your boss: ${bossPrompt.subtask}
          
          Response:`;
          systemPrompts.push(systemPrompt);
        });

        await validateUserCredits(systemPrompts, userId);

        await Promise.all(
          workers.map(async (worker, index) => {
            const { text } = await generateText({
              model: registry.languageModel(`openai:${worker.model}`),
              prompt: systemPrompts[index],
            });
            generatedTexts.push(text);
          }),
        );

        await bulkDeductUserCredits(systemPrompts, generatedTexts, userId);
        break;
    }

    return groupResults;
  } catch (error) {
    console.error('Error processing group task:', error);
    throw new Error('Failed to process group task');
  }
}
