import React, { useState, useEffect } from 'react';
import LikeButton from './like-button';
import ReplyForm from './form/reply';
import ReplyComponent from './reply';
import { Comment as CommentType, Reply as ReplyType } from '../types';

interface CommentProps {
  comment: CommentType;
}

export default function Comment({ comment }: CommentProps) {
  const [replies, setReplies] = useState<ReplyType[]>([]);
  const [replyPage, setReplyPage] = useState(0);
  const [replyTotal, setReplyTotal] = useState(0);
  const limit = 5;

  async function getReplies() {}

  const fetchReplies = async () => {
    await getReplies();
    setReplies(replies);
    // setReplyTotal(count);
  };

  useEffect(() => {
    fetchReplies();
  }, [replyPage]);

  return (
    <div>
      <p>{comment.content}</p>
      <LikeButton itemId={comment.id} type="comment" />
      <ReplyForm commentId={comment.id} refetchReplies={fetchReplies} />
      {replies.map((reply) => (
        <ReplyComponent key={reply.id} reply={reply} />
      ))}
      <div>
        <button
          onClick={() => setReplyPage((prev) => Math.max(prev - 1, 0))}
          disabled={replyPage === 0}
        >
          Previous
        </button>
        <button
          onClick={() => setReplyPage((prev) => prev + 1)}
          disabled={(replyPage + 1) * limit >= replyTotal}
        >
          Next
        </button>
      </div>
    </div>
  );
}
