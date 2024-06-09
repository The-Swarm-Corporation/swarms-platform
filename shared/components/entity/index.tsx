'use client';

import React, { PropsWithChildren, useState } from 'react';
import Card3D, { CardBody, CardItem } from '@/shared/components/3d-card';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Facebook, Linkedin, Send, Share2, Twitter } from 'lucide-react';
import { useToast } from '../ui/Toasts/use-toast';
import { ShareDetails, openShareWindow } from '@/shared/utils/helpers';
import { usePathname } from 'next/navigation';
import Modal from '../modal';

type UseCasesProps = { title: string; description: string }[];
interface Entity extends PropsWithChildren {
  name?: string;
  tags?: string[];
  title: string;
  description?: string;
  usecases?: UseCasesProps;
  prompt?: string;
}

function UseCases({ usecases }: { usecases: UseCasesProps }) {
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
  children,
}: Entity) {

  const toast = useToast();

  const pathName = usePathname()
  const [isShowShareModalOpen, setIsShowModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const isPrompt = title.toLowerCase() === 'prompt';

  async function copyToClipboard(text: string) {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      toast.toast({ title: 'Copied to clipboard' });
    } catch (error) {
      console.error('Failed to copy: ', error);
    }
  }

  const handleShowShareModal = () => {
    setIsShowModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsShowModalOpen(false);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://swarms.world${pathName}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareDetails: ShareDetails = {
    message: "Check out this cool model/prompt/swarm on the swarms platform!",
    link: `https://swarms.world${pathName}`,
    subject: "Check this out!"
  };

  const handleShareWithTweet = () => openShareWindow('twitter', shareDetails);
  const handleShareWithLinkedIn = () => openShareWindow('linkedin', shareDetails);
  const handleShareWithFacebook = () => openShareWindow('facebook', shareDetails);
  const handleShareWithEmail = () => openShareWindow('email', shareDetails);

  return (
    <div className="max-w-6xl px-6 mx-auto">
      <div className="flex flex-col py-16">
        <h2>{title}</h2>

        {name && <h1 className='text-6xl'>{name}</h1>}
        {description && (
          <div className="text-base mt-4 text-gray-400">{description}</div>
        )}

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

        <button className="inline-flex mt-4 w-[11%] items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          onClick={handleShowShareModal}>
          <span className='mr-1'>Share</span>
          <Share2 />
        </button>

      </div>
      {usecases && <UseCases usecases={usecases} />}
      {isPrompt && (
        <div className="relative my-10">
          <ReactMarkdown
            className="bg-gray-800 text-white p-5 py-7 rounded-lg overflow-auto"
            children={prompt ?? ''}
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                  <SyntaxHighlighter
                    PreTag="div"
                    style={darcula}
                    language={match[1]}
                    children={String(children).replace(/\n$/, '')}
                    {...(props as any)}
                  />
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          />
          <Copy
            size={30}
            className="absolute top-2 right-2 p-1 text-primary cursor-pointer"
            onClick={() => copyToClipboard(prompt ?? '')}
          />
        </div>
      )}
      {children}
      {isShowShareModalOpen && (
        <Modal
          isOpen={isShowShareModalOpen}
          onClose={handleCloseModal}
          title="Share the Assets"
          className="flex flex-col items-center justify-center"
        >
          <div className="flex flex-row flex-wrap gap-4 md:gap-8 lg:gap-16">
            <span className="flex flex-col items-center justify-center cursor-pointer" onClick={handleShareWithTweet}>
              <Twitter className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />
              <span className="mt-2 text-sm md:text-base lg:text-lg">Tweet</span>
            </span>
            <span className="flex flex-col items-center justify-center cursor-pointer" onClick={handleShareWithLinkedIn}>
              <Linkedin className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />
              <span className="mt-2 text-sm md:text-base lg:text-lg">Post</span>
            </span>
            <span className="flex flex-col items-center justify-center cursor-pointer" onClick={handleShareWithFacebook}>
              <Facebook className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />
              <span className="mt-2 text-sm md:text-base lg:text-lg">Share</span>
            </span>
            <span className="flex flex-col items-center justify-center cursor-pointer" onClick={handleShareWithEmail}>
              <Send className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />
              <span className="mt-2 text-sm md:text-base lg:text-lg">Email</span>
            </span>
          </div>

          <div className='w-full h-[1px] bg-white' />
          <div className='flex items-start justify-start w-full flex-col'>
            <span>
              Share the link:
            </span>
            <div className="flex items-center justify-start w-full mt-2">
              <input
                type="text"
                readOnly
                className="luma-input w-full border-[1px] rounded-lg p-2"
                value={`https://swarms.world${pathName}`}
              />
              <div className="ticket-share-url-copy ml-2">
                <button
                  className="btn luma-button flex-center medium light solid variant-color-light no-icon"
                  type="button"
                  onClick={handleCopy}
                >
                  <div className="label">{copied ? 'Copied' : 'Copy'}</div>
                </button>
              </div>
            </div>
          </div>

        </Modal>
      )}
    </div>
  );
}
