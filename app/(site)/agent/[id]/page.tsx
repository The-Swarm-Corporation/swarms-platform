import AgentModule from '@/modules/agent';
export const dynamic = 'force-dynamic';

const Agent = ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
  return <AgentModule id={params.id} />;
};

export default Agent;
