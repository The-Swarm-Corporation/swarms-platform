import SwarmModule from '@/modules/swarm';

const Swarm = ({
  params
}: {
  params: {
    name: string;
  };
}) => {
  return <SwarmModule name={params.name} />;
};
export default Swarm;
