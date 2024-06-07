import { PUBLIC } from '@/shared/constants/links';
import { makeUrl } from '@/shared/utils/helpers';
import React from 'react';
import InfoCard from '../info-card';
import { ScanEye, TextQuote } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/shared/components/loading-spinner';

// TODO: Add types
export default function Models({ models, filteredModels }: any) {
  return (
    <div className="flex flex-col min-h-1/2 gap-2 py-8">
      <h1 className="text-3xl font-bold pb-2">Models</h1>
      <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1 max-md:grid-cols-1 max-lg:grid-cols-2">
        {models.isLoading ? (
          <LoadingSpinner size={24} />
        ) : filteredModels.length > 0 ? (
          filteredModels?.map((model: any) => (
              // <Link
              //   key={model.id}
              //   className="w-full h-[220px] sm:w-full"
              //   target="_blank"
              //   href={makeUrl(PUBLIC.MODEL, { slug: model.slug })}
              // >
              <div className='flex flex-col w-full h-[220px] sm:w-full mb-11' key={model.id}>
                <InfoCard
                  title={model.name || ''}
                  description={model.description || ''}
                  input={model.price_million_input ?? null}
                  output={model.price_million_output ?? null}
                  icon={
                    model.model_type == 'vision' ? <ScanEye /> : <TextQuote />
                  }
                  className="w-full h-full"
                  link={makeUrl(PUBLIC.MODEL, { slug: model.slug })}
                />
                </div>
              // </Link>
          ))
        ) : (
          <div className="border p-4 rounded-md text-center">
            No models found
          </div>
        )}
      </div>
    </div>
  );
}