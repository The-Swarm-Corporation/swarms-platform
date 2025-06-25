import EntityComponent from '@/shared/components/entity';
import PromptJsonLd from '@/shared/components/prompts/PromptJsonLd';
import { trpcApi } from '@/shared/utils/trpc/trpc';
import { redirect } from 'next/navigation';
import AccessRestriction from '@/shared/components/marketplace/access-restriction';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { generateAccessToken } from '@/shared/utils/access-tokens';

const Prompt = async ({ id }: { id: string }) => {
  const session = await checkUserSession();

  const prompt = await trpcApi.explorer.getPromptById.query(id);
  if (!prompt) {
    redirect('/404');
  }

  if (!prompt.is_free) {
    if (session?.id && prompt.user_id === session.id) {
    } else if (!session?.id) {
      redirect('/');
    } else {
      const accessToken = generateAccessToken(id, 'prompt', session.id);
      redirect(`/access/prompt/${accessToken}`);
    }
  }
  const tags = prompt?.tags?.split(',') || [];
  const usecases = (prompt?.use_cases ?? []) as {
    title: string;
    description: string;
  }[];

  return (
    <>
      <PromptJsonLd prompt={prompt} userId={prompt.user_id} />
      <AccessRestriction
        item={{
          id: prompt.id,
          name: prompt.name ?? '',
          description: prompt.description ?? '',
          price: prompt.price ?? 0,
          is_free: prompt.is_free ?? true,
          seller_wallet_address: prompt.seller_wallet_address ?? '',
          user_id: prompt.user_id ?? '',
          type: 'prompt',
        }}
      >
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
      </AccessRestriction>
    </>
  );
};

export default Prompt;