import EntityComponent from '@/shared/components/entity';
import { trpcApi } from '@/shared/utils/trpc/trpc';
import { redirect } from 'next/navigation';

const Swarm = async ({ name }: { name: string }) => {
  const swarm = await trpcApi.explorer.getSwarmByName.query(name);
  if (!swarm) {
    redirect('/404');
  }
  const tags = swarm.tags?.split(',') || [];
  const usecases = (swarm.use_cases ?? []) as {
    title: string;
    description: string;
  }[];
  return (
    <EntityComponent
      title="Swarm"
      name={name}
      description={swarm.description || 'No description provided'}
      tags={tags}
      usecases={usecases}
      userId={swarm.user_id}
    />
  );
};

export default Swarm;
