'use client';

import { trpc } from '@/shared/utils/trpc/trpc';
import InfoCard from './components/info-card';
import { Bot, PencilRuler, ScanEye, TextQuote } from 'lucide-react';
import Link from 'next/link';
import { makeUrl } from '@/shared/utils/helpers';
import { PUBLIC } from '@/shared/constants/links';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { Button } from '@/shared/components/ui/Button';
import { useEffect, useState } from 'react';
import AddSwarmModal from './components/add-swarm-modal';

const Explorer = () => {
  const models = trpc.explorer.getModels.useQuery();
  const synthifyMagicLink = trpc.explorer.synthifyMagicLink.useMutation();

  const toast = useToast();
  const trySynthify = async () => {
    if (synthifyMagicLink.isPending) {
      return;
    }
    const t = toast.toast({
      title: 'wait a moment...',
      duration: 10000
    });
    synthifyMagicLink
      .mutateAsync()
      .then((res) => {
        window.open(res as string, '_blank');
      })
      .catch((err) => {
        t.update({
          id: t.id,
          title: 'Something went wrong',
          variant: 'destructive',
          duration: 3000
        });
      })
      .finally(() => {});
  };
  const [addSwarModalOpen, setAddSwarmModalOpen] = useState(false);

  const allSwarms = trpc.explorer.getAllApprovedSwarms.useQuery();
  const pendingSwarms = trpc.explorer.getMyPendingSwarms.useQuery();

  const isLoading = allSwarms.isLoading || pendingSwarms.isLoading;
  const reloadSwarmStatus = trpc.explorer.reloadSwarmStatus.useMutation();
  useEffect(() => {
    if (!pendingSwarms.isLoading && pendingSwarms.data) {
      pendingSwarms.data.data?.forEach((swarm) => {
        reloadSwarmStatus.mutateAsync(swarm.id).then((res) => {
          if (res != swarm.status) {
            pendingSwarms.refetch();
          }
        });
      });
    }
  }, [pendingSwarms.isLoading]);
  const onAddSuccessfuly = () => {
    pendingSwarms.refetch();
  };
  return (
    <>
      <AddSwarmModal
        onAddSuccessfuly={onAddSuccessfuly}
        isOpen={addSwarModalOpen}
        onClose={() => setAddSwarmModalOpen(false)}
      />
      <div className="w-full flex flex-col h-full">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold sm:text-4xl">Explorer</h1>
            <span className="mt-4 text-muted-foreground">
              Find which one that suits your task such as accounting, finance,
              marketing, etc.
            </span>
          </div>
          <div>
            <Button onClick={() => setAddSwarmModalOpen(true)}>
              Add Swarm
            </Button>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <div className="flex flex-col min-h-1/2 gap-2 py-8">
            <h1 className="text-3xl font-bold pb-2">Models</h1>
            <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-md:grid-cols-1 max-lg:grid-cols-2">
              {models.isLoading && <LoadingSpinner size={24} />}
              {!models.isLoading &&
                models.data?.data?.map((model) => (
                  <Link
                    key={model.id}
                    className="w-full h-[200px] sm:w-full"
                    target="_blank"
                    href={makeUrl(PUBLIC.MODEL, { name: model.unique_name })}
                  >
                    <InfoCard
                      title={model.name || ''}
                      description={model.description || ''}
                      icon={
                        model.model_type == 'vision' ? (
                          <ScanEye />
                        ) : (
                          <TextQuote />
                        )
                      }
                      className="w-full h-full"
                    />
                  </Link>
                ))}
            </div>
          </div>
          <div className="flex flex-col min-h-1/2 gap-2 py-8">
            <h1 className="text-3xl font-bold pb-2">Swarms</h1>
            <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-md:grid-cols-1 max-lg:grid-cols-2">
              {/* pending */}
              {isLoading && (
                <div>
                  <LoadingSpinner size={24} />
                </div>
              )}
              {!isLoading &&
                pendingSwarms.data?.data?.map((swarm) => (
                  <Link
                    key={swarm.id}
                    className="w-full h-[200px] sm:w-full"
                    target="_blank"
                    href={swarm.pr_link || '#'}
                  >
                    <InfoCard
                      title={`${swarm.name} [PENDING]`}
                      description={swarm.description || ''}
                      icon={<Bot />}
                      className="w-full h-full"
                    />
                  </Link>
                ))}
              {/* all */}
              {!isLoading &&
                allSwarms.data?.data?.map((swarm) => (
                  <Link
                    key={swarm.id}
                    className="w-full h-[200px] sm:w-full"
                    target="_blank"
                    href={makeUrl(PUBLIC.SWARM, { name: swarm.name })}
                  >
                    <InfoCard 
                      title={swarm.name || ''}
                      description={swarm.description || ''}
                      icon={<Bot />}
                      className="w-full h-full"
                      btnLabel='Get Started'
                    />
                  </Link>
                ))}
              <div
                    className="w-full h-[200px] sm:w-full"
                    onClick={trySynthify}
              >
                <InfoCard
                  title="Synthify"
                  description="Synthify is a platform that allows you to create dataset for llms,vlms ."
                  icon={<PencilRuler />}
                  btnLabel="Get Started"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Explorer;
