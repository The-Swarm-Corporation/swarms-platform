'use client';

import React, { PropsWithChildren, useState, useTransition } from 'react';
import Card3D, { CardBody, CardItem } from '@/shared/components/3d-card';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Pencil, Share, Star } from 'lucide-react';
import { useToast } from '../ui/Toasts/use-toast';
import { usePathname } from 'next/navigation';
import Avatar from '../avatar';
import { Button } from '../ui/Button';
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
import { useEditorContext } from '../ui/editor.provider';

type UseCasesProps = { title: string; description: string };

type EntityType = 'agent' | 'prompt';

interface Entity extends PropsWithChildren {
  id?: string;
  name?: string;
  tags?: string[];
  title: string;
  language?: string;
  description?: string;
  usecases?: UseCasesProps[];
  prompt?: string;
  requirements?: RequirementProps[];
  userId?: string | null;
}

const sampleModes = [
  { name: 'md', label: 'Markdown' },
  { name: 'txt', label: 'Text' },
  { name: 'other', label: 'Other' },
];

function UseCases({ usecases }: { usecases: UseCasesProps[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-4xl">Use Cases</h2>
      <div className="flex gap-2 flex-col md:flex-row">
        {usecases?.map((usecase) => {
          const classname = usecases?.length === 1 && 'min-h-fit md:min-h-fit';
          return (
            <Card3D containerClassName="flex-1 " className="inter-var w-full">
              <CardBody
                className={cn(
                  'bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto min-h-[255px] md:min-h-[320px] h-fit rounded-xl p-6 border flex flex-col ',
                  classname,
                )}
              >
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-neutral-600 dark:text-white"
                >
                  {usecase?.title}
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                >
                  {usecase?.description}
                </CardItem>
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
}: Entity) {
  const toast = useToast();
  const { handleChange } = useEditorContext();
  const user = trpc.main.getUser.useQuery();
  const reviewQuery = user
    ? trpc.explorer.checkReview.useQuery({ modelId: id ?? '' })
    : null;
  const reviews = trpc.explorer.getReviews.useQuery(id ?? '');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const entityTitle = title.toLowerCase();

  const showEditButton =
    (entityTitle === 'agent' || entityTitle === 'prompt') &&
    user &&
    user?.data?.id === userId;

  const pathName = usePathname();
  const [isShowShareModalOpen, setIsShowModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isReviewModal, setIsReviewModal] = useState(false);
  const [isReviewListModal, setIsReviewListModal] = useState(false);
  const [selectedSampleMode, setSelectedSampleMode] = useState<
    (typeof sampleModes)[number]
  >(sampleModes[0]);

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

  const handleModeChange = (mode: any) => {
    setSelectedSampleMode(mode);
  };

  return (
    <div className="max-w-6xl md:px-6 mx-auto">
      <div className="flex flex-col py-8 md:py-16">
        <div className="max-md:text-center">
          {title && <h2>{title}</h2>}
          {name && <h1 className="text-4xl md:text-6xl my-4">{name}</h1>}
          <Avatar
            userId={userId ?? ''}
            showUsername
            showBorder
            title={`${title ?? ''} Author`}
          />
          {description && (
            <div className="mt-4 text-sm md:text-base text-gray-400">
              {description}
            </div>
          )}

          <div className="flex gap-2 mt-4 select-none flex-wrap">
            {tags &&
              tags.length > 0 &&
              tags?.map(
                (tag) =>
                  tag.trim() && (
                    <div className="text-sm px-2 py-1 rounded-2xl !text-red-500/70 border border-red-500/70">
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
              See reviews
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
      {usecases && <UseCases usecases={usecases} />}
      {title.toLowerCase() === 'agent' && (
        <AgentRequirements requirements={requirements as RequirementProps[]} />
      )}
      {
        prompt && (
          <div className="relative my-10">

            <div className="bg-[#00000080] border border-[#f9f9f959] shadow-2xl pt-7 md:p-5 md:py-7 rounded-lg leading-normal overflow-hidden no-scrollbar">
              <div className="flex gap-1">
                {sampleModes.map((mode) => {
                  return (
                    <button
                      key={mode.name}
                      onClick={() => handleModeChange(mode)}
                      className={cn(
                        `px-3 py-1 text-sm rounded-xl text-muted-foreground border border-transparent`,
                        selectedSampleMode.name === mode.name
                          ? 'border bg-gray-700 text-white'
                          : '',
                      )}
                    >
                      {mode.name}
                    </button>
                  );
                })}
              </div>
              <SyntaxHighlighter
                PreTag={CustomPre}
                style={dracula}
                language={language || 'text'}
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
        )
      }
      {children}
      <ShareModal
        isOpen={isShowShareModalOpen}
        onClose={handleCloseModal}
        link={pathName ?? ''}
      />
    </div>
  );
}
