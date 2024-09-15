import LoadingSpinner from '@/shared/components/loading-spinner';
import { Button } from '@/shared/components/ui/Button';
import Link from 'next/link';
import React from 'react';
import InfoCard from '../info-card';
import { Bot, PencilRuler } from 'lucide-react';
import { makeUrl } from '@/shared/utils/helpers';
import { PUBLIC } from '@/shared/constants/links';
import { checkUserSession } from '@/shared/utils/auth-helpers/server';
import { ExplorerSkeletonLoaders } from '@/shared/components/loaders/model-skeletion';
// import AddNewSwarm  from '@/shared/components/spread_sheet_swarm/add_new_swarm_modal';

// TODO: Add types
export default function Swarms({
  isLoading,
  pendingSwarms,
  filteredSwarms,
  setAddSwarmModalOpen,
}: any) {
  async function handleSwarmsModal() {
    await checkUserSession();
    setAddSwarmModalOpen(true);
  }
  return (
    <div className="flex flex-col min-h-1/2 gap-2 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold pb-2">Swarms</h1>
        <Button onClick={handleSwarmsModal} disabled={isLoading}>
          Add Swarm
        </Button>
      </div>
      {isLoading && <ExplorerSkeletonLoaders />}
      <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-md:grid-cols-1 max-lg:grid-cols-2">
        {pendingSwarms.data?.data?.length > 0 || filteredSwarms?.length > 0 ? (
          <div>
            {!isLoading &&
              pendingSwarms.data?.data?.map((swarm: any) => (
                <div className=" w-full h-[220px] sm:w-full" key={swarm.id}>
                  <InfoCard
                    title={`${swarm.name} [PENDING]`}
                    description={swarm.description || ''}
                    icon={<Bot />}
                    className="w-full h-full"
                    link={swarm.pr_link || '#'}
                  />
                </div>
              ))}
            {!isLoading &&
              filteredSwarms?.map((swarm: any) => (
                <div className=" w-full h-[220px] sm:w-full" key={swarm.id}>
                  <InfoCard
                    title={swarm.name || ''}
                    description={swarm.description || ''}
                    icon={<Bot />}
                    className="w-full h-full"
                    btnLabel="Get Started"
                    userId={swarm.user_id}
                    link={makeUrl(PUBLIC.SWARM, { name: swarm.name })}
                  />
                </div>
              ))}
          </div>
        ) : (
          !isLoading && (
            <div className="border p-4 rounded-md text-center">
              No swarms found
            </div>
          )
        )}
      </div>
    </div>
  );
}
