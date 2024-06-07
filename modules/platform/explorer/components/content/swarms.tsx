import LoadingSpinner from '@/shared/components/loading-spinner';
import { Button } from '@/shared/components/ui/Button';
import Link from 'next/link';
import React from 'react';
import InfoCard from '../info-card';
import { Bot, PencilRuler } from 'lucide-react';
import { makeUrl } from '@/shared/utils/helpers';
import { PUBLIC } from '@/shared/constants/links';

// TODO: Add types
export default function Swarms({
  isLoading,
  pendingSwarms,
  filteredSwarms,
  setAddSwarmModalOpen,
  trySynthify,
}: any) {
  return (
    <div className="flex flex-col min-h-1/2 gap-2 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold pb-2">Swarms</h1>
        <Button onClick={() => setAddSwarmModalOpen(true)}>Add Swarm</Button>
      </div>
      <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-md:grid-cols-1 max-lg:grid-cols-2">
        {/* pending */}
        {isLoading && (
          <div>
            <LoadingSpinner size={24} />
          </div>
        )}
        {!isLoading &&
          pendingSwarms.data?.data?.map((swarm: any) => (
            // <Link
            //   key={swarm.id}
            //   className="w-full h-[200px] sm:w-full"
            //   target="_blank"
            //   href={swarm.pr_link || '#'}
            // >
            <div className=' w-full h-[220px] sm:w-full' key={swarm.id}>
              <InfoCard
                title={`${swarm.name} [PENDING]`}
                description={swarm.description || ''}
                icon={<Bot />}
                className="w-full h-full"
                link={swarm.pr_link || '#'}
              />
            </div>
            // </Link>
          ))}
        {/* all */}
        {!isLoading &&
          filteredSwarms?.map((swarm: any) => (
            // <Link
            //   key={swarm.id}
            //   className="w-full h-[200px] sm:w-full"
            //   target="_blank"
            //   href={makeUrl(PUBLIC.SWARM, { name: swarm.name })}
            // >
            <div className=' w-full h-[220px] sm:w-full' key={swarm.id}>
              <InfoCard
                title={swarm.name || ''}
                description={swarm.description || ''}
                icon={<Bot />}
                className="w-full h-full"
                btnLabel="Get Started"
                link={makeUrl(PUBLIC.SWARM, { name: swarm.name })}
              />
            </div>
            // {/* </Link> */}
          ))}
        <div className="w-full h-[200px] sm:w-full" onClick={trySynthify}>
          <InfoCard
            title="Synthify"
            description="Synthify is a platform that allows you to create dataset for llms,vlms ."
            icon={<PencilRuler />}
            btnLabel="Get Started"
            className="w-full h-full"
            link=''
          />
        </div>
      </div>
    </div>
  );
}