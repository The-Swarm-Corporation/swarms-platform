import EntityComponent from '@/shared/components/entity';
import { trpcApi } from '@/shared/utils/trpc/trpc';
import { redirect } from 'next/navigation';

import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import AgentPlayground from './components/agent-playground';
import AccessRestriction from '@/shared/components/marketplace/access-restriction';
import { generateAccessToken } from '@/shared/utils/access-tokens';
import { checkUserAccess } from '@/shared/utils/access-control';

const Agent = async ({ id }: { id: string }) => {
  const agent = await trpcApi.explorer.getAgentById.query(id);
  if (!agent) {
    redirect('/404');
  }

  if (!agent.is_free) {
    const session = await checkUserSession();

    if (session?.id && agent.user_id === session.id) {
      // User owns the agent - allow access
    } else if (!session?.id) {
      redirect('/');
    } else {
      const accessCheck = await checkUserAccess(id, 'agent', session.id);

      if (!accessCheck.hasAccess) {
        const accessToken = generateAccessToken(id, 'agent', session.id);
        redirect(`/access/agent/${accessToken}`);
      }
    }
  }

  const tags = agent?.tags?.split(',') || [];
  const usecases = (agent?.use_cases ?? []) as {
    title: string;
    description: string;
  }[];

  const requirements = (agent?.requirements ?? []) as {
    package: string;
    installation: string;
  }[];

  return (
    <AccessRestriction
      item={{
        id: agent.id,
        name: agent.name ?? '',
        description: agent.description ?? '',
        price: agent.price ?? 0,
        price_usd: agent.price_usd ?? 0,
        is_free: agent.is_free ?? true,
        seller_wallet_address: agent.seller_wallet_address ?? '',
        user_id: agent.user_id ?? '',
        type: 'agent',
      }}
    >
      <EntityComponent
        title="Agent"
        tags={tags}
        id={id}
        usecases={usecases}
        imageUrl={agent.image_url ?? ''}
        description={agent.description ?? ''}
        name={agent.name ?? ''}
        requirements={requirements}
        userId={agent.user_id ?? ''}
        links={agent.links as { name: string; url: string }[] | null}
      >
        <AgentPlayground
          language={agent.language ?? ''}
          agent={agent.agent ?? ''}
        />
      </EntityComponent>
    </AccessRestriction>
  );
};

export default Agent;
