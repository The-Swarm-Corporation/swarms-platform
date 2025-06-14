'use client';
// Todo: Add the ability to hover over buttons and get copy from text, markdown, and more!
import React, { PropsWithChildren, useState, useTransition } from 'react';
import Card3D, { CardBody, CardItem } from '@/shared/components/3d-card';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Pencil, Share, Star, FileDown } from 'lucide-react'; // Use available icons
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { usePathname } from 'next/navigation';
import Avatar from '@/shared/components/avatar';
import { Button } from '../ui/button';
import AgentRequirements, { RequirementProps } from './agent-requirements';
import ShareModal from '@/modules/platform/explorer/components/share-modal';
import EditExplorerModal from '@/modules/platform/explorer/components/edit-modal';
import { trpc } from '@/shared/utils/trpc/trpc';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import AddRatingModal from '../rating/add-rating';
import ListReview, { ReviewProps } from '../rating/list-rating';
import ReactStars from 'react-rating-star-with-type';
import { getReviewRating } from '../rating/helper';
import { saveAs } from 'file-saver';
import Markdown from 'react-markdown';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import remarkGfm from 'remark-gfm';
import { stripMarkdown } from './helper';
import dynamic from 'next/dynamic';

type UseCasesProps = { title: string; description: string };

type EntityType = 'agent' | 'prompt' | 'tool';

interface Entity extends PropsWithChildren {
  id?: string;
  name?: string;
  tags?: string[];
  title: string;
  language?: string;
  description?: string;
  usecases?: UseCasesProps[];
  prompt?: string;
  imageUrl?: string;
  requirements?: RequirementProps[];
  userId?: string | null;
}

const CommentList = dynamic(() => import('@/shared/components/comments'), {
  ssr: false,
});
const ChatComponent = dynamic(() => import('@/shared/components/chat/prompt'), {
  ssr: false,
});

function UseCases({ usecases }: { usecases: UseCasesProps[] }) {
  return (
    <div className="relative z-10">
      <h2 className="text-4xl font-medium text-white mb-2 tracking-wider">
        Use Cases
        <div className="h-1 w-24 bg-gradient-to-r from-red-500 to-transparent mt-2" />
      </h2>

      <div className="flex gap-6 flex-col lg:flex-row">
        {usecases?.map((usecase, index) => {
          const classname = usecases?.length === 1 && 'min-h-fit md:min-h-fit';

          return (
            <Card3D
              key={index}
              containerClassName="flex-1 group"
              className="w-full"
            >
              <CardBody
                className={cn(
                  'relative overflow-hidden',
                  'bg-black border border-red-500/30',
                  'hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/20',
                  'transition-all duration-500 ease-out',
                  'min-h-[280px] md:min-h-[350px] h-fit',
                  'p-8 flex flex-col',
                  'rounded-lg',
                  'before:absolute before:inset-0 before:bg-gradient-to-br before:from-red-500/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500',
                  'after:absolute after:top-0 after:left-0 after:w-full after:h-[2px] after:bg-gradient-to-r after:from-transparent after:via-red-500 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500',
                  classname,
                )}
              >
                <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-red-500/50" />
                <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-red-500/50" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-red-500/50" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-red-500/50" />

                <div className="relative z-10 flex flex-col h-full">
                  <CardItem
                    translateZ="50"
                    className="text-lg font-medium font-mono text-white mb-4 tracking-wide"
                  >
                    <span className="text-red-400 text-sm mr-2">
                      [{String(index + 1).padStart(2, '0')}]
                    </span>
                    {usecase?.title}
                  </CardItem>

                  <CardItem
                    as="p"
                    translateZ="60"
                    className="text-gray-300 font-mono text-sm leading-relaxed flex-grow"
                  >
                    {usecase?.description}
                  </CardItem>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </CardBody>
            </Card3D>
          );
        })}
      </div>
    </div>
  );
}

const CustomPre = (props: React.HTMLAttributes<HTMLPreElement>) => (
  <pre id="customPreTag" {...props} />
);

export default function EntityComponent({
  id,
  title,
  name,
  tags,
  prompt,
  description,
  usecases,
  language,
  requirements,
  children,
  userId,
  imageUrl,
}: Entity) {
  const toast = useToast();
  const user = trpc.main.getUser.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const reviewQuery = user
    ? trpc.explorer.checkReview.useQuery({ modelId: id ?? '' })
    : null;
  const reviews = trpc.explorer.getReviews.useQuery(id ?? '');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const entityTitle = title.toLowerCase();

  const showEditButton =
    (entityTitle === 'agent' ||
      entityTitle === 'prompt' ||
      entityTitle === 'tool') &&
    user &&
    user?.data?.id === userId;

  const pathName = usePathname();
  const [isShowShareModalOpen, setIsShowModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isReviewModal, setIsReviewModal] = useState(false);
  const [isReviewListModal, setIsReviewListModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('preview');

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

  const handleShowEditModal = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);

  const handleShowReviewModal = () => setIsReviewModal(true);

  const handleShowReviewListModal = () => setIsReviewListModal(true);
  const handleCloseReviewListModal = () => setIsReviewListModal(false);

  function onEditSuccessfully() {
    startTransition(() => {
      router.refresh();
    });
  }

  const { modelRating, reviewLength, reviewTextEnd } = getReviewRating(
    (reviews.data as ReviewProps[]) || [],
  );

  const handleRefetch = () => {
    reviewQuery?.refetch();
    reviews?.refetch();
  };

  const downloadFile = (
    content: string,
    fileName: string,
    fileType: string,
  ) => {
    const blob = new Blob([content], { type: fileType });
    saveAs(blob, fileName);
  };

  const handleCopy = () => {
    let contentToCopy;
    if (selectedTab === 'md') {
      contentToCopy = prompt;
    } else if (selectedTab === 'txt') {
      contentToCopy = stripMarkdown(prompt ?? '');
    } else {
      contentToCopy = prompt;
    }
    copyToClipboard(contentToCopy ?? '');
  };

  const handleDownload = () => {
    let contentToDownload;
    let filename;
    let filetype;
    if (selectedTab === 'md') {
      contentToDownload = prompt;
      filename = `${name ?? 'prompt'}.md`;
      filetype = 'text/markdown';
    } else if (selectedTab === 'txt') {
      contentToDownload = stripMarkdown(prompt ?? '');
      filename = `${name ?? 'prompt'}.txt`;
      filetype = 'text/plain';
    } else {
      contentToDownload = stripMarkdown(prompt ?? '');
      filename = `${name ?? 'prompt'}.csv`;
      filetype = 'text/csv';
    }
    const toastText = filetype.includes('markdown')
      ? 'Downloaded as markdown'
      : filetype.includes('csv')
        ? 'Downloaded as csv'
        : 'Download as plain text';
    downloadFile(contentToDownload ?? '', filename, filetype);
    toast.toast({ description: toastText });
  };
  return (
    <div className="max-w-6xl md:px-6 mx-auto">
      <div className="flex flex-col py-8 md:py-16">
        <div className="max-md:text-center">
          {title && <h2>{title}</h2>}

          <div className="relative group my-5">
            <div className="absolute -inset-0.5 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-x" />
            <div
              className={cn(
                'relative w-full rounded-2xl overflow-hidden',
                imageUrl && 'bg-gradient-to-r from-black to-red-950 p-8',
              )}
              style={{
                backgroundImage: `
        linear-gradient(180deg, rgba(9, 11, 10, 0) 38.11%, rgba(9, 11, 10, 0.8) 88.68%),
        linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
        url(${imageUrl})
      `,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="relative z-10 font-mono">
                {name && (
                  <h1 className="text-4xl md:text-6xl text-white">{name}</h1>
                )}
                {description && (
                  <div
                    style={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    }}
                    className="text-sm mt-2.5 font-medium md:text-base text-white/80 bg-zinc-950/50 p-3 rounded-md border-l-2 border-primary/50 shadow-inner w-fit"
                  >
                    <p className="text-xs italic">{description}</p>
                  </div>
                )}
                <Avatar
                  userId={userId ?? ''}
                  showUsername
                  showBorder
                  className={cn('mt-4', imageUrl && 'mt-6')}
                  title={`${title ?? ''} Author`}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4 select-none flex-wrap">
            {tags &&
              tags.length > 0 &&
              tags?.map(
                (tag) =>
                  tag.trim() && (
                    <div
                      key={tag}
                      className="text-sm px-2 py-1 rounded-2xl !text-red-500/70 border border-red-500/70"
                    >
                      {tag}
                    </div>
                  ),
              )}
          </div>

          <div className="max-md:my-8 mt-2 flex max-md:flex-col max-md:items-center md:w-fit gap-3">
            <Button
              onClick={handleShowShareModal}
              variant="destructive"
              className="mt-3 w-full"
            >
              <Share size={20} />
              <span className="ml-2">Share</span>
            </Button>
            {showEditButton && (
              <Button
                onClick={handleShowEditModal}
                variant="destructive"
                className="mt-3 w-full"
              >
                <Pencil size={20} />
                <span className="ml-2">Edit</span>
              </Button>
            )}
            {id && user.data?.id && !reviewQuery?.data?.hasReviewed && (
              <Button
                onClick={handleShowReviewModal}
                variant="outline"
                className="mt-3 w-full"
              >
                <Star size={20} className="text-yellow-500" />
                <span className="ml-2">Add review</span>
              </Button>
            )}
          </div>

          <div
            className={cn(
              'flex items-center gap-3 w-full invisible',
              reviews?.data && reviews.data?.length > 0 && 'visible',
            )}
          >
            <div className="flex items-center gap-2 my-4 separator">
              <ReactStars value={modelRating} isEdit={false} />
              <div className="flex">
                <span>{reviewLength}</span> <span>review{reviewTextEnd}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              className="underline w-fit p-0 hover:bg-transparent"
              onClick={handleShowReviewListModal}
            >
              Click to See Reviews
            </Button>
          </div>
        </div>

        <ListReview
          reviews={reviews.data as ReviewProps[]}
          isOpen={isReviewListModal}
          onClose={handleCloseReviewListModal}
        />

        {!reviewQuery?.data?.hasReviewed && (
          <AddRatingModal
            id={id ?? ''}
            handleRefetch={handleRefetch}
            open={isReviewModal}
            setOpen={setIsReviewModal}
            modelType={entityTitle}
          />
        )}
        <EditExplorerModal
          entityId={id ?? ''}
          entityType={entityTitle as EntityType}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onEditSuccessfully={onEditSuccessfully}
          key={id}
        />
      </div>
      {usecases && usecases?.some((uc) => uc?.title?.trim() !== '') && (
        <UseCases usecases={usecases} />
      )}
      {title.toLowerCase() === 'agent' ||
        (title.toLowerCase() === 'tool' && (
          <AgentRequirements
            requirements={requirements as RequirementProps[]}
          />
        ))}

      {prompt && (
        <div className="relative my-10">
          <div className="bg-[#00000080] border border-[#f9f9f959] shadow-2xl pt-7 md:p-5 md:py-7 rounded-lg leading-normal overflow-hidden no-scrollbar">
            <div className="mt-7">
              <Tabs
                className="flex  flex-col gap-4 w-auto"
                defaultValue="preview"
                onValueChange={(value) => setSelectedTab(value)}
              >
                <TabsList className="flex justify-start w-auto">
                  <TabsTrigger value={'preview'}>Preview</TabsTrigger>
                  <TabsTrigger value={'md'}>Markdown</TabsTrigger>
                  <TabsTrigger value={'txt'}>Text</TabsTrigger>
                </TabsList>
                <div className="p-4 rounded-xl overflow-hidden !bg-gray-500/10">
                  <TabsContent className="m-0" value={'preview'}>
                    <SyntaxHighlighter
                      PreTag={CustomPre}
                      style={dracula}
                      language={language || 'markdown'}
                      wrapLongLines
                    >
                      {prompt}
                    </SyntaxHighlighter>
                  </TabsContent>
                  <TabsContent className="m-0" value={'md'}>
                    <Markdown className="prose" remarkPlugins={[remarkGfm]}>
                      {prompt}
                    </Markdown>
                  </TabsContent>
                  <TabsContent className="m-0" value={'txt'}>
                    <pre className="whitespace-pre-wrap">
                      {stripMarkdown(prompt)}
                    </pre>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <Copy
              size={30}
              className="p-1 text-primary cursor-pointer"
              onClick={handleCopy}
            />
            <FileDown
              size={30}
              className="p-1 text-primary cursor-pointer"
              onClick={handleDownload}
            />
          </div>
        </div>
      )}
      {children}
      <ShareModal
        isOpen={isShowShareModalOpen}
        onClose={handleCloseModal}
        link={pathName ?? ''}
      />

      {entityTitle === 'prompt' && prompt && (
        <div className="mt-10 lg:mt-20 flex flex-col items-end">
          <div className="w-full lg:w-[90%]">
            <h2 className="mb-5">Prompt Agent Chat</h2>
            <ChatComponent promptId={id ?? ''} systemPrompt={prompt} />
          </div>
        </div>
      )}

      <div className="mt-20">
        {id && <CommentList modelId={id} title={title} />}
      </div>
    </div>
  );
}
