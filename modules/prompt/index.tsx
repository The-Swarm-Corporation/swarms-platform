import EntityComponent from '@/shared/components/entity';
import { trpcApi } from '@/shared/utils/trpc/trpc';
import { redirect } from 'next/navigation';

const Prompt = async ({ id }: { id: string }) => {
  const prompt = await trpcApi.explorer.getPromptById.query(id);
  if (!prompt) {
    redirect('/404');
  }
  const tags = prompt?.tags?.split(',') || [];
  const usecases = (prompt?.use_cases ?? []) as {
    title: string;
    description: string;
  }[];

  return (
    <EntityComponent
      title="Prompt"
      tags={tags}
      usecases={usecases}
      name={prompt.name ?? ''}
      prompt={prompt.prompt ?? ''}
    />
  );
};

export default Prompt;
