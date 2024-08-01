import React, { useMemo, useState } from 'react';
import { Comment as CommentType, Reply as ReplyType } from '../types';
import Message from './message';
import { trpc } from '@/shared/utils/trpc/trpc';
import ReplyForm from './form/reply';
import EditReplyForm from './form/edit-reply';
import DeleteContent from './form/delete';
import { useAuthContext } from '@/shared/components/ui/auth.provider';
import { useToast } from '@/shared/components/ui/Toasts/use-toast';
import { Button } from '../../ui/Button';

interface CommentProps {
  comment: CommentType;
  modelType: string;
  allReplies: ReplyType[];
  refetchComments: () => void;
  refetchLikes?: () => void;
}

const repliesLimit = 6;
export default function Comment({
  comment,
  modelType,
  allReplies,
  refetchLikes,
  refetchComments,
}: CommentProps) {
  const { user } = useAuthContext();
  const toast = useToast();

  const [replyOffset, setReplyOffset] = useState(0);
  const [openReply, setOpenReply] = useState(false);
  const [openEditReply, setOpenEditReply] = useState(false);
  const [openDeleteReply, setOpenDeleteReply] = useState(false);
  const [replyId, setReplyId] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteReplyMutation = trpc.explorerOptions.deleteReply.useMutation();

  function handleOpenReply() {
    setOpenReply(true);
  }

  function handleEditOpenReply() {
    setOpenEditReply(true);
  }

  function handleDeleteReply() {
    setOpenDeleteReply(true);
  }

  function handleReplyId(id: string) {
    setReplyId(id);
  }

  function handleRemoveReply() {
    if (!user) {
      toast.toast({
        description: 'Log in to perform this action',
        style: { color: 'red' },
      });
      return;
    }

    if (!replyId) return;

    setIsDeleting(true);

    deleteReplyMutation
      .mutateAsync(replyId)
      .then((res) => {
        if (res.success) {
          toast.toast({
            description: 'Reply deleted successfully',
            style: { color: 'green' },
          });
          setOpenDeleteReply(false);
          refetchComments();
        }
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

  const replies = useMemo(() => {
    return allReplies
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
      .slice(0, replyOffset + repliesLimit);
  }, [allReplies, replyOffset]);

  const loadMoreReplies = () => {
    setReplyOffset((prevOffset) => prevOffset + repliesLimit);
  };

  const diffReplies = allReplies.length - replies.length;

  return (
    <div className="my-5 flex justify-end w-full">
      <ul className="p-0 w-full max-w-[750px] flex flex-col gap-3">
        {replies?.map((reply) => (
          <li
            key={reply.id}
            className="w-full"
            onClick={() => handleReplyId(reply.id)}
          >
            <Message
              comment={reply}
              type="reply"
              handleDelete={handleDeleteReply}
              handleEdit={handleEditOpenReply}
              handleOpenReply={handleOpenReply}
              refetchLikes={refetchLikes}
            />
            {reply.id === replyId && openEditReply && (
              <EditReplyForm
                key={reply.id}
                open={openEditReply}
                editableContent={reply?.content || ''}
                setOpen={setOpenEditReply}
                replyId={reply.id}
                refetchReplies={refetchComments}
              />
            )}
          </li>
        ))}
        {replies.length < allReplies.length && (
          <div className="flex justify-end mb-6">
            <Button
              onClick={loadMoreReplies}
              variant="outline"
              className="h-8 rounded-sm"
            >
              Load more{' '}
              <span className="ml-2 italic">+ {diffReplies} replies</span>
            </Button>
          </div>
        )}
      </ul>
      <ReplyForm
        commentId={comment.id}
        modelType={modelType}
        open={openReply}
        setOpen={setOpenReply}
        refetchReplies={refetchComments}
      />
      <DeleteContent
        type="reply"
        isLoading={isDeleting}
        openDialog={openDeleteReply}
        handleClick={handleRemoveReply}
        setOpenDialog={setOpenDeleteReply}
      />
    </div>
  );
}
