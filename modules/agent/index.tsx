import EntityComponent from '@/shared/components/entity';
import { trpcApi } from '@/shared/utils/trpc/trpc';
import { redirect } from 'next/navigation';

const Agent = async ({ id }: { id: string }) => {
  const agent = await trpcApi.explorer.getAgentById.query(id);
  if (!agent) {
    redirect('/404');
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
    <EntityComponent
      title="Agent"
      tags={tags}
      usecases={usecases}
      description={agent.description ?? ''}
      name={agent.name ?? ''}
      language={agent.language ?? ''}
      requirements={requirements}
      prompt={agent.agent ?? ''}
      userId={agent.user_id ?? ''}
    />
  );
};

export default Agent;
