import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import CommentForm from './components/form/comment';
import { Comment as CommentType } from './types';
import { trpc } from '@/shared/utils/trpc/trpc';
import dynamic from 'next/dynamic';
import Message from './components/message';
import EditCommentForm from './components/form/edit-comment';
import DeleteContent from './components/form/delete';
import ReplyForm from './components/form/reply';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import CommentsSkeleton from '@/shared/components/loaders/comments-skeleton';
import { AArrowDown } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import CommentItem from './item';

interface CommentListProps {
  modelId: string;
  title: string;
}

const Comment = dynamic(() => import('./components/comment'), {
  ssr: false,
});
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
  const [expandComment, setExpandComment] = useState(true);

  const commentsQuery = trpc.explorerOptions.getComments.useQuery({
    modelId,
    limit: commentsLimit,
    offset,
  });

  const deleteCommentMutation =
    trpc.explorerOptions.deleteComment.useMutation();

  function handleExpandComment() {
    setExpandComment(true);
  }

  function handleCloseExpanded() {
    setExpandComment(false);
  }

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

  console.log({ comments });

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

  return (
    <div className="max-w-[800px] w-full">
      <h3 className="my-3">{title} comments</h3>

      <CommentForm
        modelId={modelId}
        refetchComments={refetchComments}
        title={title}
      />

      {commentsQuery.isLoading ? (
        <CommentsSkeleton />
      ) : (
        <ul className="p-0 my-8">
          {comments?.map((comment) => {
            const repliesCount =
              comment?.swarms_cloud_comments_replies?.length || 0;
            const isComment = commentId === comment.id;
            return (
              <CommentItem
                key={comment.id}
                comment={comment}
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
