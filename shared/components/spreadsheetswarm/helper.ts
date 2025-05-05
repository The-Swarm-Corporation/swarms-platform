type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export function transformSpreadsheetSessionToMessages(
  session: any,
): ChatMessage[] {
  const result: ChatMessage[] = [];

  if (session.output?.task) {
    result.push({
      role: 'user',
      content: session.output.task.trim(),
    });
  }

  session.output?.agents?.forEach((agent: any) => {
    if (agent.output) {
      result.push({
        role: 'assistant',
        content: agent.output.trim(),
      });
    }
  });

  return result;
}
