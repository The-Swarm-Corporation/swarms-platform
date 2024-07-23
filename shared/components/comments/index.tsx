import React, { useState, useEffect } from 'react';
import CommentForm from './components/form/comment';
import { Comment as CommentType } from './types';
import { trpc } from '@/shared/utils/trpc/trpc';
import DeleteContent from './components/form/delete';
import ReplyForm from './components/form/reply';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import CommentsSkeleton, {
  CommentsItemSkeleton,
} from '@/shared/components/loaders/comments-skeleton';
import CommentItem from './item';
import { Button } from '../ui/Button';
import LoadingSpinner from '../loading-spinner';

interface CommentListProps {
  modelId: string;
  title: string;
}

const commentsLimit = 20;
export default function CommentList({ modelId, title }: CommentListProps) {
  const { user } = useAuthContext();
  const toast = useToast();

  const [comments, setComments] = useState<CommentType[]>([]);
  const [offset, setOffset] = useState(0);
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const [openEditComment, setOpenEditComment] = useState(false);
  const [openDeleteComment, setOpenDeleteComment] = useState(false);
  const [commentId, setCommentId] = useState('');
  const [openReply, setOpenReply] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const commentsQuery = trpc.explorerOptions.getComments.useQuery({
    modelId,
    limit: commentsLimit,
    offset,
  });

  const deleteCommentMutation =
    trpc.explorerOptions.deleteComment.useMutation();

  function handleOpenReply() {
    setOpenReply(true);
  }

  function handleEditOpenComment() {
    setOpenEditComment(true);
  }

  function handleDeleteComment() {
    setOpenDeleteComment(true);
  }

  function handleCommentId(id: string) {
    setCommentId(id);
  }

  useEffect(() => {
    if (commentsQuery.data) {
      if (offset === 0) {
        setComments(commentsQuery.data?.comments);
      } else {
        setComments((prev) => [...prev, ...commentsQuery.data?.comments]);
      }
      setIsFetchingComments(false);
    }
  }, [commentsQuery.data, offset]);

  const loadMoreComments = () => {
    setOffset((prevOffset) => prevOffset + commentsLimit);
    setIsFetchingComments(true);
  };

  function refetchComments() {
    return commentsQuery.refetch();
  }

  function handleRemoveComment() {
    if (!user) {
      toast.toast({
        description: 'Log in to perform this action',
        style: { color: 'red' },
      });
      return;
    }

    if (!commentId) return;

    setIsDeleting(true);

    deleteCommentMutation
      .mutateAsync(commentId)
      .then((res) => {
        toast.toast({
          description: 'Comment deleted successfully',
          style: { color: 'green' },
        });
        setOpenDeleteComment(false);
        refetchComments();
      })
      .catch((err) => {
        console.error(err);
        toast.toast({
          description:
            err?.data?.message || err?.message || 'Error deleting reply',
          variant: 'destructive',
        });
      })
      .finally(() => setIsDeleting(false));
  }

  const totalCount = commentsQuery.data?.count || 0;
  const remainingComments = totalCount - comments.length;

  return (
    <div className="max-w-[800px] w-full">
      <h3 className="my-3 text-2xl">
        {title} comments {totalCount > 0 && `(${totalCount})`}
      </h3>

      <CommentForm
        modelId={modelId}
        refetchComments={refetchComments}
        title={title}
      />

      {commentsQuery.isLoading && !isFetchingComments ? (
        <CommentsSkeleton />
      ) : (
        <ul className="p-0 my-8">
          {comments?.map((comment) => {
            const repliesCount =
              comment?.swarms_cloud_comments_replies?.length || 0;
            const isComment = commentId === comment.id;
            return (
              <CommentItem
                key={comment?.id}
                comment={comment}
                allReplies={comment?.swarms_cloud_comments_replies}
                isComment={isComment}
                title={title}
                repliesCount={repliesCount}
                openEditComment={openEditComment}
                setOpenEditComment={setOpenEditComment}
                refetchComments={refetchComments}
                handleCommentId={handleCommentId}
                handleDeleteComment={handleDeleteComment}
                handleEditOpenComment={handleEditOpenComment}
                handleOpenReply={handleOpenReply}
              />
            );
          })}
        </ul>
      )}
      {isFetchingComments && (
        <div className="mt-4">
          <CommentsItemSkeleton />
        </div>
      )}
      {(comments.length < totalCount || isFetchingComments) && (
        <div className="flex justify-end mb-6">
          <Button
            onClick={loadMoreComments}
            variant="outline"
            disabled={isFetchingComments}
            className="h-8 rounded-sm"
          >
            <span className="italic flex items-center">
              <span>Load more</span>{' '}
              <span className="ml-2 italic">
                {isFetchingComments ? (
                  <LoadingSpinner />
                ) : (
                  `+ ${remainingComments} comments`
                )}
              </span>
            </span>
          </Button>
        </div>
      )}
      <ReplyForm
        commentId={commentId}
        modelType={title}
        open={openReply}
        setOpen={setOpenReply}
        refetchReplies={refetchComments}
      />
      <DeleteContent
        type="comment"
        isLoading={isDeleting}
        openDialog={openDeleteComment}
        handleClick={handleRemoveComment}
        setOpenDialog={setOpenDeleteComment}
      />
    </div>
  );
}
