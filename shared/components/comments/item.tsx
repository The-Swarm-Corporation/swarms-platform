import { AArrowDown } from 'lucide-react';
import React, { Dispatch, SetStateAction, useState } from 'react';
import Message from './components/message';
import Comment from './components/comment';
import EditCommentForm from './components/form/edit-comment';
import { Comment as CommentType, Reply as ReplyType } from './types';
import { cn } from '@/shared/utils/cn';

interface CommentItemsProps {
  comment: CommentType;
  isComment: boolean;
  repliesCount: number;
  title: string;
  openEditComment: boolean;
  allReplies: ReplyType[];
  handleCommentId: (id: string) => void;
  refetchComments: () => void;
  refetchLikes: () => void;
  handleDeleteComment: () => void;
  handleEditOpenComment: () => void;
  handleOpenReply: () => void;
  setOpenEditComment: Dispatch<SetStateAction<boolean>>;
}

export default function CommentItem({
  comment,
  isComment,
  allReplies,
  repliesCount,
  title,
  openEditComment,
  handleDeleteComment,
  handleEditOpenComment,
  handleOpenReply,
  setOpenEditComment,
  refetchComments,
  refetchLikes,
  handleCommentId,
}: CommentItemsProps) {
  const [expandComment, setExpandComment] = useState(true);

  function handleExpandComment() {
    setExpandComment(true);
  }

  function handleCloseExpanded() {
    setExpandComment(false);
  }

  return (
    <li key={comment.id} onClick={() => handleCommentId(comment.id)}>
      {!expandComment && (
        <div className="flex items-center gap-4 w-full mb-2 md:mb-3 py-3 px-4 md:p-4 bg-secondary rounded-md">
          <AArrowDown
            onClick={handleExpandComment}
            size={20}
            className="cursor-pointer"
          />
          <div className="italic max-md:text-xs">
            {comment?.users?.full_name}{' '}
            {repliesCount && `+ ${repliesCount} replies`}
          </div>
        </div>
      )}
      <div className={cn('w-full', !expandComment ? 'hidden' : 'block')}>
        <Message
          comment={comment}
          type="comment"
          handleCloseExpanded={handleCloseExpanded}
          handleDelete={handleDeleteComment}
          handleEdit={handleEditOpenComment}
          handleOpenReply={handleOpenReply}
          refetchLikes={refetchLikes}
        >
          <Comment
            comment={comment}
            allReplies={allReplies}
            modelType={title}
            refetchComments={refetchComments}
            refetchLikes={refetchLikes}
          />
        </Message>
      </div>
      {isComment && openEditComment && (
        <EditCommentForm
          key={comment.id}
          open={openEditComment}
          editableContent={comment?.content || ''}
          setOpen={setOpenEditComment}
          commentId={comment.id}
          refetchReplies={refetchComments}
        />
      )}
    </li>
  );
}
