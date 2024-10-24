import { anthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { experimental_createProviderRegistry as createProviderRegistry } from 'ai';

export const registry = createProviderRegistry({
  // register provider with prefix and default setup:
  anthropic,

  // register provider with prefix and custom setup:
  openai: createOpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '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',
  }),
});