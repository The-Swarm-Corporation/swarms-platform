import EntityComponent from '@/shared/components/entity';
import { trpcApi } from '@/shared/utils/trpc/trpc';
import { redirect } from 'next/navigation';

import dynamic from 'next/dynamic';

const ToolPlayground = dynamic(
  () => import('../agent/components/agent-playground'),
  {
    ssr: false,
  },
);

const Tool = async ({ id }: { id: string }) => {
  const tool = await trpcApi.explorer.getToolById.query(id);
  if (!tool) {
    redirect('/404');
  }
  const tags = tool?.tags?.split(',') || [];
  const usecases = (tool?.use_cases ?? []) as {
    title: string;
    description: string;
  }[];

  const requirements = (tool?.requirements ?? []) as {
    package: string;
    installation: string;
  }[];

  return (
    <EntityComponent
      title="Tool"
      tags={tags}
      id={id}
      usecases={usecases}
      description={tool.description ?? ''}
      name={tool.name ?? ''}
      requirements={requirements}
      userId={tool.user_id ?? ''}
    >
      <ToolPlayground language={tool.language ?? ''} agent={tool.tool ?? ''} />
    </EntityComponent>
  );
};

export default Tool;
