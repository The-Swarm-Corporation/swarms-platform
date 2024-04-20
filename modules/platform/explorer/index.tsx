'use client';

import { trpc } from '@/shared/utils/trpc/trpc';
import InfoCard from './components/info-card';
import { ScanEye, TextQuote } from 'lucide-react';
import Link from 'next/link';
import { makeUrl } from '@/shared/utils/helpers';
import { PUBLIC } from '@/shared/constants/links';
import LoadingSpinner from '@/shared/components/loading-spinner';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';

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
  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex flex-col">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Explorer</h1>
        <span className="mt-4 text-muted-foreground">
          Find which one that suits your task such as accounting, finance,
          marketing, etc.
        </span>
      </div>
      <div className="flex flex-col h-full">
        <div className="flex flex-col h-1/2 gap-2 py-8">
          <h1 className="text-3xl font-bold pb-2">Models</h1>
          <div className="flex flex-wrap gap-4">
            {models.isLoading && <LoadingSpinner size={24} />}
            {!models.isLoading &&
              models.data?.data?.map((model) => (
                <Link
                  key={model.id}
                  className="w-full h-[180px] sm:w-full md:w-1/3 lg:w-1/3"
                  target="_blank"
                  href={makeUrl(PUBLIC.MODEL, { name: model.unique_name })}
                >
                  <InfoCard
                    title={model.name || ''}
                    description={model.description || ''}
                    icon={
                      model.model_type == 'vision' ? <ScanEye /> : <TextQuote />
                    }
                    className="w-full h-full"
                  />
                </Link>
              ))}
          </div>
        </div>
        <div className="flex flex-col h-1/2 gap-2 py-8">
          <h1 className="text-3xl font-bold pb-2">Swarms & Services</h1>
          <div className="flex flex-wrap gap-4">
            <div
              className="w-full h-[180px] sm:w-full md:w-1/3 lg:w-1/3 cursor-pointer"
              onClick={trySynthify}
            >
              <InfoCard
                title="Synthify"
                description="Synthify is a platform that allows you to create dataset for llms,vlms ."
                icon={<ScanEye />}
                btnLabel="try"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explorer;
