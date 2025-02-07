import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { experimental_createProviderRegistry as createProviderRegistry } from 'ai';

export const registry = createProviderRegistry({
  ...(process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
    ? {
        anthropic: createAnthropic({
          apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
        }),
      }
    : {}),
  
  openai: createOpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  }),
});