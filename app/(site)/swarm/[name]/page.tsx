import SwarmModule from '@/modules/swarm';

export const dynamic = 'force-dynamic';

const Swarm = ({
  params,
}: {
  params: {
    name: string;
  };
}) => {
  return <SwarmModule name={params.name} />;
};
export default Swarm;
