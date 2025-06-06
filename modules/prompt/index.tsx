import EntityComponent from '@/shared/components/entity';
import PromptJsonLd from '@/shared/components/prompts/PromptJsonLd';
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
    <>
      <PromptJsonLd prompt={prompt} userId={prompt.user_id} />
      <EntityComponent
        title="Prompt"
        id={id}
        tags={tags}
        usecases={usecases}
        description={prompt.description ?? ''}
        name={prompt.name ?? ''}
        imageUrl={prompt.image_url ?? ''}
        prompt={prompt.prompt ?? ''}
        userId={prompt.user_id ?? ''}
      />
    </>
  );
};

export default Prompt;
