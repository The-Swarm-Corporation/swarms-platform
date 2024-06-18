'use client';

import React, { PropsWithChildren, useEffect, useState } from 'react';
import Card3D, { CardBody, CardItem } from '@/shared/components/3d-card';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Share2 } from 'lucide-react';
import { useToast } from '../ui/Toasts/use-toast';
import { usePathname } from 'next/navigation';
import Avatar from '../avatar';
import { Button } from '../ui/Button';
import AgentRequirements, { RequirementProps } from './agent-requirements';
import hljs from 'highlight.js';
import ShareModal from '@/modules/platform/explorer/components/share-modal';

type UseCasesProps = { title: string; description: string };

interface Entity extends PropsWithChildren {
  name?: string;
  tags?: string[];
  title: string;
  description?: string;
  usecases?: UseCasesProps[];
  prompt?: string;
  requirements?: RequirementProps[];
  userId?: string | null;
}

function UseCases({ usecases }: { usecases: UseCasesProps[] }) {
  return (
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
  );
}

export default function EntityComponent({
  title,
  name,
  tags,
  prompt,
  description,
  usecases,
  requirements,
  children,
  userId,
}: Entity) {
  const toast = useToast();

  const pathName = usePathname();
  const [isShowShareModalOpen, setIsShowModalOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState('text');

  async function copyToClipboard(text: string) {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      toast.toast({ title: 'Copied to clipboard' });
    } catch (error) {
      console.error('Failed to copy: ', error);
    }
  }

  const handleShowShareModal = () => setIsShowModalOpen(true);
  const handleCloseModal = () => setIsShowModalOpen(false);

  const CustomPre = (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre id="customPreTag" {...props} />
  );

  useEffect(() => {
    if (prompt) {
      const detectedLang = hljs.highlightAuto(prompt).language;
      setLanguage(detectedLang || 'text');
    }
  }, [prompt]);

  return (
    <div className="max-w-6xl px-6 mx-auto">
      <div className="flex flex-col py-8 md:py-16">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div className="max-md:text-center">
            <h2>{title}</h2>
            {name && <h1 className="text-4xl md:text-6xl my-4">{name}</h1>}
            {description && (
              <div className=" text-sm md:text-base text-gray-400">
                {description}
              </div>
            )}
          </div>

          <aside className="max-md:my-8 max-md:flex max-md:flex-col max-md:items-center">
            <Avatar
              userId={userId ?? ''}
              showUsername
              showBorder
              title={`${title} Author`}
            />
            <Button
              onClick={handleShowShareModal}
              variant="destructive"
              className="mt-3 w-full"
            >
              <span className="mr-1">Share</span>
              <Share2 />
            </Button>
          </aside>
        </div>

        <div className="flex gap-2 mt-4 select-none flex-wrap">
          {tags?.map(
            (tag) =>
              tag.trim() && (
                <div className="text-sm px-2 py-1 rounded-2xl !text-red-500/70 border border-red-500/70">
                  {tag}
                </div>
              ),
          )}
        </div>
      </div>
      {usecases && <UseCases usecases={usecases} />}
      {title.toLowerCase() === 'agent' && (
        <AgentRequirements requirements={requirements as RequirementProps[]} />
      )}
      {prompt && (
        <div className="relative my-10">
          <div className="bg-[#00000080] border border-[#f9f9f959] shadow-2xl p-5 py-7 rounded-lg leading-normal overflow-hidden">
            <SyntaxHighlighter
              PreTag={CustomPre}
              style={dracula}
              language={title.toLowerCase() === 'agent' ? language : 'text'}
              wrapLongLines
            >
              {prompt}
            </SyntaxHighlighter>
          </div>
          <Copy
            size={30}
            className="absolute top-2 right-2 p-1 text-primary cursor-pointer"
            onClick={() => copyToClipboard(prompt ?? '')}
          />
        </div>
      )}
      {children}
      <ShareModal
        isOpen={isShowShareModalOpen}
        onClose={handleCloseModal}
        link={pathName ?? ''}
      />
    </div>
  );
}
