import React, { useState, useRef } from 'react';
import CommentForm from './components/form/comment';
import { trpc } from '@/shared/utils/trpc/trpc';
import DeleteContent from './components/form/delete';
import ReplyForm from './components/form/reply';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import CommentsSkeleton from '@/shared/components/loaders/comments-skeleton';
import CommentItem from './item';
import usefetchCommentsWithLikes from './hook';

interface CommentListProps {
  modelId: string;
  title: string;
}

const commentsLimit = 200;
const offset = 0;
export default function CommentList({ modelId, title }: CommentListProps) {
  const { user } = useAuthContext();
  const toast = useToast();

  console.log({ id: user?.id });
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const [openEditComment, setOpenEditComment] = useState(false);
  const [openDeleteComment, setOpenDeleteComment] = useState(false);
  const [commentId, setCommentId] = useState('');
  const [openReply, setOpenReply] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    commentsData,
    commentsResponse,
    commentLikesResponse,
    replyLikesResponse,
  } = usefetchCommentsWithLikes(modelId, commentsLimit, offset, user?.id || '');

  const totalCount = commentsResponse.data?.count || 0;

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

  function refetchComments() {
    return commentsResponse.refetch();
  }

  function refetchLikes() {
    commentsResponse.refetch();
    commentLikesResponse.refetch();
    replyLikesResponse.refetch();
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
      .then(() => {
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
      <h3 className="my-3 text-2xl">
        {title} comments {totalCount > 0 && `(${totalCount})`}
      </h3>

      <CommentForm
        modelId={modelId}
        title={title}
        commentsEndRef={commentsEndRef}
        refetchComments={refetchComments}
      />

      {commentsResponse.isLoading ? (
        <CommentsSkeleton />
      ) : (
        <ul className="p-0 my-8">
          {commentsData?.map((comment) => {
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
                refetchLikes={refetchLikes}
                handleCommentId={handleCommentId}
                handleDeleteComment={handleDeleteComment}
                handleEditOpenComment={handleEditOpenComment}
                handleOpenReply={handleOpenReply}
              />
            );
          })}
          <div ref={commentsEndRef} />
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
