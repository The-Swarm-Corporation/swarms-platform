'use client';
// Todo: Add the ability to hover over buttons and get copy from text, markdown, and more!
import React, { PropsWithChildren, useState, useTransition } from 'react';
import Card3D, { CardBody, CardItem } from '@/shared/components/3d-card';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Pencil, Share, Star, FileDown, Bookmark } from 'lucide-react'; // Use available icons
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
import Image from 'next/image';
import BookmarkButton from '@/shared/components/bookmark-button';

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

const styles = `
@keyframes gradient-x {
  0%, 100% {
    background-size: 200% 200%;
    background-position: left center;
  }
  50% {
    background-size: 200% 200%;
    background-position: right center;
  }
}

.animate-gradient-x {
  animation: gradient-x 15s ease infinite;
}
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

function UseCases({ usecases }: { usecases: UseCasesProps[] }) {
  const colors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-red-500',
    'from-green-500 to-emerald-500',
    'from-violet-500 to-indigo-500',
  ];

  return (
    <div className="flex flex-col gap-8 py-8">
      <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Use Cases
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {usecases?.map((usecase, index) => {
          const colorClass = colors[index % colors.length];
          return (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-zinc-950 transition-all duration-300"
            >
              {/* Animated border gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${colorClass} animate-gradient-x`}
              />
              <div className="absolute inset-[1px] rounded-2xl bg-zinc-950" />

              {/* Content */}
              <div className="relative p-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-medium text-zinc-100">
                    {usecase?.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {usecase?.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-zinc-800" />
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                  <div className="h-px flex-1 bg-zinc-800" />
                </div>
              </div>
            </div>
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
            <div className="flex flex-wrap gap-2">
              {showEditButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowEditModal}
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowShareModal}
                className="flex items-center gap-2"
              >
                <Share className="h-4 w-4" />
                Share
              </Button>
              {id && user.data?.id && !reviewQuery?.data?.hasReviewed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowReviewModal}
                  className="flex items-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  Rate
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowReviewListModal}
                className="flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                Reviews ({reviewLength})
              </Button>
              <BookmarkButton
                id={id || ''}
                type={entityTitle as 'prompt' | 'agent' | 'tool'}
                name={name || title}
                description={description}
                created_at={new Date().toISOString()}
                username={user?.data?.username || undefined}
                tags={tags}
              />
            </div>
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
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3">
              Main Prompt
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base">
              Copy this prompt or download it to use in ChatGPT, Claude, or in
              your agent code. The prompt is available in both text and markdown
              formats.
            </p>
          </div>
          <div className="bg-[#00000080] border border-[#f9f9f959] shadow-2xl pt-7 md:p-5 md:py-7 rounded-lg leading-normal overflow-hidden no-scrollbar relative">
            <div className="absolute top-3 right-3 flex gap-2 z-10">
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 transition-colors duration-200 border border-zinc-700/50"
                title="Copy to clipboard"
              >
                <Copy size={20} className="text-zinc-200" />
              </button>
              <div className="relative group">
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 transition-colors duration-200 border border-zinc-700/50"
                  title="Download options"
                >
                  <FileDown size={20} className="text-zinc-200" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-zinc-800/95 border border-zinc-700/50 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        downloadFile(
                          prompt ?? '',
                          `${name ?? 'prompt'}.txt`,
                          'text/plain',
                        );
                        toast.toast({ description: 'Downloaded as text file' });
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700/50 transition-colors duration-200"
                    >
                      Download as Text (.txt)
                    </button>
                    <button
                      onClick={() => {
                        downloadFile(
                          prompt ?? '',
                          `${name ?? 'prompt'}.md`,
                          'text/markdown',
                        );
                        toast.toast({
                          description: 'Downloaded as markdown file',
                        });
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700/50 transition-colors duration-200"
                    >
                      Download as Markdown (.md)
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
        </div>
      )}
      {children}
      <ShareModal
        isOpen={isShowShareModalOpen}
        onClose={handleCloseModal}
        link={pathName ?? ''}
      />

      {entityTitle === 'prompt' && prompt && (
        <div className="mt-10 lg:mt-20 flex flex-col w-full">
          <div className="w-full">
            <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
              Prompt Agent Chat
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base mb-8">
              Interact with this prompt in real-time. The AI will respond based
              on the system prompt, allowing you to test and refine the prompt's
              effectiveness.
            </p>
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
