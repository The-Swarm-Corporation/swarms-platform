import React, { PropsWithChildren } from 'react';
import Card3D, { CardBody, CardItem } from '@/shared/components/3d-card';
import { cn } from '@/shared/utils/cn';

interface Entity extends PropsWithChildren {
  name?: string;
  tags?: string[];
  title: string;
  description?: string;
  usecases?: { title: string; description: string }[];
  prompt?: string;
}

export default function EntityComponent({
  title,
  name,
  tags,
  prompt,
  description,
  usecases,
  children,
}: Entity) {
  const isPrompt = title.toLowerCase() === 'prompt';

  return (
    <div className="max-w-6xl px-6 mx-auto">
      <div className="flex flex-col py-16">
        <h2 className={cn(isPrompt && 'mb-4')}>{title}</h2>
        {isPrompt && name && <p className="text-sm text-gray-400">{name}</p>}
        <h1 className={cn('text-6xl', isPrompt && 'mt-4')}>
          {isPrompt ? prompt : name}
        </h1>
        {description && (
          <div className="text-base mt-4 text-gray-400">{description}</div>
        )}
        <div className="flex gap-2 mt-4 select-none flex-wrap">
          {tags?.map((tag) => (
            <div className="text-sm px-2 py-1 rounded-2xl !text-red-500/70 border border-red-500/70">
              {tag}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-4xl">Use Cases</h2>
        <div className="flex gap-2 flex-col md:flex-row">
          {usecases?.map((usecase) => (
            <Card3D containerClassName="flex-1 " className="inter-var w-full">
              <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto h-[180px] rounded-xl p-6 border flex flex-col ">
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-neutral-600 dark:text-white"
                >
                  {usecase.title}
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                >
                  {usecase.description}
                </CardItem>
              </CardBody>
            </Card3D>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
