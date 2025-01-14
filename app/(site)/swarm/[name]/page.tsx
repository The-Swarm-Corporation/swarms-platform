import SwarmModule from '@/modules/swarm';

export const dynamic = 'force-dynamic';

const Swarm = ({
  params,
}: any) => {
  return <SwarmModule name={params.name} />;
};
export default Swarm;
