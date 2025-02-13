export interface TPrompt {
  id: string;
  name: string;
  description: string;
  prompt: string;
  use_cases: Record<string, string>[];
  tags: string | string[];
  created_at: Date;
}
